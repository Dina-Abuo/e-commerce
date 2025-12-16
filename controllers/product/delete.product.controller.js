import asyncWrapper from "../../middlewares/asyncWrapper.js";
import Product from "../../models/product.schema.js";
import appError from "../../utils/appError.js";
import httpStatusText from "../../utils/httpStatusText.js";

// Delete product (Admin only)
const deleteProduct = asyncWrapper(async (req, res, next) => {
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  if (!product) {
    return next(appError.create("Product not found", 404, httpStatusText.FAIL));
  }

  await Product.deleteOne({ _id: productId });

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: null,
    message: "Product deleted successfully",
  });
});
export default deleteProduct;