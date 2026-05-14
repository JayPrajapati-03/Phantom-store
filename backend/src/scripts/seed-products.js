import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const STORE_ID = "69f9923e9e45408da9adf380";
const categoryModels = {
  glasses: "__procedural_glasses__", jacket: "__procedural_jacket__",
  bag: "__procedural_bag__", watch: "__procedural_watch__",
  shirt: "__procedural_shirt__", shoes: "__procedural_shoes__",
  ring: "__procedural_ring__", hat: "__procedural_hat__"
};
const defaultModel = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
const img = (id) => `https://picsum.photos/id/${id}/1200/900`;

const families = [
  { category:"glasses", arCategory:"glasses", basePrice:69, desc:"Statement eyewear designed to sharpen everyday outfits.", names:["Coastal Sun Aviators","Nightline Square Frames","Monaco Weekend Shades","Silver Horizon Specs","Jetstream Club Glasses","Palm Light Aviators","Metro Focus Frames","Laguna Tint Shades","Golden Hour Eyewear","Mirage Edge Sunglasses","Skyline Minimal Frames","Boardwalk Polar Shades"] },
  { category:"jackets", arCategory:"jacket", basePrice:139, desc:"Layering-ready outerwear with a structured silhouette.", names:["Midnight Tailored Jacket","Harbor Line Bomber","Westfield Utility Jacket","Noir Motion Layer","Slate Evening Jacket","Summit Street Bomber","Marina Breeze Jacket","Afterglow Zip Jacket","Tailored City Layer","Northshore Coach Jacket","Driftline Casual Jacket","Urban Edge Outerwear"] },
  { category:"bags", arCategory:"bag", basePrice:79, desc:"Carry-all accessories that balance clean lines and versatility.", names:["Sandstone Carry Bag","Monarch Mini Satchel","Canvas Drift Crossbody","Noir City Sling","Portside Leather Bag","Velvet Lane Mini Bag","Marble Street Handbag","Luna Fold Crossbody","Cinder Carry Tote","Daybreak Belt Bag","Studio Compact Purse","Riviera Shoulder Bag"] },
  { category:"watches", arCategory:"watch", basePrice:119, desc:"Polished wristwear for formal and dress-casual outfits.", names:["Rose Gold Minimal Watch","Atlas Steel Timepiece","Monochrome Dial Watch","Harbor Classic Watch","Daymark Slim Watch","Luxe Edge Chrono","Evening Gold Wristwatch","Slate Face Watch","Midtown Signature Timepiece","Aster Black Dial Watch","Crest Leather Watch","Pulse Silver Watch"] },
  { category:"shirts", arCategory:"shirt", basePrice:59, desc:"Breathable shirts for warm-weather dressing and daily wear.", names:["Ivory Linen Shirt","Coastline Button Shirt","Blue Harbor Linen Top","Studio White Camp Shirt","Breeze Fit Formal Shirt","Oakline Casual Shirt","Weekend Linen Layer","Horizon Summer Shirt","Crisp Day Oxford Shirt","Shoreline Evening Shirt","Mariner Roll-Sleeve Shirt","Cloudline Minimal Shirt"] },
  { category:"shoes", arCategory:"shoes", basePrice:89, desc:"Comfort-first footwear with sleek profiles for daily wear.", names:["Obsidian Street Sneakers","Motion Grid Runners","Ashline Daily Sneakers","Ridge Court Trainers","Downtown Leather Sneakers","Pulse Walk Low Tops","Metro Pace Shoes","Nightshift Sport Sneakers","Cleanline Runner Shoes","Harbor Track Trainers","Velocity Mono Sneakers","Boardwalk Canvas Shoes"] },
  { category:"rings", arCategory:"ring", basePrice:35, desc:"Modern rings with understated shine for solo or stacked wear.", names:["Copper Edge Ring","Solstice Band Ring","Noir Stone Signet","Aurora Stack Ring","Cinder Crest Band","Luna Minimal Ring","Canyon Metal Ring","Velvet Alloy Band","Studio Slim Signet","Bronze Halo Ring","Orbit Detail Ring","Daylight Stacking Band"] },
  { category:"hats", arCategory:"hat", basePrice:39, desc:"Easygoing headwear for travel and weekend looks.", names:["Harbor Classic Hat","Desert Sun Cap","Trailmark Street Hat","Cove Weekend Hat","Northline Casual Cap","Canvas Peak Hat","Metro Shade Cap","Voyage Summer Hat","Seabreeze Travel Hat","Cinder Utility Cap","Ridge Brim Hat","Coastline Minimal Cap"] }
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const productIds = [];
  let fi = 0;

  for (const f of families) {
    const fk = f.category.replace(/s$/, "");
    let ii = 0;
    for (const name of f.names) {
      const doc = {
        name,
        description: `${f.desc} Variant ${ii + 1} in the ${f.category} collection.`,
        price: f.basePrice + (ii % 4) * 9,
        category: f.category,
        arCategory: f.arCategory,
        stock: 10 + (ii % 6) * 4,
        images: [{ url: img(10 + fi * 15 + ii), publicId: "" }],
        modelUrl: categoryModels[fk] || defaultModel,
        aiTags: [f.category, name.toLowerCase()],
        storeId: new mongoose.Types.ObjectId(STORE_ID),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const r = await db.collection("products").insertOne(doc);
      productIds.push(r.insertedId);
      ii++;
    }
    fi++;
  }

  await db.collection("stores").updateOne(
    { _id: new mongoose.Types.ObjectId(STORE_ID) },
    { $set: { products: productIds } }
  );

  console.log(`Inserted ${productIds.length} products into Phantom market`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
