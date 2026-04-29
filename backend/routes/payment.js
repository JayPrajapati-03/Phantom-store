import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_missing");

router.post("/create-payment-intent", verifyToken, async (req, res, next) => {
  try {
    const { amount, currency = "usd", metadata = {} } = req.body;

    if (!amount || Number(amount) < 50) {
      return res.status(400).json({ message: "Amount must be at least 50 cents" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount)),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: String(req.user._id),
        ...metadata
      }
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "whsec_missing"
    );

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      await Order.updateMany(
        { stripePaymentId: paymentIntent.id, status: "pending" },
        { status: "paid" }
      );
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      await Order.updateMany(
        { stripePaymentId: paymentIntent.id, status: "pending" },
        { status: "cancelled" }
      );
    }

    return res.json({ received: true });
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

export default router;
