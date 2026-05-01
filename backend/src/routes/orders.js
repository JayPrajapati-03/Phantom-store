import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { items, stripePaymentId, status = "paid" } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    if (!stripePaymentId) {
      return res.status(400).json({ message: "stripePaymentId is required" });
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
      stripePaymentId,
      status
    });

    await Promise.all(
      orderItems.map((item) =>
        Product.updateOne({ _id: item.productId }, { $inc: { stock: -item.quantity } })
      )
    );

    return res.status(201).json({ order });
  } catch (error) {
    return next(error);
  }
});

router.get("/my", verifyToken, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (error) {
    return next(error);
  }
});

router.get("/", verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (error) {
    return next(error);
  }
});

router.get("/:userId", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role !== "admin" && String(req.user._id) !== req.params.userId) {
      return res.status(403).json({ message: "You can only view your own orders" });
    }

    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id/status", verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ order });
  } catch (error) {
    return next(error);
  }
});

export default router;
