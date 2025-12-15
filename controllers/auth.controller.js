import asyncWrapper from "../middlewares/asyncWrapper.js";
import User from "../models/user.schema.js";
import appError from "../utils/appError.js";
import bcrypt from "bcrypt";
import generateJWT from "../utils/generateJWT.js";
import httpStatusText from "../utils/httpStatusText.js";
import { validationResult } from "express-validator";

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
  const user = await User.findOne({ email });
  if (!user) {
    const error = appError.create("user not found", 400, httpStatusText.FAIL);
    return next(error);
  }
  const matchedPassword = await bcrypt.compare(password, user.password);
  if (user && matchedPassword) {
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

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = appError.create(
      "Email already exists",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    firstName,
    lastName,
    password: hashedPassword,
    role,
    email,
    phone,
    address,
  });

  const token = await generateJWT({
    id: newUser._id,
    role: newUser.role,
    email: newUser.email,
  });

  newUser.token = token;

  await newUser.save();

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { user: newUser },
  });
});

export default {
  register,
  login,
};
