import express from "express";

// Controllers
import getAllProducts from "../controllers/product/all.products.controller.js";
import getSingleProduct from "../controllers/product/single.product.controller.js";
import addProduct from "../controllers/product/add.product.controller.js";
import updateProduct from "../controllers/product/update.product.controller.js";
import deleteProduct from "../controllers/product/delete.product.controller.js";
import getProductsByCategory from "../controllers/product/product.by.category.controller.js";
import getAllBrands from "../controllers/brand/all.brand.controller.js";
import getBrandsByCategory from "../controllers/brand/brand.by.category.controller.js";

// Middlewares
import verifyToken from "../middlewares/verifyToken.js";
import allowedTo from "../middlewares/allowedTo.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Public routes
router
  .route("/")
  .get(getAllProducts) // Get all products with filters
  .post(
    verifyToken,
    upload.fields([
      { name: "img", maxCount: 1 },
      { name: "images", maxCount: 5 },
    ]),
    allowedTo("admin", "manager"),
    addProduct
  ); // Admin only

router.get("/brands", getAllBrands); // Get all brands
router.get("/category/:categoryId", getProductsByCategory); // Get products by category
router.get("/category/:categoryId/brands", getBrandsByCategory); // Get brands in category

router
  .route("/:productId")
  .get(getSingleProduct) // Get single product
  .put(
    verifyToken,
    allowedTo("admin", "manager"),
    upload.fields([
      { name: "img", maxCount: 1 },
      { name: "images", maxCount: 5 },
    ]),
    updateProduct
  ) // Admin only
  .delete(verifyToken, allowedTo("admin"), deleteProduct); // Admin only

export default router;
