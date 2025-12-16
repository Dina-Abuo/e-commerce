import asyncWrapper from "../../middlewares/asyncWrapper.js";
import appError from "../../utils/appError.js";
import httpStatusText from "../../utils/httpStatusText.js";
import Product from "../../models/product.schema.js";
import Category from "../../models/category.schema.js";
// Get products by category
const getProductsByCategory = asyncWrapper(async (req, res, next) => {
  const categoryId = req.params.categoryId;
  const query = req.query;
  const limit = parseInt(query.limit) || 10;
  const page = parseInt(query.page) || 1;
  const skip = (page - 1) * limit;

  // Check if category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    return next(
      appError.create("Category not found", 404, httpStatusText.FAIL)
    );
  }

  // Build filter
  const filter = { category: categoryId };

  // Filter by brand (can be multiple brands)
  if (query.brands) {
    const brandsArray = query.brands.split(",");
    filter.brand = { $in: brandsArray };
  }

  // Filter by price range
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
    if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
  }

  const products = await Product.find(filter, { __v: 0 })
    .populate("category", "name description")
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const totalProducts = await Product.countDocuments(filter);

  return res.json({
    status: httpStatusText.SUCCESS,
    data: {
      category,
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
    },
  });
});


export default getProductsByCategory;