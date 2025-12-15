import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import allowedTo from "../middlewares/allowedTo.js";
import controller from "../controllers/cartItem.controller.js";
import userRoles from "../utils/userRoles.js";

const router = express.Router();

router.route("/").post(verifyToken, allowedTo(userRoles.USER), controller.addToCart);
router.route("/:cartItemId").delete(verifyToken, controller.deleteCartItemById);
router.route("/buy/without-discount").post(verifyToken, allowedTo(userRoles.USER), controller.BuyItemWithoutDiscount);
router.route("/buy/discount").post(verifyToken, allowedTo(userRoles.USER), controller.BuyItemWithDiscount);

export default router;
