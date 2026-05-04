import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Store from "../models/Store.js";
import User from "../models/User.js";

dotenv.config();

const defaultModel = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
const categoryModels = {
  glasses: "https://modelviewer.dev/shared-assets/models/Sunglasses.glb",
  shoes: "https://modelviewer.dev/shared-assets/models/MaterialsVariantsShoe.glb",
  hat: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb"
};
const buildSeedImageUrl = (imageId) => `https://picsum.photos/id/${imageId}/1200/900`;

const productFamilies = [
  {
    category: "glasses",
    arCategory: "glasses",
    basePrice: 69,
    baseDescription:
      "Statement eyewear designed to sharpen everyday outfits, vacation looks, and event styling.",
    tags: ["sunglasses", "eyewear", "summer style", "travel accessory", "fashion glasses"],
    names: [
      "Coastal Sun Aviators",
      "Nightline Square Frames",
      "Monaco Weekend Shades",
      "Silver Horizon Specs",
      "Jetstream Club Glasses",
      "Palm Light Aviators",
      "Metro Focus Frames",
      "Laguna Tint Shades",
      "Golden Hour Eyewear",
      "Mirage Edge Sunglasses",
      "Skyline Minimal Frames",
      "Boardwalk Polar Shades"
    ]
  },
  {
    category: "jackets",
    arCategory: "jacket",
    basePrice: 139,
    baseDescription:
      "Layering-ready outerwear with a structured silhouette for cool evenings, smart casual looks, and events.",
    tags: ["jacket", "layering", "smart casual", "evening style", "outerwear"],
    names: [
      "Midnight Tailored Jacket",
      "Harbor Line Bomber",
      "Westfield Utility Jacket",
      "Noir Motion Layer",
      "Slate Evening Jacket",
      "Summit Street Bomber",
      "Marina Breeze Jacket",
      "Afterglow Zip Jacket",
      "Tailored City Layer",
      "Northshore Coach Jacket",
      "Driftline Casual Jacket",
      "Urban Edge Outerwear"
    ]
  },
  {
    category: "bags",
    arCategory: "bag",
    basePrice: 79,
    baseDescription:
      "Carry-all accessories that balance clean lines, easy styling, and day-to-night versatility.",
    tags: ["bag", "crossbody", "travel style", "fashion accessory", "everyday carry"],
    names: [
      "Sandstone Carry Bag",
      "Monarch Mini Satchel",
      "Canvas Drift Crossbody",
      "Noir City Sling",
      "Portside Leather Bag",
      "Velvet Lane Mini Bag",
      "Marble Street Handbag",
      "Luna Fold Crossbody",
      "Cinder Carry Tote",
      "Daybreak Belt Bag",
      "Studio Compact Purse",
      "Riviera Shoulder Bag"
    ]
  },
  {
    category: "watches",
    arCategory: "watch",
    basePrice: 119,
    baseDescription:
      "Polished wristwear that adds a refined finish to formal looks, office fits, and dress-casual outfits.",
    tags: ["watch", "wristwear", "formal accessory", "minimal design", "classic style"],
    names: [
      "Rose Gold Minimal Watch",
      "Atlas Steel Timepiece",
      "Monochrome Dial Watch",
      "Harbor Classic Watch",
      "Daymark Slim Watch",
      "Luxe Edge Chrono",
      "Evening Gold Wristwatch",
      "Slate Face Watch",
      "Midtown Signature Timepiece",
      "Aster Black Dial Watch",
      "Crest Leather Watch",
      "Pulse Silver Watch"
    ]
  },
  {
    category: "shirts",
    arCategory: "shirt",
    basePrice: 59,
    baseDescription:
      "Breathable shirts built for warm-weather dressing, relaxed tailoring, and polished daily wear.",
    tags: ["shirt", "linen", "smart casual", "lightweight", "summer outfit"],
    names: [
      "Ivory Linen Shirt",
      "Coastline Button Shirt",
      "Blue Harbor Linen Top",
      "Studio White Camp Shirt",
      "Breeze Fit Formal Shirt",
      "Oakline Casual Shirt",
      "Weekend Linen Layer",
      "Horizon Summer Shirt",
      "Crisp Day Oxford Shirt",
      "Shoreline Evening Shirt",
      "Mariner Roll-Sleeve Shirt",
      "Cloudline Minimal Shirt"
    ]
  },
  {
    category: "shoes",
    arCategory: "shoes",
    basePrice: 89,
    baseDescription:
      "Comfort-first footwear with sleek profiles for daily wear, city movement, and elevated casual outfits.",
    tags: ["shoes", "sneakers", "streetwear", "footwear", "casual look"],
    names: [
      "Obsidian Street Sneakers",
      "Motion Grid Runners",
      "Ashline Daily Sneakers",
      "Ridge Court Trainers",
      "Downtown Leather Sneakers",
      "Pulse Walk Low Tops",
      "Metro Pace Shoes",
      "Nightshift Sport Sneakers",
      "Cleanline Runner Shoes",
      "Harbor Track Trainers",
      "Velocity Mono Sneakers",
      "Boardwalk Canvas Shoes"
    ]
  },
  {
    category: "rings",
    arCategory: "ring",
    basePrice: 35,
    baseDescription:
      "Modern rings with understated shine that work solo or stacked into a statement accessory set.",
    tags: ["ring", "jewelry", "stacked accessories", "minimal jewelry", "statement piece"],
    names: [
      "Copper Edge Ring",
      "Solstice Band Ring",
      "Noir Stone Signet",
      "Aurora Stack Ring",
      "Cinder Crest Band",
      "Luna Minimal Ring",
      "Canyon Metal Ring",
      "Velvet Alloy Band",
      "Studio Slim Signet",
      "Bronze Halo Ring",
      "Orbit Detail Ring",
      "Daylight Stacking Band"
    ]
  },
  {
    category: "hats",
    arCategory: "hat",
    basePrice: 39,
    baseDescription:
      "Easygoing headwear that adds shape, shade, and a finished touch to travel and weekend looks.",
    tags: ["hat", "headwear", "weekend outfit", "travel style", "sun protection"],
    names: [
      "Harbor Classic Hat",
      "Desert Sun Cap",
      "Trailmark Street Hat",
      "Cove Weekend Hat",
      "Northline Casual Cap",
      "Canvas Peak Hat",
      "Metro Shade Cap",
      "Voyage Summer Hat",
      "Seabreeze Travel Hat",
      "Cinder Utility Cap",
      "Ridge Brim Hat",
      "Coastline Minimal Cap"
    ]
  }
];

