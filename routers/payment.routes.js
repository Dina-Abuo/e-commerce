import express from "express";

import addPayment from "../controllers/payment/stripe/add.payment.controller.js";
import confirmPayment from "../controllers/payment/stripe/confirm.payment.controller.js";
import controllers from "../controllers/payment/paymob/paymob.controller.js";

import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

// Create payment intent
router.post("/create-payment-intent", verifyToken, addPayment);

// Stripe webhook (no auth needed)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  confirmPayment
);

// Paymob - initialize payment
router.post("/paymob/init", verifyToken, controllers.initializePayment);

// Paymob webhook (no auth needed)
router.post(
  "/paymob/webhook",
  express.raw({ type: "application/json" }),
  controllers.paymobWebhook
);

export default router;