const httpStatusText = require("../utils/httpStatusText");

const globalError = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  return  res.status(statusCode).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: statusCode,
  });
};

module.exports = globalError;
