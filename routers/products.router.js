const express=require("express");
const controllers=require('../controllers/product.controller');
const verifyToken =require('../middlewares/verifyToken');


const router =express.Router()


router.route('/').get(controllers.getAllProducts)
                .post(verifyToken, controllers.addProduct)
router.route('/:productId').get(controllers.getSingleProduct)
                        .delete(verifyToken,controllers.deleteProduct)
                        .put(verifyToken,controllers.updateProduct)

module.exports=router



