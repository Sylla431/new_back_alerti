var express = require('express');
var sensorController = require('../controllers/sensorController');

var router = express.Router();

router.get('/', sensorController.getAllSensors);
router.post('/adddispo', sensorController.addDispositive);
router.get('/:id/history', sensorController.getSensorHistory);
router.get('/:id/history-by-date', sensorController.getHistoryByDate);

module.exports = router;
