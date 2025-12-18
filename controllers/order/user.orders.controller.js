import asyncWrapper from "../../middlewares/asyncWrapper.js";
import Order from "../../models/order.schema.js";
import httpStatusText from "../../utils/httpStatusText.js";

// Get user orders
const getUserOrders = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser.id;

  const orders = await Order.find({ user: userId })
    .populate({
      path: "products.product",
      model: "Product",
      select: "name img price",
    })
    .sort({ createdAt: -1 });

  return res.json({
    status: httpStatusText.SUCCESS,
    data: { orders },
  });
});
export default getUserOrders;
