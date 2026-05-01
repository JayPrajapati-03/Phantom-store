import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Store from "../models/Store.js";
import { verifyToken, requireMerchantOrAdmin } from "../middleware/auth.js";

const router = express.Router();

const isInvalidId = (id) => !mongoose.isValidObjectId(id);

const canManageStore = (user, store) => user.role === "admin" || String(store.ownerId) === String(user._id);

router.get("/", async (req, res, next) => {
  try {
    const { q, ownerId, page = 1, limit = 24 } = req.query;
    const filter = {};

    if (ownerId) {
      if (isInvalidId(ownerId)) {
        return res.status(400).json({ message: "Invalid owner id" });
      }
      filter.ownerId = ownerId;
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ];
    }

    const numericLimit = Math.min(Number(limit) || 24, 100);
    const numericPage = Math.max(Number(page) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [stores, count] = await Promise.all([
      Store.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(numericLimit)
        .populate("ownerId", "name email")
        .populate("products", "name price images category stock"),
      Store.countDocuments(filter)
    ]);

    return res.json({
      stores,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total: count,
        pages: Math.ceil(count / numericLimit)
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/my", verifyToken, requireMerchantOrAdmin, async (req, res, next) => {
  try {
    const stores = await Store.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("products", "name price images category stock");

    return res.json({ stores });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (isInvalidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid store id" });
    }

    const store = await Store.findById(req.params.id)
      .populate("ownerId", "name email")
      .populate("products", "name description price images category arCategory stock");

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    return res.json({ store });
  } catch (error) {
    return next(error);
  }
});

router.post("/", verifyToken, requireMerchantOrAdmin, async (req, res, next) => {
  try {
    const { name, description = "" } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Store name is required" });
    }

    const store = await Store.create({
      ownerId: req.user._id,
      name,
      description
    });

    return res.status(201).json({ store });
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", verifyToken, requireMerchantOrAdmin, async (req, res, next) => {
  try {
    if (isInvalidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid store id" });
    }

    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    if (!canManageStore(req.user, store)) {
      return res.status(403).json({ message: "You can only update your own store" });
    }

    const allowedUpdates = ["name", "description"];
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        store[field] = req.body[field];
      }
    }

    await store.save();
    return res.json({ store });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", verifyToken, requireMerchantOrAdmin, async (req, res, next) => {
  try {
    if (isInvalidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid store id" });
    }

    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    if (!canManageStore(req.user, store)) {
      return res.status(403).json({ message: "You can only delete your own store" });
    }

    await Promise.all([
      Product.deleteMany({ storeId: store._id }),
      Store.deleteOne({ _id: store._id })
    ]);

    return res.json({ message: "Store deleted" });
  } catch (error) {
    return next(error);
  }
});

export default router;
