import asyncWrapper from "../middlewares/asyncWrapper.js";
import User from "../models/user.schema.js";
import appError from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";

const getAllUsers = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  const Users = await User.find({}, { __v: 0, password: 0, token: 0 })
    .limit(limit)
    .skip(skip);
  return res.json({ status: httpStatusText.SUCCESS, data: { Users } });
});

const updateUser = asyncWrapper(async (req, res, next) => {
  const { userName, password, confirmPassword } = req.body;
  const userId = req.params.userId;
  const user = await User.findById(userId);
  if (!user) {
    const error = appError.create("user not found", 404, httpStatusText.ERROR);
    return next(error);
  }
  if (User.password !== password || User.userName !== userName) {
    const error = appError.create(
      "Incorrect password or userName",
      400,
      httpStatusText.ERROR
    );
    return next(error);
  }

  user.password = confirmPassword;
  await user.save();
  res.json({ status: httpStatusText.SUCCESS, data: { user } });
});

const deleteUser = asyncWrapper(async (req, res, next) => {
  const { userName, password } = req.body;
  const userId = req.params.userId;

  const user = await User.findById(userId);
  if (!user) {
    const error = appError.create("user not found", 404, httpStatusText.ERROR);
    return next(error);
  }
  if (User.password !== password || User.userName !== userName) {
    const error = appError.create(
      "Incorrect password or userName",
      400,
      httpStatusText.ERROR
    );
    return next(error);
  }
  await User.deleteOne({ _id: userId });
  res.json({ status: httpStatusText.SUCCESS, data: null });
});

export default {
  getAllUsers,
  updateUser,
  deleteUser,
};
