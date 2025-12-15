import express from "express";
import controllers from "../controllers/category.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import allowedTo from "../middlewares/allowedTo.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Public routes
router
  .route("/")
  .get(controllers.getAllCategories)
  .post(
    verifyToken,
    allowedTo("admin"),
    upload.single("image"),
    controllers.addCategory
  );

// Single category routes
router
  .route("/:categoryId")
  .get(controllers.getSingleCategory)
  .put(verifyToken, allowedTo("admin"), controllers.updateCategory)
  .delete(verifyToken, allowedTo("admin"), controllers.deleteCategory);

// Toggle active status
router.patch(
  "/:categoryId/toggle-status",
  verifyToken,
  allowedTo("admin"),
  controllers.toggleCategoryStatus
);

export default router;
