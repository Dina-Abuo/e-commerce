import mongoose from "mongoose";  
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    brand: {
        type: String,
        required: true,
        enum: ['Dell', 'Lenovo', 'Mac', 'HP', 'Asus', 'Other']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    img: {
        type: String,
        required: true,
        default: 'https://via.placeholder.com/300'
    },
    images: [{
        type: String
    }],
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index للبحث السريع
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', title: 'text', description: 'text' });

// Middleware لتحديث isAvailable تلقائياً
productSchema.pre('save', function(next) {
    this.isAvailable = this.quantity > 0;
    next();
});

export default mongoose.model('Product', productSchema);