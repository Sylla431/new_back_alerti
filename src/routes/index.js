var express = require('express');
var alertRoutes = require('./alertRoutes');
var healthRoutes = require('./healthRoutes');
var migrationRoutes = require('./migrationRoutes');

var router = express.Router();

router.use('/alerts', alertRoutes);
router.use('/health', healthRoutes);
router.use('/migration', migrationRoutes);

module.exports = router;
