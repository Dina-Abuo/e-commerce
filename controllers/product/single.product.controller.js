import asyncWrapper from "../../middlewares/asyncWrapper.js";
import Product from "../../models/product.schema.js";
import appError from "../../utils/appError.js";
import httpStatusText from "../../utils/httpStatusText.js";

// Get single product

const getSingleProduct = asyncWrapper(async (req, res, next) => {
  const productId = req.params.productId;

  const product = await Product.findById(productId, { __v: 0 }).populate(
    "category",
    "name description image"
  );

  if (!product) {
    return next(appError.create("Product not found", 404, httpStatusText.FAIL));
  }

  return res.json({
    status: httpStatusText.SUCCESS,
    data: { product },
  });
});

export default getSingleProduct;
