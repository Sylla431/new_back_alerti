var express = require('express');
var aiProxyController = require('../controllers/aiProxyController');

var router = express.Router();

router.all('/predict', aiProxyController.forwardToPython);
router.all('/predict-meteo', aiProxyController.forwardToPython);
router.all('/bamako/predict', aiProxyController.forwardToPython);
router.all('/predict-image', aiProxyController.forwardToPython);
router.all('/predict/neighborhood', aiProxyController.forwardToPython);
router.all('/forecast/:country', aiProxyController.forwardToPython);
router.all('/countries', aiProxyController.forwardToPython);
router.all('/mali/neighborhoods', aiProxyController.forwardToPython);
router.all('/mali/neighborhood/:neighborhood_name/predict', aiProxyController.forwardToPython);
router.all('/subscribe/push', aiProxyController.forwardToPython);
router.all('/alert/subscribe', aiProxyController.forwardToPython);
router.all('/weather/at', aiProxyController.forwardToPython);
router.all('/weather/diag', aiProxyController.forwardToPython);
router.all('/satellite-image/:location', aiProxyController.forwardToPython);
router.all('/ai/health', aiProxyController.forwardToPython);

module.exports = router;
