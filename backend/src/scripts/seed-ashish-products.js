import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const STORE_ID = "69f993b4287d1ff8df16ac1b";
const categoryModels = {
  glasses: "__procedural_glasses__", jacket: "__procedural_jacket__",
  bag: "__procedural_bag__", watch: "__procedural_watch__",
  shirt: "__procedural_shirt__", shoes: "__procedural_shoes__",
  ring: "__procedural_ring__", hat: "__procedural_hat__"
};
const defaultModel = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
const img = (id) => `https://picsum.photos/id/${id}/1200/900`;

const families = [
  { category:"glasses", arCategory:"glasses", basePrice:75, desc:"Premium designer eyewear crafted for bold everyday statements.", names:["Eclipse Dark Aviators","Prism Geo Frames","Dusk Titanium Shades","Lunar Frost Specs","Nova Gradient Glasses","Zenith Pilot Frames","Onyx Shield Shades","Crystal Wave Eyewear","Vortex Sport Glasses","Phantom Wrap Frames","Solar Drift Aviators","Arctic Lens Specs"] },
  { category:"jackets", arCategory:"jacket", basePrice:159, desc:"High-performance outerwear blending urban edge with refined tailoring.", names:["Thunder Leather Jacket","Alpine Tech Parka","Stealth Moto Jacket","Ember Quilted Layer","Shadow Denim Jacket","Glacier Puffer Coat","Rebel Suede Bomber","Storm Shield Jacket","Titanium Field Coat","Eclipse Trench Layer","Blaze Track Jacket","Carbon Utility Coat"] },
  { category:"bags", arCategory:"bag", basePrice:89, desc:"Luxury carry essentials designed for the modern urban explorer.", names:["Apex Messenger Bag","Onyx Backpack Pro","Titan Duffel Bag","Summit Laptop Sleeve","Nebula Travel Pouch","Iron Cross Sling","Stealth Gym Bag","Circuit Tech Case","Horizon Weekender","Zenith Card Wallet","Eclipse Belt Pack","Vanguard Tote Pro"] },
  { category:"watches", arCategory:"watch", basePrice:149, desc:"Precision timepieces with modern aesthetics and lasting craftsmanship.", names:["Titan Chronograph Pro","Obsidian Diver Watch","Celestial Moon Phase","Apex Sport Chrono","Vortex Digital Watch","Midnight Skeleton Watch","Summit Field Timer","Eclipse Pilot Watch","Carbon Fiber Chrono","Stealth Auto Watch","Nebula Smart Watch","Prism Dual Tone Watch"] },
  { category:"shirts", arCategory:"shirt", basePrice:65, desc:"Premium fabric shirts with contemporary cuts for versatile styling.", names:["Granite Henley Shirt","Dusk Chambray Top","Apex Polo Shirt","Midnight Flannel Shirt","Carbon Tech Tee","Eclipse Band Collar","Summit Denim Shirt","Stealth Graphic Tee","Vortex Print Shirt","Onyx Jersey Top","Nebula Silk Shirt","Prism Color Block Tee"] },
  { category:"shoes", arCategory:"shoes", basePrice:99, desc:"Performance-driven footwear with cutting-edge design and all-day comfort.", names:["Apex Runner X","Thunder High Tops","Stealth Loafers","Vortex Trail Boots","Eclipse Slip-Ons","Nebula Platform Shoes","Carbon Derby Shoes","Summit Chelsea Boots","Prism Skate Shoes","Onyx Driving Mocs","Titan Sport Sandals","Glacier Hiking Shoes"] },
  { category:"rings", arCategory:"ring", basePrice:45, desc:"Bold statement rings crafted with premium metals and modern design.", names:["Titan Signet Ring","Obsidian Dome Band","Vortex Spinner Ring","Eclipse Chain Ring","Carbon Fiber Band","Summit Celtic Ring","Nebula Opal Ring","Prism Puzzle Ring","Apex Skull Ring","Stealth Matte Band","Thunder Bolt Ring","Glacier Crystal Ring"] },
  { category:"hats", arCategory:"hat", basePrice:45, desc:"Statement headwear combining street culture with premium materials.", names:["Apex Snapback Cap","Thunder Beanie","Stealth Bucket Hat","Vortex Trucker Cap","Eclipse Fedora","Nebula Dad Hat","Carbon Visor","Summit Newsboy Cap","Prism Panel Hat","Onyx Flat Cap","Titan Sports Cap","Glacier Knit Beanie"] }
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
        description: `${f.desc} Variant ${ii + 1} in the ${f.category} line.`,
        price: f.basePrice + (ii % 5) * 10,
        category: f.category,
        arCategory: f.arCategory,
        stock: 8 + (ii % 7) * 3,
        images: [{ url: img(120 + fi * 15 + ii), publicId: "" }],
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

  console.log(`Inserted ${productIds.length} products into Phantom Signature Store`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
