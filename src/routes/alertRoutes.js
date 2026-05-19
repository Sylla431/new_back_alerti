var express = require('express');
var alertController = require('../controllers/alertController');

var router = express.Router();

router.get('/calculate', alertController.calculateAlertLevel);

module.exports = router;
