import asyncWrapper from "../../middlewares/asyncWrapper.js";
import Order from "../../models/order.schema.js";
import httpStatusText from "../../utils/httpStatusText.js";

const createOrder = asyncWrapper(async (req, res) => {
  const { products, shippingAddress, paymentMethod } = req.body;
  const user = req.currentUser;

  if (!products || !products.length) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "Products cannot be empty",
    });
  }

  let totalAmount = 0;
  const orderProducts = products.map((item) => {
    totalAmount += item.price * item.quantity;
    return {
      product: item.productId,
      quantity: item.quantity,
      price: item.price,
    };
  });

  const order = await Order.create({
    user: user.id,
    products: orderProducts,
    totalAmount,
    shippingAddress,
    paymentMethod: paymentMethod || "cash", // default COD
    paymentStatus: paymentMethod === "cash" ? "pending" : "pending",
    orderStatus: "pending",
  });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { order },
  });
});

export default createOrder;