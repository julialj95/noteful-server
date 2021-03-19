const { NODE_ENV } = require("./config.js");

function errorHandler(error, req, res, next) {
  let response;
  console.error(error);
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { message: error.message, error };
  }
  res.status(500).json(response);
}

module.exports = errorHandler;
