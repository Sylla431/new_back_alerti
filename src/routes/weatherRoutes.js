var express = require('express');
var weatherController = require('../controllers/weatherController');

var router = express.Router();

router.get('/current/:localite', weatherController.getCurrentWeather);
router.get('/forecast/:localite', weatherController.getRainForecast);
router.get('/forecast-sensor/:sensorId', weatherController.getForecastForSensor);
router.get('/sensor/:sensorId', weatherController.getWeatherForSensor);
router.get('/alert-test/:localite', weatherController.testAlertWithWeather);
router.get('/debug/:localite', weatherController.debugWeather);

module.exports = router;
