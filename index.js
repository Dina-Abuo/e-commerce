import express from "express";
import mongoose from "mongoose";
// routers
import productsRouter from "./routers/products.router.js";
import categoriesRouter from "./routers/category.router.js";
import usersRouter from "./routers/users.router.js";
import authRouter from "./routers/auth.router.js";
import paymentRouter from "./routers/payment.routes.js";
import ordersRouter from "./routers/order.routes.js";

import httpStatusText from "./utils/httpStatusText.js";
import globalError from "./middlewares/globalError.js";

import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 4000;
const app = express();

const url = process.env.MONGO_URL;
mongoose
  .connect(url)
  .then(() => {
    console.log("connected successfully ");
  })
  .catch((err) => {
    console.log(`error with connecting with the db ${err}`);
  });

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRouter);
app.use("/api/user", usersRouter);
app.use("/api/product", productsRouter);
app.use("/api/category", categoriesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payment", paymentRouter);


// global middleware for not found router
app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: httpStatusText.ERROR,
    message: "this resources not available",
  });
});

// global error handler
app.use(globalError);

mongoose.connection.on("error", (err) => {
  console.log("MongoDB Connection Error:", err);
});

app.listen(port, () => {
  console.log(`server run ...........  http://localhost:${port} `);
});
