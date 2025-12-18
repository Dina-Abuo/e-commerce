import asyncWrapper from "../../middlewares/asyncWrapper.js";
import appError from "../../utils/appError.js";
import httpStatusText from "../../utils/httpStatusText.js";
import Order from "../../models/order.schema.js";

// Get order by ID
 const getOrder = asyncWrapper(async (req, res, next) => {
  const orderId = req.params.orderId;
  const userId = req.currentUser.id;

  const order = await Order.findOne({ _id: orderId, user: userId }).populate({
    path: "products.product",
    model: "Product",
    select: "name img price"
  });

  if (!order) {
    return next(appError.create("Order not found", 404, httpStatusText.FAIL));
  }

  return res.json({
    status: httpStatusText.SUCCESS,
    data: { order },
  });
});
export default getOrder;
