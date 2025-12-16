import asyncWrapper from "../middlewares/asyncWrapper.js";
import Category from "../models/category.schema.js";
import Product from "../models/product.schema.js";
import appError from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";
import cloudinary from "../config/cloudinary.config.js";
import mongoose from "mongoose";

const getAllCategories = asyncWrapper(async (req, res, next) => {
  const categories = await Category.find({ isActive: true }, { __v: 0 }).sort({
    createdAt: -1,
  });

  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({
        category: category._id,
      });
      return { ...category.toObject(), productCount };
    })
  );

  return res.json({
    status: httpStatusText.SUCCESS,
    data: { categories: categoriesWithCount },
  });
});

const getSingleCategory = asyncWrapper(async (req, res, next) => {
  const categoryId = req.params.categoryId;
  const category = await Category.findById(categoryId);
  if (!category) {
    return next(
      appError.create("Category not found", 404, httpStatusText.FAIL)
    );
  }
  const products = await Product.find(
    { category: categoryId },
    { __v: 0 }
  ).sort({ createdAt: -1 });
  return res.json({
    status: httpStatusText.SUCCESS,
    data: { category, products },
  });
});

const addCategory = asyncWrapper(async (req, res, next) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return next(
      appError.create(
        "Name and description are required",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return next(
      appError.create("Category already exists", 400, httpStatusText.FAIL)
    );
  }

  let imageUrl = "https://via.placeholder.com/300";
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "categories",
    });
    imageUrl = result.secure_url;
  }

  const newCategory = new Category({ name, description, image: imageUrl });
  await newCategory.save();

  return res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { category: newCategory } });
});
 
const updateCategory = asyncWrapper(async (req, res, next) => {
  // Validate category ID
  const categoryId = req.params.categoryId.trim();
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return next(
      appError.create("Invalid category id", 400, httpStatusText.FAIL)
    );
  }
  // Check if category exists
  const category = await Category.findById(categoryId);
  if (!category)
    return next(
      appError.create("Category not found", 404, httpStatusText.FAIL)
    );

  // Prepare update data
  const updateData = { ...req.body };

if (updateData.name) {
  const existingCategory = await Category.findOne({ name: updateData.name, _id: { $ne: categoryId } });
  if (existingCategory) {
    return next(appError.create("Category name already exists", 400, httpStatusText.FAIL));
  }
}


  // Handle image update
  if (req.file) {
    // Delete old image from cloudinary if it exists and not placeholder
    if (category.image && !category.image.includes("placeholder")) {
      const publicId = category.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "categories",
    });
    updateData.image = result.secure_url;
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { category: updatedCategory },
  });
});

const deleteCategory = asyncWrapper(async (req, res, next) => {
  const categoryId = req.params.categoryId;
  const category = await Category.findById(categoryId);
  if (!category)
    return next(
      appError.create("Category not found", 404, httpStatusText.FAIL)
    );

  const productCount = await Product.countDocuments({ category: categoryId });
  if (productCount > 0) {
    return next(
      appError.create(
        `Cannot delete category with ${productCount} products. Delete or reassign products first.`,
        400,
        httpStatusText.FAIL
      )
    );
  }

  await Category.deleteOne({ _id: categoryId });
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
    message: "Category deleted successfully",
  });
});

const toggleCategoryStatus = asyncWrapper(async (req, res, next) => {
  const categoryId = req.params.categoryId;
  const category = await Category.findById(categoryId);
  if (!category)
    return next(
      appError.create("Category not found", 404, httpStatusText.FAIL)
    );

  category.isActive = !category.isActive;
  await category.save();
  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { category } });
});

export default {
  getAllCategories,
  getSingleCategory,
  addCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
};
