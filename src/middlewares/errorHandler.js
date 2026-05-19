var env = require('../config/env');

function errorHandler(err, req, res, next) {
  var statusCode = err.status || err.statusCode || 500;
  var response = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: statusCode === 500 && env.isProduction ? 'Internal server error' : err.message
    }
  };

  if (!env.isProduction && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
