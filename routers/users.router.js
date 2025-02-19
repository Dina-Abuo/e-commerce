const express= require('express');
const controllers=require('../controllers/user.controller');
const verifyToken =require('../middlewares/verifyToken');


const router =express.Router()


router.route('/').get(verifyToken, controllers.getAllUsers);
router.route('/userId').delete(verifyToken,controllers.deleteUser)
                        .put(verifyToken,controllers.updateUser);

module.exports=router





