import asyncWrapper from "../../middlewares/asyncWrapper.js";
import Product from "../../models/product.schema.js";
import Category from "../../models/category.schema.js";
import appError from "../../utils/appError.js";
import httpStatusText from "../../utils/httpStatusText.js";
import cloudinary from "../../config/cloudinary.config.js";
import mongoose from "mongoose";

// Add product (Admin only)
const addProduct = asyncWrapper(async (req, res, next) => {
  const { name, title, description, price, brand, category, quantity } =
    req.body;

  // Validation
  if (!name || !title || !description || !price || !brand || !category) {
    return next(
      appError.create(
        "All required fields must be provided",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const categoryId = category.trim();

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return next(
      appError.create("Invalid category id", 400, httpStatusText.FAIL)
    );
  }

  // Check if category exists
  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) {
    return next(
      appError.create("Category not found", 404, httpStatusText.FAIL)
    );
  }

  // main image
  let mainImageUrl = "https://via.placeholder.com/300";
  if (req.files?.img?.length) {
    const result = await cloudinary.uploader.upload(req.files.img[0].path, {
      folder: "products",
    });
    mainImageUrl = result.secure_url;
  }

  // multiple images
  let additionalImages = [];
  if (req.files?.images?.length) {
    const uploads = req.files.images.map((file) =>
      cloudinary.uploader.upload(file.path, { folder: "products" })
    );
    const results = await Promise.all(uploads);
    additionalImages = results.map((r) => r.secure_url);
  }

  const newProduct = new Product({
    name,
    title,
    description,
    price,
    brand,
    category: categoryId,
    quantity: quantity || 0,
    img: mainImageUrl,
    images: additionalImages,
  });

  await newProduct.save();

  const populatedProduct = await Product.findById(newProduct._id).populate(
    "category",
    "name description"
  );

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { product: populatedProduct },
  });
});
export default addProduct;