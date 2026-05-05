import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAdmin, verifyToken } from "../middleware/auth.js";

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: passwordHash,
      role: ["customer", "merchant"].includes(role) ? role : "customer"
    });

    const token = signToken(user);
    return res.status(201).json({ user: user.toJSON(), token });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.json({ user: user.toJSON(), token });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", verifyToken, async (req, res) => {
  res.json({ user: req.user });
});

router.get("/merchants", verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const merchants = await User.find({ role: "merchant" })
      .select("name email role createdAt")
      .sort({ createdAt: -1 });

    return res.json({ merchants });
  } catch (error) {
    return next(error);
  }
});

router.post("/admin/merchants", verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const merchant = await User.create({
      name,
      email,
      password: passwordHash,
      role: "merchant"
    });

    return res.status(201).json({ user: merchant.toJSON() });
  } catch (error) {
    return next(error);
  }
});

export default router;
