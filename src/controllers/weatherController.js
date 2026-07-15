var weatherService = require('../services/weatherService');
var sensorService = require('../services/sensorService');
var supabaseConfig = require('../config/supabase');

async function getCurrentWeather(req, res, next) {
  try {
    var weatherData = await weatherService.getCurrentWeather(req.params.localite);
    if (weatherData.success) return res.json(weatherData);
    return res.status(400).json(weatherData);
  } catch (error) {
    return next(error);
  }
}

async function getRainForecast(req, res, next) {
  try {
    var forecastData = await weatherService.getRainForecast(req.params.localite, req.query.days || 3);
    if (forecastData.success) return res.json(forecastData);
    return res.status(400).json(forecastData);
  } catch (error) {
    return next(error);
  }
}

async function testAlertWithWeather(req, res, next) {
  try {
    var response = await weatherService.testAlertWithWeather(req.params.localite, req.query.seuil || 25.95);
    if (response.success) return res.json(response);
    return res.status(400).json(response);
  } catch (error) {
    return next(error);
  }
}

async function debugWeather(req, res, next) {
  try {
    return res.json(await weatherService.getCurrentWeather(req.params.localite));
  } catch (error) {
    return next(error);
  }
}

async function getWeatherForSensor(req, res, next) {
  try {
    if (!supabaseConfig.isSupabaseConfigured()) {
      return res.status(503).json({ success: false, error: 'Supabase non configuré' });
    }
    var sensor = await sensorService.findById(req.params.sensorId);
    if (!sensor) return res.status(404).send();
    var weatherData = await weatherService.getWeatherByCoordinates(
      sensor.latitude,
      sensor.longitude,
      sensor.localite
    );
    if (weatherData.success) return res.json(weatherData);
    return res.status(400).json(weatherData);
  } catch (error) {
    return next(error);
  }
}

async function getForecastForSensor(req, res, next) {
  try {
    if (!supabaseConfig.isSupabaseConfigured()) {
      return res.status(503).json({ success: false, error: 'Supabase non configuré' });
    }
    var sensor = await sensorService.findById(req.params.sensorId);
    if (!sensor) return res.status(404).send();
    var days = Number(req.query.days || 3);
    var weatherData = await weatherService.getWeatherByCoordinates(
      sensor.latitude,
      sensor.longitude,
      sensor.localite
    );
    if (!weatherData.success) return res.status(400).json(weatherData);
    return res.json({
      success: true,
      sensor_id: sensor.id,
      localite: sensor.localite,
      days_requested: days,
      pluviometrie_24h: weatherData.pluviometrie_24h,
      pluviometrie_7days: weatherData.pluviometrie_7days,
      rain_hours_24h: weatherData.rain_hours_24h,
      rain_days_7days: weatherData.rain_days_7days,
      current_rain_1h: weatherData.pluviometrie_1h,
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      description: weatherData.description
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCurrentWeather: getCurrentWeather,
  getRainForecast: getRainForecast,
  testAlertWithWeather: testAlertWithWeather,
  debugWeather: debugWeather,
  getWeatherForSensor: getWeatherForSensor,
  getForecastForSensor: getForecastForSensor
};
