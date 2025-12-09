const { body } = require("express-validator");

const validationUserSchema = () => {
  return [
    body("firstName")
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 chars"),

    body("lastName")
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 chars"),

    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),

    body("phone")
      .notEmpty()
      .withMessage("Phone number is required")
      .isMobilePhone()
      .withMessage("Invalid phone number"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 chars"),

    body("address.city")
      .notEmpty()
      .withMessage("City is required")
      .isLength({ min: 2 })
      .withMessage("City must be at least 2 chars"),

    body("address.street")
      .notEmpty()
      .withMessage("Street is required")
      .isLength({ min: 2 })
      .withMessage("Street must be at least 2 chars"),
  ];
};

const validationProductSchema = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("Title is required ")
      .isLength({ min: 2 })
      .withMessage("Title at least is 2 digits"),
    body("price").notEmpty().withMessage("Price is required "),
    body("description").notEmpty().withMessage("Description is required "),
    body("productName")
      .notEmpty()
      .withMessage("Product Name is required ")
      .isLength({ min: 2 })
      .withMessage("Product Name at least is 2 digits"),
  ];
};

module.exports = {
  validationUserSchema,
  validationProductSchema,
};
