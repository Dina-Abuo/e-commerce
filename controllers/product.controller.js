import asyncWrapper from "../middlewares/asyncWrapper.js";
import Product from "../models/product.schema.js";
import Category from "../models/category.schema.js";
import appError from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";


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
        filter.isAvailable = query.isAvailable === 'true';
    }

    // Search by text
    if (query.search) {
        filter.$text = { $search: query.search };
    }

    const products = await Product.find(filter, { '__v': 0 })
        .populate('category', 'name description image')
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
                totalPages: Math.ceil(totalProducts / limit)
            }
        }
    });
});

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
        return next(appError.create("Category not found", 404, httpStatusText.FAIL));
    }

    // Build filter
    const filter = { category: categoryId };
    
    // Filter by brand (can be multiple brands)
    if (query.brands) {
        const brandsArray = query.brands.split(',');
        filter.brand = { $in: brandsArray };
    }
    
    // Filter by price range
    if (query.minPrice || query.maxPrice) {
        filter.price = {};
        if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
        if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
    }

    const products = await Product.find(filter, { '__v': 0 })
        .populate('category', 'name description')
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
                totalPages: Math.ceil(totalProducts / limit)
            }
        }
    });
});

// Get single product
const getSingleProduct = asyncWrapper(async (req, res, next) => {
    const productId = req.params.productId;
    
    const product = await Product.findById(productId, { '__v': 0 })
        .populate('category', 'name description image');

    if (!product) {
        return next(appError.create("Product not found", 404, httpStatusText.FAIL));
    }

    return res.json({
        status: httpStatusText.SUCCESS,
        data: { product }
    });
});

// Add product (Admin only)
const addProduct = asyncWrapper(async (req, res, next) => {
    const { name, title, description, price, brand, category, quantity, img, images } = req.body;

    // Validation
    if (!name || !title || !description || !price || !brand || !category) {
        return next(appError.create("All required fields must be provided", 400, httpStatusText.FAIL));
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
        return next(appError.create("Category not found", 404, httpStatusText.FAIL));
    }

    const newProduct = new Product({
        name,
        title,
        description,
        price,
        brand,
        category,
        quantity: quantity || 0,
        img: img || 'https://via.placeholder.com/300',
        images: images || []
    });

    await newProduct.save();

    const populatedProduct = await Product.findById(newProduct._id)
        .populate('category', 'name description');

    return res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { product: populatedProduct }
    });
});

// Update product (Admin only)
const updateProduct = asyncWrapper(async (req, res, next) => {
    const productId = req.params.productId;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        return next(appError.create("Product not found", 404, httpStatusText.FAIL));
    }

    // If category is being updated, check if it exists
    if (req.body.category) {
        const categoryExists = await Category.findById(req.body.category);
        if (!categoryExists) {
            return next(appError.create("Category not found", 404, httpStatusText.FAIL));
        }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $set: req.body },
        { new: true, runValidators: true }
    ).populate('category', 'name description');

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { product: updatedProduct }
    });
});

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
        message: "Product deleted successfully"
    });
});

// Get all brands
const getAllBrands = asyncWrapper(async (req, res, next) => {
    const brands = await Product.distinct('brand');
    
    return res.json({
        status: httpStatusText.SUCCESS,
        data: { brands }
    });
});

// Get brands by category
const getBrandsByCategory = asyncWrapper(async (req, res, next) => {
    const categoryId = req.params.categoryId;
    
    const brands = await Product.distinct('brand', { category: categoryId });
    
    return res.json({
        status: httpStatusText.SUCCESS,
        data: { brands }
    });
});

export default {
    getAllProducts,
    getProductsByCategory,
    getSingleProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    getAllBrands,
    getBrandsByCategory
};