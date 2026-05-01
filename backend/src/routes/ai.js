import express from "express";
import Product from "../models/Product.js";
import { verifyToken } from "../middleware/auth.js";
import {
  generateTags,
  reviewOutfit,
  suggestComplementaryCategories,
  suggestStyles
} from "../services/openai.js";

const router = express.Router();

router.post("/style-suggest", verifyToken, async (req, res, next) => {
  try {
    const suggestions = await suggestStyles(req.body);
    return res.json({ suggestions });
  } catch (error) {
    return next(error);
  }
});

router.post("/semantic-search", async (req, res, next) => {
  try {
    const { query, limit = 12 } = req.body;

    if (!query) {
      return res.status(400).json({ message: "query is required" });
    }

    const tags = await generateTags({ name: query, description: query, category: "search" });
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { aiTags: { $in: tags } }
      ]
    }).limit(Math.min(Number(limit) || 12, 50));

    return res.json({ products, tags });
  } catch (error) {
    return next(error);
  }
});

router.post("/suggest", async (req, res, next) => {
  try {
    const { productId, category } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const result = await suggestComplementaryCategories({
      productName: product.name,
      productCategory: product.category,
      category
    });

    const categories = result.suggestions
      .map((item) => String(item).trim())
      .filter(Boolean)
      .filter((item, index, array) => array.indexOf(item) === index);

    const suggested = await Product.find({
      _id: { $ne: product._id },
      category: { $in: categories }
    }).limit(6);

    return res.json({
      products: suggested,
      reason: result.reason,
      suggestions: categories
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/outfit-review", verifyToken, async (req, res, next) => {
  try {
    const review = await reviewOutfit(req.body);
    return res.json({ review });
  } catch (error) {
    return next(error);
  }
});

export default router;
