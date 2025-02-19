const mongoose =require("mongoose")
const CartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quantity: Number,
});



module.exports=mongoose.model('CartItem',CartItemSchema)