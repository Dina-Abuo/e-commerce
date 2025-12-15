import mongoose from "mongoose";  
const CartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quantity: Number,
});


export default mongoose.model('CartItem',CartItemSchema)