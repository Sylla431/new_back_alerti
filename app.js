var cookieParser = require('cookie-parser');
var cors = require('cors');
var express = require('express');
var logger = require('morgan');

var env = require('./src/config/env');
var apiRouter = require('./src/routes');
var authRoutes = require('./src/routes/authRoutes');
var mobileQuizRoutes = require('./src/routes/mobileQuizRoutes');
var legacySensorRoutes = require('./src/routes/legacySensorRoutes');
var errorHandler = require('./src/middlewares/errorHandler');
var notFound = require('./src/middlewares/notFound');

var app = express();

// Requis derrière le reverse-proxy Vercel
app.set('trust proxy', 1);

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
    message: 'Alerti Node.js API — migration progressive',
    runtime: process.env.VERCEL ? 'vercel' : 'node',
    endpoints: {
      health: '/api/health',
      migrationStatus: '/api/migration/status',
      authMobile: '/auth/mobile/login',
      sos: '/api/sos/signaux',
      sensors: '/api/sensors',
      quizMobile: '/quiz/full-quiz-data',
      aiPredict: '/api/predict',
      aiProxyHealth: '/api/ai/health'
    }
  });
});

app.use('/auth', authRoutes);
app.use('/api', apiRouter);
app.use('/quiz', mobileQuizRoutes);
app.use('/sensors', legacySensorRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
