const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/user.schema");
const appError = require("../utils/appError");
const bcrypt = require("bcrypt");
const generateJWT = require("../utils/generateJWT");
const httpStatusText = require("../utils/httpStatusText");
const { validationResult } = require("express-validator");

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email && !password) {
    const error = appError.create(
      "Email and  password are required ",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    const error = appError.create("user not found", 400, httpStatusText.FAIL);
    return next(error);
  }
  // compare password
  const matchedPassword = await bcrypt.compare(password, user.password);

  if (user && matchedPassword) {
    // logged in  successfully
    const token = await generateJWT({
      userName: user.userName,
      email: user.email,
      id: user._id,
      role: user.role,
    });
    return res.json({ status: httpStatusText.SUCCESS, data: { token } });
  } else {
    const error = appError.create(
      " something wrong ",
      500,
      httpStatusText.FAIL
    );
    return next(error);
  }
});

const register = asyncWrapper(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors
      .array()
      .map((e) => e.msg)
      .join(" | ");
    const error = appError.create(msg, 400, httpStatusText.FAIL);
    return next(error);
  }

  const { firstName, lastName, password, role, email, phone, address } =
    req.body;

  // Check if email exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = appError.create(
      "Email already exists",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  //  Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  //  Create new user
  const newUser = new User({
    firstName,
    lastName,
    password: hashedPassword,
    role,
    email,
    phone,
    address,
  });

  //  Generate JWT
  const token = await generateJWT({
    id: newUser._id,
    role: newUser.role,
    email: newUser.email,
  });

  newUser.token = token;

  //  Save user to DB
  await newUser.save();

  //  Response
  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { user: newUser },
  });
});

module.exports = {
  register,
  login,
};
