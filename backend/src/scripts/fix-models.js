import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

const OLD_URL = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
const DUCK_URL = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb";
const BOX_URL = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb";
const CATEGORY_MODEL_TOKENS = {
  glasses: "__procedural_glasses__",
  hat: "__procedural_hat__",
  shirt: "__procedural_shirt__",
  jacket: "__procedural_jacket__",
  shoes: "__procedural_shoes__",
  watch: "__procedural_watch__",
  ring: "__procedural_ring__",
  bag: "__procedural_bag__"
};

const fixModels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const updates = await Promise.all(
      Object.entries(CATEGORY_MODEL_TOKENS).map(async ([arCategory, modelUrl]) => {
        const result = await Product.updateMany(
          {
            arCategory,
            modelUrl: { $in: [OLD_URL, DUCK_URL, BOX_URL] }
          },
          { $set: { modelUrl } }
        );

        return { arCategory, count: result.modifiedCount };
      })
    );

    updates.forEach(({ arCategory, count }) => {
      console.log(`Updated ${count} ${arCategory} products to ${CATEGORY_MODEL_TOKENS[arCategory]}`);
    });

    console.log("Database cleanup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating database:", error);
    process.exit(1);
  }
};

fixModels();
