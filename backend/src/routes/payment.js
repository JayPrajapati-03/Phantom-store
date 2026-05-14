import crypto from "crypto";
import express from "express";
import { createRequire } from "module";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { verifyToken } from "../middleware/auth.js";

const require = createRequire(import.meta.url);
const Razorpay = require("razorpay");

const router = express.Router();

let razorpayInstance = null;

const maskKey = (value = "") => {
  const trimmed = String(value).trim();
  if (trimmed.length <= 8) return trimmed;
  return `${trimmed.slice(0, 8)}...${trimmed.slice(-4)}`;
};

function getRazorpay() {
  if (!razorpayInstance) {
    const keyId = String(process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = String(process.env.RAZORPAY_KEY_SECRET || "").trim();

    if (!keyId || !keySecret) {
      throw Object.assign(new Error("Razorpay credentials are missing"), { status: 500 });
    }

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }

  return razorpayInstance;
}

router.post("/create-order", verifyToken, async (req, res, next) => {
  try {
    const { amount, currency = "INR", items = [] } = req.body;
    const totalAmount = Math.round(Number(amount));

    if (!totalAmount || totalAmount < 100) {
      return res.status(400).json({ message: "Amount must be at least Rs. 1 (100 paise)" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).select("_id price stock");
    const productMap = new Map(products.map((product) => [String(product._id), product]));

    for (const item of items) {
      const product = productMap.get(String(item.productId));

      if (!product) {
        return res.status(400).json({
          message: "Some cart items are no longer available. Please review your cart and try again."
        });
      }

      const quantity = Math.max(Number(item.quantity) || 1, 1);
      if (product.stock < quantity) {
        return res.status(400).json({
          message: "Some cart items do not have enough stock. Please review your cart and try again."
        });
      }
    }

    const verifiedAmount = items.reduce((sum, item) => {
      const product = productMap.get(String(item.productId));
      const quantity = Math.max(Number(item.quantity) || 1, 1);
      return sum + Number(product.price) * quantity;
    }, 0);

    if (Math.round(verifiedAmount * 100) !== totalAmount) {
      return res.status(400).json({
        message: "Cart total changed. Please review your cart and try again."
      });
    }

    const options = {
      amount: totalAmount,
      currency: currency.toUpperCase(),
      receipt: `rcpt_${String(req.user._id).slice(-8)}_${Date.now().toString(36)}`,
      notes: {
        userId: String(req.user._id)
      }
    };

    console.log("Creating Razorpay order with options:", options);
    const order = await getRazorpay().orders.create(options);
    const keyId = String(process.env.RAZORPAY_KEY_ID || "").trim();

    console.log("Razorpay order created:", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: maskKey(keyId),
      receipt: options.receipt
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    return next(error);
  }
});

router.post("/verify-payment", verifyToken, async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (existingOrder) {
      return res.json({ success: true, order: existingOrder });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed - invalid signature" });
    }

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((product) => [String(product._id), product]));

    const orderItems = items.map((item) => {
      const product = productMap.get(String(item.productId));
      if (!product) {
        throw Object.assign(new Error(`Product not found: ${item.productId}`), { status: 400 });
      }

      const quantity = Math.max(Number(item.quantity) || 1, 1);
      return {
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url || "",
        price: product.price,
        quantity
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      total,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "paid"
    });

    await Promise.all(
      orderItems.map((item) =>
        Product.updateOne({ _id: item.productId }, { $inc: { stock: -item.quantity } })
      )
    );

    return res.json({ success: true, order });
  } catch (error) {
    return next(error);
  }
});

export default router;
