import asyncWrapper from "../../middlewares/asyncWrapper.js";
import Product from "../../models/product.schema.js";
import httpStatusText from "../../utils/httpStatusText.js";

// Get all brands
const getAllBrands = asyncWrapper(async (req, res, next) => {
  const brands = await Product.distinct("brand");

  return res.json({
    status: httpStatusText.SUCCESS,
    data: { brands },
  });
});
export default getAllBrands;
