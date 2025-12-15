import express from "express";
import userController from "../controllers/auth.controller.js";

const router = express.Router();

router.route("/login").post(userController.login);
router.route("/register").post(userController.register);

export default router;
