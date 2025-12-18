import asyncWrapper from "../../../middlewares/asyncWrapper.js";
import Order from "../../../models/order.schema.js";
import Product from "../../../models/product.schema.js";
import appError from "../../../utils/appError.js";
import httpStatusText from "../../../utils/httpStatusText.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

 const addPayment = asyncWrapper(async (req, res, next) => {
  const { products, shippingAddress } = req.body;
  const userId = req.currentUser.id;

  // calculate total amount
  let totalAmount = 0;
  const orderProducts = [];

  for (let item of products) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return next(
        appError.create(
          `Product not found: ${item.productId}`,
          404,
          httpStatusText.FAIL
        )
      );
    }

    if (product.quantity < item.quantity) {
      return next(
        appError.create(
          `Insufficient stock for product: ${product.name}`,
          400,
          httpStatusText.FAIL
        )
      );
    }
    const itemTotal = product.price * item.quantity;
    totalAmount += itemTotal;

    orderProducts.push({
      productId: product._id,
      quantity: item.quantity,
      price: product.price,
    });
  }

  //   create order in database
  const order = new Order({
    user: userId,
    products: orderProducts,
    totalAmount,
    shippingAddress,
    paymentStatus: "pending",
    orderStatus: "pending",
  });

  await order.save();

  // create stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 100), // Convert to cents
    currency: "egp",
    metadata: {
      orderId: order._id.toString(),
      userId: userId.toString(),
    },
  });
  order.stripePaymentId = paymentIntent.id;
  await order.save();

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      amount: totalAmount,
    },
  });
});

export default addPayment;