import express from "express";
import Product from "../models/Product.js";
import Store from "../models/Store.js";
import { verifyToken, requireMerchantOrAdmin } from "../middleware/auth.js";
import { generateTags } from "../services/openai.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { q, category, arCategory, storeId, minPrice, maxPrice, page = 1, limit = 24 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (arCategory) filter.arCategory = arCategory;
    if (storeId) filter.storeId = storeId;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { aiTags: { $regex: q, $options: "i" } }
      ];
    }

    const numericLimit = Math.min(Number(limit) || 24, 100);
    const skip = (Math.max(Number(page), 1) - 1) * numericLimit;

    const [products, count] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(numericLimit).populate("storeId", "name"),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: numericLimit,
        total: count,
        pages: Math.ceil(count / numericLimit)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const { q = "" } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { aiTags: { $regex: q, $options: "i" } }
      ]
    }).limit(40);

    res.json({ products });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("storeId", "name description");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ product });
  } catch (error) {
    return next(error);
  }
});

router.post("/", verifyToken, requireMerchantOrAdmin, async (req, res, next) => {
  try {
    const payload = req.body;
    const store = await Store.findById(payload.storeId);

    if (!store) {
      return res.status(400).json({ message: "Store not found" });
    }

    if (req.user.role !== "admin" && String(store.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only add products to your own store" });
    }

    const aiTags = payload.aiTags?.length
      ? payload.aiTags
      : await generateTags({
          name: payload.name,
          description: payload.description,
          category: payload.category,
          arCategory: payload.arCategory
        });

    const product = await Product.create({ ...payload, aiTags });
    store.products.addToSet(product._id);
    await store.save();

    return res.status(201).json({ product });
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", verifyToken, requireMerchantOrAdmin, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("storeId");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.user.role !== "admin" && String(product.storeId.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only update products in your store" });
    }

    Object.assign(product, req.body);

    if (!req.body.aiTags && (req.body.name || req.body.description || req.body.category || req.body.arCategory)) {
      product.aiTags = await generateTags(product);
    }

    await product.save();
    return res.json({ product });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", verifyToken, requireMerchantOrAdmin, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("storeId");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.user.role !== "admin" && String(product.storeId.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only delete products in your store" });
    }

    await Product.deleteOne({ _id: product._id });
    await Store.updateOne({ _id: product.storeId._id }, { $pull: { products: product._id } });

    return res.json({ message: "Product deleted" });
  } catch (error) {
    return next(error);
  }
});

export default router;
