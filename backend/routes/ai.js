import express from "express";
import Product from "../models/Product.js";
import { verifyToken } from "../middleware/auth.js";
import { generateTags, reviewOutfit, suggestStyles } from "../services/openai.js";

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

router.post("/outfit-review", verifyToken, async (req, res, next) => {
  try {
    const review = await reviewOutfit(req.body);
    return res.json({ review });
  } catch (error) {
    return next(error);
  }
});

export default router;
