import asyncWrapper from "../../../middlewares/asyncWrapper.js"
import Order from "../../../models/order.schema.js";
import Product from "../../../models/product.schema.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Confirm payment (webhook from Stripe)
 const confirmPayment = asyncWrapper(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    // Update order status
    const order = await Order.findById(orderId);
    order.paymentStatus = 'paid';
    order.orderStatus = 'processing';
    await order.save();

    // Update product quantities
    for (let item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity }
      });
    }
  }

  res.json({ received: true });
});
export default confirmPayment;