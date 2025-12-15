import jwt from "jsonwebtoken";
import appError from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";
import dotenv from "dotenv";

dotenv.config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) {
    const error = appError.create("Token is required", 401, httpStatusText.ERROR);
    return next(error);
  }
  const token = authHeader.split(" ")[1];
  try {
    const currentUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.currentUser = currentUser;
    console.log("currentUser: ", currentUser);
    next();
  } catch (err) {
    const error = appError.create("Invalid token", 401, httpStatusText.ERROR);
    return next(error);
  }
};

export default verifyToken;
