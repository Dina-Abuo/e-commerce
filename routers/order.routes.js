import express from "express";
// Controllers
import getOrder from "../controllers/order/single.order.controller.js";
import getUserOrders from "../controllers/order/user.orders.controller.js";
import deleteOrder from "../controllers/order/delete.order.controller.js";
import updateOrder from "../controllers/order/update.order.controller.js";
import createOrder from "../controllers/order/create.order.controller.js";
// Middlewares
import allowedTo from "../middlewares/allowedTo.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router
.route("/")
.get( verifyToken, getUserOrders)// Get user orders
.post( verifyToken, createOrder);// Create order (COD or delayed payment)

router
.route("/orderId")
.get(verifyToken, getOrder)// Get single order
.patch( verifyToken, updateOrder)// Update order (Admin or User)
.delete( verifyToken, allowedTo("admin"), deleteOrder);// Delete order (Admin only)

export default router;
