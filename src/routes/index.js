var express = require('express');
var healthRoutes = require('./healthRoutes');
var migrationRoutes = require('./migrationRoutes');

var router = express.Router();

router.use('/health', healthRoutes);
router.use('/migration', migrationRoutes);

module.exports = router;
