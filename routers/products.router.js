import express from "express";
import controllers from "../controllers/product.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import allowedTo from "../middlewares/allowedTo.js";

const router = express.Router();

// Public routes
router.route("/")
  .get(controllers.getAllProducts)  // Get all products with filters
  .post(verifyToken, allowedTo("admin", "manager"), controllers.addProduct);  // Admin only

router.get("/brands", controllers.getAllBrands);  // Get all brands
router.get("/category/:categoryId", controllers.getProductsByCategory);  // Get products by category
router.get("/category/:categoryId/brands", controllers.getBrandsByCategory);  // Get brands in category

router.route("/:productId")
  .get(controllers.getSingleProduct)  // Get single product
  .put(verifyToken, allowedTo("admin", "manager"), controllers.updateProduct)  // Admin only
  .delete(verifyToken, allowedTo("admin"), controllers.deleteProduct);  // Admin only

export default router;
