import express from "express";
import Order from "../models/Order.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// Order creation is handled inside POST /api/payment/verify-payment
// so that orders only exist after cryptographic payment verification.
// The routes below are read / update operations only.
// ---------------------------------------------------------------------------

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
