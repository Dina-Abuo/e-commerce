import asyncWrapper from "../../middlewares/asyncWrapper.js";
import Product from "../../models/product.schema.js";
import Category from "../../models/category.schema.js";
import appError from "../../utils/appError.js";
import httpStatusText from "../../utils/httpStatusText.js";
import cloudinary from "../../config/cloudinary.config.js";
import mongoose from "mongoose";

// Update product (Admin only)
const updateProduct = asyncWrapper(async (req, res, next) => {
  const productId = req.params.productId;

  // Validate product ID
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(
      appError.create("Invalid product id", 400, httpStatusText.FAIL)
    );
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(appError.create("Product not found", 404, httpStatusText.FAIL));
  }

  // If category is being updated, validate it
  if (req.body.category) {
    const categoryId = req.body.category.trim();
    
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return next(
        appError.create("Invalid category id", 400, httpStatusText.FAIL)
      );
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return next(
        appError.create("Category not found", 404, httpStatusText.FAIL)
      );
    }
  }

  // Prepare update data
  const updateData = { ...req.body };

  // Handle main image update
  if (req.files?.img?.length) {
    // Delete old main image from cloudinary if it exists and not placeholder
    if (product.img && !product.img.includes("placeholder")) {
      const publicId = product.img.split("/").slice(-2).join("/").split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("Error deleting old main image:", error);
      }
    }

    // Upload new main image
    const result = await cloudinary.uploader.upload(req.files.img[0].path, {
      folder: "products",
    });
    updateData.img = result.secure_url;
  }

  // Handle additional images update (smart update)
  if (req.files?.images?.length || req.body.existingImages) {
    // Get existing images that should be kept (sent from frontend)
    const existingImages = req.body.existingImages 
      ? JSON.parse(req.body.existingImages) 
      : [];

    // Find images to delete (old images not in existingImages)
    const imagesToDelete = product.images.filter(
      (img) => !existingImages.includes(img) && !img.includes("placeholder")
    );

    // Delete removed images from cloudinary
    if (imagesToDelete.length > 0) {
      const deletePromises = imagesToDelete.map((imageUrl) => {
        const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];
        return cloudinary.uploader.destroy(publicId).catch((error) => {
          console.log("Error deleting image:", error);
        });
      });
      await Promise.all(deletePromises);
    }

    // Upload new images
    let newImages = [];
    if (req.files?.images?.length) {
      const uploads = req.files.images.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "products" })
      );
      const results = await Promise.all(uploads);
      newImages = results.map((r) => r.secure_url);
    }

    // Combine existing images with new images
    updateData.images = [...existingImages, ...newImages];
  }

  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate("category", "name description");

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { product: updatedProduct },
  });
});

export default updateProduct;