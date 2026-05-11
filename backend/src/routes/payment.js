import crypto from "crypto";
import express from "express";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ---------------------------------------------------------------------------
// POST /api/payment/create-order
// Creates a Razorpay order and returns order details to the frontend.
// The frontend uses these to open the Razorpay Checkout modal.
// ---------------------------------------------------------------------------
router.post("/create-order", verifyToken, async (req, res, next) => {
  try {
    const { amount, currency = "INR" } = req.body;

    if (!amount || Number(amount) < 100) {
      return res.status(400).json({ message: "Amount must be at least ₹1 (100 paise)" });
    }

    const options = {
      amount: Math.round(Number(amount)),
      currency: currency.toUpperCase(),
      receipt: `rcpt_${req.user._id}_${Date.now()}`,
      notes: {
        userId: String(req.user._id)
      }
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    return next(error);
  }
});

// ---------------------------------------------------------------------------
// POST /api/payment/verify-payment
// 1. Verifies the Razorpay payment signature using HMAC SHA256.
// 2. Creates the order in MongoDB ONLY after successful verification.
// 3. Decrements product stock.
// Never trust frontend payment success — always verify server-side.
// ---------------------------------------------------------------------------
router.post("/verify-payment", verifyToken, async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items
    } = req.body;

    // --- Validate required fields -------------------------------------------
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    // --- Idempotency: prevent duplicate order creation -----------------------
    const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (existingOrder) {
      return res.json({ success: true, order: existingOrder });
    }

    // --- Signature verification using HMAC SHA256 ----------------------------
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed — invalid signature" });
    }

    // --- Build order items from verified product data ------------------------
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

    // --- Create the order ----------------------------------------------------
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      total,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "paid"
    });

    // --- Decrement stock -----------------------------------------------------
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
