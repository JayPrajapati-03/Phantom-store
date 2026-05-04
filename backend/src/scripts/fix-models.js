import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

const OLD_URL = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
const NEW_HAT_URL = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb";
const GLASSES_URL = "https://modelviewer.dev/shared-assets/models/Sunglasses.glb";

const fixModels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Update Hats
    const hatResult = await Product.updateMany(
      { 
        $or: [{ category: "hats" }, { arCategory: "hat" }],
        modelUrl: OLD_URL 
      },
      { $set: { modelUrl: NEW_HAT_URL } }
    );
    console.log(`Updated ${hatResult.modifiedCount} hats to Duck model`);

    // Update Glasses
    const glassesResult = await Product.updateMany(
      { 
        $or: [{ category: "glasses" }, { arCategory: "glasses" }],
        modelUrl: OLD_URL 
      },
      { $set: { modelUrl: GLASSES_URL } }
    );
    console.log(`Updated ${glassesResult.modifiedCount} glasses to Sunglasses model`);

    // Update others to a neutral box if they are still astronauts
    const othersResult = await Product.updateMany(
      { modelUrl: OLD_URL },
      { $set: { modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb" } }
    );
    console.log(`Updated ${othersResult.modifiedCount} other products to Box model`);

    console.log("Database cleanup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating database:", error);
    process.exit(1);
  }
};

fixModels();
