import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Store from "../models/Store.js";
import User from "../models/User.js";

dotenv.config();

const modelUrl = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";

const productSeeds = [
  {
    key: "coastal-sun-aviators",
    name: "Coastal Sun Aviators",
    description: "Lightweight gold-frame aviators designed for sunny travel looks and outdoor events.",
    price: 79,
    category: "glasses",
    arCategory: "glasses",
    stock: 18,
    images: [{ url: "https://images.unsplash.com/photo-1615210768832-159ca3912a05?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1200", publicId: "" }],
    aiTags: ["beach wedding", "summer glasses", "aviators", "gold frame", "vacation style", "coastal look"]
  },
  {
    key: "midnight-tailored-jacket",
    name: "Midnight Tailored Jacket",
    description: "Structured navy jacket with a clean silhouette for weddings, evening dinners, and polished layering.",
    price: 149,
    category: "jackets",
    arCategory: "jacket",
    stock: 10,
    images: [{ url: "https://images.unsplash.com/photo-1596832772762-78e213deff5f?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1200", publicId: "" }],
    aiTags: ["formal jacket", "beach wedding", "smart layering", "navy blazer", "evening style", "tailored"]
  },
  {
    key: "sandstone-carry-bag",
    name: "Sandstone Carry Bag",
    description: "Neutral-toned crossbody bag that pairs easily with resort wear, wedding guest outfits, and weekend styling.",
    price: 89,
    category: "bags",
    arCategory: "bag",
    stock: 22,
    images: [{ url: "https://images.unsplash.com/photo-1585488433862-b692398b2bfa?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1200", publicId: "" }],
    aiTags: ["crossbody bag", "neutral accessory", "beach wedding", "resort wear", "summer bag", "travel style"]
  },
  {
    key: "rose-gold-minimal-watch",
    name: "Rose Gold Minimal Watch",
    description: "Slim rose gold watch with a refined face that complements dressy and semi-formal outfits.",
    price: 129,
    category: "watches",
    arCategory: "watch",
    stock: 15,
    images: [{ url: "https://images.unsplash.com/photo-1602174528421-6c3e5b00e565?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1200", publicId: "" }],
    aiTags: ["dress watch", "rose gold", "formal accessory", "wedding guest", "elegant watch", "minimal style"]
  },
  {
    key: "ivory-linen-shirt",
    name: "Ivory Linen Shirt",
    description: "Breathable linen shirt ideal for coastal ceremonies, day parties, and relaxed formal dressing.",
    price: 69,
    category: "shirts",
    arCategory: "shirt",
    stock: 28,
    images: [{ url: "https://images.unsplash.com/photo-1740711152088-88a009e877bb?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1200", publicId: "" }],
    aiTags: ["linen shirt", "beach wedding", "summer formal", "lightweight shirt", "coastal outfit", "day event"]
  },
  {
    key: "obsidian-street-sneakers",
    name: "Obsidian Street Sneakers",
    description: "Clean black sneakers built for everyday wear with subtle detailing and comfortable all-day support.",
    price: 99,
    category: "shoes",
    arCategory: "shoes",
    stock: 30,
    images: [{ url: "https://images.unsplash.com/photo-1560857792-215f9e3534ed?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1200", publicId: "" }],
    aiTags: ["streetwear shoes", "black sneakers", "casual footwear", "daily style", "comfortable shoes", "minimal sneakers"]
  },
  {
    key: "copper-edge-ring",
    name: "Copper Edge Ring",
    description: "Modern statement ring with warm metallic tones for stacked accessory looks.",
    price: 39,
    category: "rings",
    arCategory: "ring",
    stock: 40,
    images: [{ url: "https://images.unsplash.com/photo-1675105151596-f2391ab706c2?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1200", publicId: "" }],
    aiTags: ["statement ring", "metallic accessory", "stacked jewelry", "warm tone", "minimal jewelry", "daily accessory"]
  },
  {
    key: "harbor-classic-hat",
    name: "Harbor Classic Hat",
    description: "A clean structured hat that works well with travel outfits, sunny weekends, and casual layering.",
    price: 45,
    category: "hats",
    arCategory: "hat",
    stock: 20,
    images: [{ url: "https://images.unsplash.com/photo-1627733041826-77dd65dc5a19?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1200", publicId: "" }],
    aiTags: ["classic hat", "sun protection", "casual accessory", "weekend outfit", "travel style", "outdoor look"]
  }
];

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
