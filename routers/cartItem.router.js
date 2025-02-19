const express=require("express")

const verifyToken=require("../middlewares/verifyToken");
const allowedTo=require("../middlewares/allowedTo");
const controller=require("../controllers/cartItem.controller");
const userRoles=require("../utils/userRoles");
const router=express.Router();



router.route('/').post( verifyToken,allowedTo(userRoles.USER),controller.addToCart)
router.route('/:cartItemId').delete( verifyToken,controller.deleteCartItemById)
router.route('/buy/without-discount').post( verifyToken,allowedTo(userRoles.USER),controller.BuyItemWithoutDiscount)
router.route('/buy/discount').post( verifyToken,allowedTo(userRoles.USER),controller.BuyItemWithDiscount)




module.exports=router