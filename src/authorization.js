const logger = require("./logger.js");

function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_KEY;
  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: "Unauthorized request" });
  }
  next();
}

module.exports = validateBearerToken;
