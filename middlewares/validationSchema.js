const{body}=require("express-validator");

const validationUserSchema=()=>{
    return[
    body('firstName')
        .notEmpty()
        .withMessage("first Name is required ")
        .isLength({min:2})
        .withMessage("first Name at least is 2 digits"),
    body('lastName')
        .notEmpty()
        .withMessage("las Name is required ")
        .isLength({min:2})
        .withMessage("last Name at least is 2 digits"),
    body('email')
        .notEmpty()
        .withMessage("Email is required "),
    body('phone')
        .notEmpty()
        .withMessage("Phone is required "),
    body('userName')
        .notEmpty()
        .withMessage("UserName is required "),
    body('password')
        .notEmpty()
        .withMessage("Password is required "),

    ]
}

const validationProductSchema=()=>{
    return[
        body('title')
            .notEmpty()
            .withMessage("Title is required ")
            .isLength({min:2})
            .withMessage("Title at least is 2 digits"),
        body('price')
            .notEmpty()
            .withMessage("Price is required "),
        body('description')
            .notEmpty()
            .withMessage("Description is required "),
        body('productName')
            .notEmpty()
            .withMessage("Product Name is required ")
            .isLength({min:2})
            .withMessage("Product Name at least is 2 digits"),
    ]
}

module.exports={
    validationUserSchema,
    validationProductSchema
}