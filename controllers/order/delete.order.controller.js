import asyncWrapper from "../../middlewares/asyncWrapper.js";
import Order from "../../models/order.schema.js";
import httpStatusText from "../../utils/httpStatusText.js";


const deleteOrder = asyncWrapper(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findByIdAndDelete(orderId);

  if (!order) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      message: "Order not found",
    });
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Order deleted successfully",
  });
});

export default deleteOrder;