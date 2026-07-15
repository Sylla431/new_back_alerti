var express = require('express');
var sensorController = require('../controllers/sensorController');

var router = express.Router();

router.get('/:sensorId', sensorController.getSensorWithHistory);

module.exports = router;