const productSeeds = productFamilies.flatMap((family, familyIndex) =>
  family.names.map((name, itemIndex) => {
    const familyKey = family.category.replace(/s$/, "");
    const variantNumber = itemIndex + 1;

    return {
      name,
      description: `${family.baseDescription} Variant ${variantNumber} in the ${family.category} collection.`,
      price: family.basePrice + (itemIndex % 4) * 9,
      category: family.category,
      arCategory: family.arCategory,
      stock: 10 + (itemIndex % 6) * 4,
      images: [{ url: buildSeedImageUrl(10 + familyIndex * 15 + itemIndex), publicId: "" }],
      modelUrl: categoryModels[familyKey] || defaultModel,
      aiTags: [...family.tags, name.toLowerCase(), `${family.category} variant ${variantNumber}`]
    };
  })
);

const seed = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const passwordHash = await bcrypt.hash("Password@123", 12);

  const admin = await User.findOneAndUpdate(
    { email: "admin@phantomstore.com" },
    { name: "Phantom Admin", email: "admin@phantomstore.com", password: passwordHash, role: "admin" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const merchant = await User.findOneAndUpdate(
    { email: "merchant@phantomstore.com" },
    { name: "Maya Merchant", email: "merchant@phantomstore.com", password: passwordHash, role: "merchant" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const customer = await User.findOneAndUpdate(
    { email: "customer@phantomstore.com" },
    { name: "Chris Customer", email: "customer@phantomstore.com", password: passwordHash, role: "customer" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const store = await Store.findOneAndUpdate(
    { name: "Phantom Signature Store" },
    {
      ownerId: merchant._id,
      name: "Phantom Signature Store",
      description: "Curated AR-ready fashion accessories and apparel for modern shoppers."
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const products = [];

  for (const seedProduct of productSeeds) {
    const product = await Product.findOneAndUpdate(
      { name: seedProduct.name, storeId: store._id },
      {
        ...seedProduct,
        modelUrl,
        storeId: store._id
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    products.push(product);
  }

  store.products = products.map((product) => product._id);
  await store.save();

  customer.savedItems = products.slice(0, 3).map((product) => product._id);
  await customer.save();

  const orderSeeds = [
    {
      stripePaymentId: "pi_seed_001",
      status: "processing",
      items: [
        products.find((product) => product.name === "Coastal Sun Aviators"),
        products.find((product) => product.name === "Ivory Linen Shirt")
      ]
    },
    {
      stripePaymentId: "pi_seed_002",
      status: "delivered",
      items: [
        products.find((product) => product.name === "Midnight Tailored Jacket"),
        products.find((product) => product.name === "Rose Gold Minimal Watch")
      ]
    }
  ];

  for (const seedOrder of orderSeeds) {
    const items = seedOrder.items
      .filter(Boolean)
      .map((product) => ({
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url || "",
        price: product.price,
        quantity: 1
      }));

    await Order.findOneAndUpdate(
      { stripePaymentId: seedOrder.stripePaymentId },
      {
        userId: customer._id,
        items,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        stripePaymentId: seedOrder.stripePaymentId,
        status: seedOrder.status
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log("Seed complete");
  console.log("Admin:", admin.email, "Password: Password@123");
  console.log("Merchant:", merchant.email, "Password: Password@123");
  console.log("Customer:", customer.email, "Password: Password@123");
  console.log("Store:", store.name);
  console.log("Products:", products.length);
};

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
