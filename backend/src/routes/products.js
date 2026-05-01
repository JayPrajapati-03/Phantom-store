import express from "express";
import multer from "multer";
import Product from "../models/Product.js";
import Store from "../models/Store.js";
import { verifyToken, requireMerchantOrAdmin } from "../middleware/auth.js";
import { uploadImage, uploadModel } from "../services/cloudinary.js";
import { generateTags, rankProductsForSearch } from "../services/openai.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 12
  }
});

const productUpload = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "image", maxCount: 1 },
  { name: "model", maxCount: 1 },
  { name: "glb", maxCount: 1 }
]);

const toArray = (value) => {
  if (value === undefined || value === null || value === "") return [];
  return Array.isArray(value) ? value : [value];
};

const parseJsonField = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizeImages = (value) =>
  toArray(parseJsonField(value))
    .flatMap((item) => (Array.isArray(item) ? item : [item]))
    .map((item) => {
      if (typeof item === "string") {
        return { url: item, publicId: "" };
      }

      return item;
    })
    .filter((item) => item?.url);

const normalizeTags = (value) =>
  toArray(parseJsonField(value))
    .flatMap((item) => (typeof item === "string" ? item.split(",") : [item]))
    .map((tag) => String(tag).toLowerCase().trim())
    .filter(Boolean);

const buildProductPayload = async (body, files = {}) => {
  const payload = { ...body };
  const imageFiles = [...(files.images || []), ...(files.image || [])];
  const modelFile = files.model?.[0] || files.glb?.[0];

  if (payload.price !== undefined) payload.price = Number(payload.price);
  if (payload.stock !== undefined) payload.stock = Number(payload.stock);

  if (payload.images !== undefined) {
    payload.images = normalizeImages(payload.images);
  }

  if (payload.aiTags !== undefined) {
    payload.aiTags = normalizeTags(payload.aiTags);
  }

  if (imageFiles.length) {
    const uploadedImages = await Promise.all(imageFiles.map((file) => uploadImage(file)));
    payload.images = [...(payload.images || []), ...uploadedImages.map(({ url, publicId }) => ({ url, publicId }))];
  }

  if (modelFile) {
    const uploadedModel = await uploadModel(modelFile);
    payload.modelUrl = uploadedModel.url;
  }

  return payload;
};

router.get("/", async (req, res, next) => {
  try {
    const { q, category, arCategory, storeId, price, minPrice, maxPrice, page = 1, limit = 24 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (arCategory) filter.arCategory = arCategory;
    if (storeId) filter.storeId = storeId;
    if (price) {
      filter.price = Number(price);
    } else if (minPrice || maxPrice) {
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

    if (!q.trim()) {
      return res.status(400).json({ message: "q is required" });
    }

    const allProducts = await Product.find({})
      .select("name description category aiTags images price modelUrl arCategory stock storeId createdAt")
      .lean();

    const rankedIds = await rankProductsForSearch({ query: q, products: allProducts });
    const rankedProducts = new Map(allProducts.map((product) => [String(product._id), product]));
    const orderedProducts = rankedIds.map((id) => rankedProducts.get(id)).filter(Boolean);

    return res.json({ products: orderedProducts });
  } catch (error) {
    return next(error);
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

router.post("/", verifyToken, requireMerchantOrAdmin, productUpload, async (req, res, next) => {
  try {
    const payload = await buildProductPayload(req.body, req.files);
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

router.put("/:id", verifyToken, requireMerchantOrAdmin, productUpload, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("storeId");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.user.role !== "admin" && String(product.storeId.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only update products in your store" });
    }

    const payload = await buildProductPayload(req.body, req.files);

    Object.assign(product, payload);

    if (!payload.aiTags && (payload.name || payload.description || payload.category || payload.arCategory)) {
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
