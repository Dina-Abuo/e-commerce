const express = require("express");
const mongoose = require("mongoose");
const productsRouter = require("./routers/products.router");
const usersRouter = require("./routers/users.router");
const authRouter = require("./routers/auth.router");
const cartRouter = require("./routers/cartItem.router");
const httpStatusText = require("./utils/httpStatusText");
const globalError = require("./middlewares/globalError");

const cors = require("cors");

require("dotenv").config();

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
app.use("/api/cart", cartRouter);

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
