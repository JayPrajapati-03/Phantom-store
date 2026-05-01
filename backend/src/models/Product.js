import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: "text"
    },
    description: {
      type: String,
      required: true,
      trim: true,
      index: "text"
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" }
      }
    ],
    modelUrl: {
      type: String,
      required: true
    },
    arCategory: {
      type: String,
      enum: ["glasses", "hat", "shirt", "jacket", "shoes", "watch", "ring", "bag"],
      required: true,
      index: true
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true
    },
    aiTags: [
      {
        type: String,
        lowercase: true,
        trim: true,
        index: true
      }
    ],
    stock: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", aiTags: "text", category: "text" });

export default mongoose.model("Product", productSchema);
