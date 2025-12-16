
import asyncWrapper from "../../middlewares/asyncWrapper.js";
import Product from "../../models/product.schema.js";
import httpStatusText from "../../utils/httpStatusText.js";


// Get all products with filters
const getAllProducts = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const limit = parseInt(query.limit) || 10;
  const page = parseInt(query.page) || 1;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};

  // Filter by category
  if (query.categoryId) {
    filter.category = query.categoryId;
  }

  // Filter by brand
  if (query.brand) {
    filter.brand = query.brand;
  }

  // Filter by price range
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
    if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
  }

  // Filter by availability
  if (query.isAvailable !== undefined) {
    filter.isAvailable = query.isAvailable === "true";
  }

  // Search by text
  if (query.search) {
    filter.$text = { $search: query.search };
  }

  const products = await Product.find(filter, { __v: 0 })
    .populate("category", "name description image")
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const totalProducts = await Product.countDocuments(filter);

  return res.json({
    status: httpStatusText.SUCCESS,
    data: {
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


export default getAllProducts;