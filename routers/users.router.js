import express from "express";
import controllers from "../controllers/user.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.route("/").get(verifyToken, controllers.getAllUsers);
router.route("/:userId")
  .delete(verifyToken, controllers.deleteUser)
  .put(verifyToken, controllers.updateUser);

export default router;
