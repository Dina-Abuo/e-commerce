import asyncWrapper from "../../middlewares/asyncWrapper.js";
import Order from "../../models/order.schema.js";
import httpStatusText from "../../utils/httpStatusText.js";

const updateOrder = asyncWrapper(async (req, res) => {
  const { orderId } = req.params;
  const updates = req.body; // orderStatus, shippingAddress, paymentMethod

  const order = await Order.findByIdAndUpdate(orderId, updates, { new: true });

  if (!order) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      message: "Order not found",
    });
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { order },
  });
});
export default updateOrder;