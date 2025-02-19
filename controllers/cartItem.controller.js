
const CartItem=require("../models/cartItem.schema");
const Product=require("../models/product.schema");
const asyncWrapper=require("../middlewares/asyncWrapper");
const appError=require("../utils/appError");
const httpStatusText=require("../utils/httpStatusText");


const addToCart = asyncWrapper(async (req, res, next) => {
    const { productId, quantity } = req.body;
    const userId = req.currentUser.id;
    
    const product = await Product.findById(productId);
    if (!product) {
        return next(appError.create('Product not available', 400, httpStatusText.ERROR));
    }
    
    let cartItem = await CartItem.findOne({ userId, productId });

    if (cartItem) {
        cartItem.quantity += quantity;
    } else {
        cartItem = new CartItem({ userId, productId, quantity });
    }
    await cartItem.save();
    
    res.json({ status: httpStatusText.SUCCESS, data: { cartItem } });
});




const deleteCartItemById = asyncWrapper(async (req, res, next) => {
    const { cartItemId } = req.params;
    const cartItem = await CartItem.findById(cartItemId);
    if (!cartItem) {
        return next(appError.create('CartItem not found', 404, httpStatusText.ERROR));
    }
    await CartItem.findByIdAndDelete(cartItemId);
    res.json({ status: httpStatusText.SUCCESS, message: 'Item removed from cart' });
});



const BuyItemWithDiscount = asyncWrapper(async (req, res, next) => {
    const { discount = 1 } = req.body;
    const userId = req.currentUser.id;
    
    const cartItems = await CartItem.find({ userId }).populate('productId');
    if (!cartItems.length) {
        return next(appError.create('Cart is empty', 400, httpStatusText.ERROR));
    }
    
    let totalPriceBeforeDiscount = 0;
    let totalPriceAfterDiscount = 0;
    
    for (const item of cartItems) {
        totalPriceBeforeDiscount += item.productId.price * item.quantity;
    }
    totalPriceAfterDiscount = totalPriceBeforeDiscount * discount;
    
    await CartItem.deleteMany({ userId });

    res.json({ 
        status: httpStatusText.SUCCESS, 
        message: 'Purchase successful', 
        data: {cartItems, totalPriceBeforeDiscount, totalPriceAfterDiscount } 
    });
});


const BuyItemWithoutDiscount = asyncWrapper(async (req, res, next) => {
    const userId = req.currentUser.id;
    
    const cartItems = await CartItem.find({ userId }).populate('productId');
    if (!cartItems.length) {
        return next(appError.create('Cart is empty', 400, httpStatusText.ERROR));
    }
    
    let total = 0;
    
    for (const item of cartItems) {
        total += item.productId.price * item.quantity;
    }
    
    await CartItem.deleteMany({ userId });

    res.json({ 
        status: httpStatusText.SUCCESS, 
        message: 'Purchase successful', 
        data: {cartItems, total } 
    });
});



module.exports={
    addToCart,
    deleteCartItemById,
    BuyItemWithDiscount,
    BuyItemWithoutDiscount
}  