require('dotenv').config();

var cookieParser = require('cookie-parser');
var cors = require('cors');
var express = require('express');
var logger = require('morgan');

var env = require('./src/config/env');
var apiRouter = require('./src/routes');
var errorHandler = require('./src/middlewares/errorHandler');
var notFound = require('./src/middlewares/notFound');

var app = express();

app.use(logger(env.isProduction ? 'combined' : 'dev'));
app.use(cors({
  origin: env.corsOrigin,
  credentials: env.corsCredentials
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', function(req, res) {
  res.json({
    success: true,
    name: 'new-back-alerti',
    message: 'Alerti Node.js API',
    endpoints: {
      health: '/api/health',
      migrationStatus: '/api/migration/status'
    }
  });
});

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
