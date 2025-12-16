import asyncWrapper from "../../middlewares/asyncWrapper.js";
import Product from "../../models/product.schema.js";
import httpStatusText from "../../utils/httpStatusText.js";

// Get brands by category
const getBrandsByCategory = asyncWrapper(async (req, res, next) => {
  const categoryId = req.params.categoryId;

  const brands = await Product.distinct("brand", { category: categoryId });

  return res.json({
    status: httpStatusText.SUCCESS,
    data: { brands },
  });
});
export default getBrandsByCategory;
