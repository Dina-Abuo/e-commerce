
const asyncWrapper=require("../middlewares/asyncWrapper")
const Product=require("../models/product.schema")
const appError = require("../utils/appError")
const httpStatusText=require("../utils/httpStatusText")


const getAllProducts=asyncWrapper(async(req,res,next)=>{
    const query=req.query
    const limit=query.limit||10;
    const page=query.page||1;
    const skip=(page-1)*limit; 

    const products=await Product.find({},{'__v':0}).limit(limit).skip(skip);
    return res.json({status:httpStatusText.SUCCESS,data:{products}})
})

const getSingleProduct=asyncWrapper(async(req,res,next)=>{
    const productId=req.params.productId
    const product=await Product.findById(productId)
    
    if(!product){
        const error=appError.create("product not found ",404,httpStatusText.FAIL)
        return next(error) 
    }

    return res.json({status:httpStatusText.SUCCESS,data:{product}})
})

const addProduct=asyncWrapper(async(req,res,next)=>{
        const { productName, title, description, price } = req.body;

        if (!productName || !title || !description || !price) {
            return next(appError.create("All fields are required", 400, httpStatusText.FAIL));
        }
    
        const newProduct = new Product({
            productName,
            title,
            description,
            price
        });
    
        await newProduct.save();
    
        return res.status(201).json({ status: httpStatusText.SUCCESS, data: { product: newProduct } });
    });
    

const updateProduct=asyncWrapper(async(req,res,next)=>{
    const productId=req.params.productId;
    const updatedProduct=await Product.updateOne({_id:productId},{$set:{...req.body}})          
    return res.status(200).json({status:httpStatusText.SUCCESS,data:{Product:updatedProduct}})
})

const deleteProduct=asyncWrapper(async(req,res,next)=>{
    const productId=req.params.productId;
    await Product.deleteOne({_id:productId})
    return res.status(200).json({status:httpStatusText.SUCCESS,data:null})
})


module.exports={
    getAllProducts,
    getSingleProduct,
    addProduct,
    updateProduct,
    deleteProduct
}