/**
 * Entrypoint Vercel Serverless Function.
 * Toutes les routes Express sont réécrites vers /api via vercel.json.
 */
var app = require('../app');

module.exports = app;
