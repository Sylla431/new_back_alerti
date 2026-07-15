var env = require('../config/env');

var WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
var FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

var LOCALITE_COORDINATES = {
  bamako: { lat: 12.65, lon: -8.0 },
  sebenikoro: { lat: 12.65, lon: -8.0 },
  dakar: { lat: 14.6928, lon: -17.4467 },
  'thiès': { lat: 14.8, lon: -16.9 },
  'saint-louis': { lat: 16.0333, lon: -16.5 }
};

function createErrorResponse(message) {
  return {
    success: false,
    error: message
  };
}

function getCoordinatesForLocalite(localite) {
  if (!localite) {
    return LOCALITE_COORDINATES.bamako;
  }

  var key = String(localite).toLowerCase();
  return LOCALITE_COORDINATES[key] || LOCALITE_COORDINATES.bamako;
}

function extractRain3h(step) {
  if (!step || !step.rain) {
    return 0;
  }

  if (typeof step.rain === 'number') {
    return step.rain;
  }

  if (step.rain['3h'] != null) {
    return Number(step.rain['3h']) || 0;
  }

  return 0;
}

function processWeather25Data(current, forecastPayload) {
  var result = {
    success: true,
    source: 'OpenWeatherMap API 2.5'
  };

  var main = current.main || {};
  result.temperature = main.temp;
  result.humidity = main.humidity;
  result.pressure = main.pressure;

  var rain1h = 0;
  if (current.rain && current.rain['1h'] != null) {
    rain1h = Number(current.rain['1h']) || 0;
  }
  result.pluviometrie_1h = rain1h;

  var weatherList = current.weather || [];
  if (weatherList.length > 0) {
    result.description = weatherList[0].description;
    result.main = weatherList[0].main;
    result.icon = weatherList[0].icon;
  }

  var list = forecastPayload.list || [];
  var totalRain24h = 0;
  var rainHours24h = 0;
  var dailyRain = {};
  var dailyHasRain = {};

  var limit24 = Math.min(8, list.length);
  for (var i = 0; i < limit24; i += 1) {
    var stepRain = extractRain3h(list[i]);
    if (stepRain > 0) {
      totalRain24h += stepRain;
      rainHours24h += 1;
    }
  }

  for (var j = 0; j < list.length; j += 1) {
    var step = list[j];
    if (step.dt == null) {
      continue;
    }

    var day = new Date(Number(step.dt) * 1000).toISOString().slice(0, 10);
    var rain = extractRain3h(step);
    dailyRain[day] = (dailyRain[day] || 0) + rain;
    if (rain > 0) {
      dailyHasRain[day] = true;
    }
  }

  var totalRainDays = 0;
  Object.keys(dailyRain).forEach(function(dayKey) {
    totalRainDays += dailyRain[dayKey];
  });

  result.pluviometrie_24h = totalRain24h;
  result.rain_hours_24h = rainHours24h;
  result.pluviometrie_7days = totalRainDays;
  result.rain_days_7days = Object.keys(dailyHasRain).length;
  result.timestamp = Date.now();

  return result;
}

async function fetchJson(url) {
  var response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });

  var body = await response.json().catch(function() {
    return null;
  });

  if (!response.ok) {
    var message = (body && (body.message || body.error)) || ('HTTP ' + response.status);
    throw new Error(message);
  }

  return body;
}

async function getWeatherByCoordinates(latitude, longitude, localite) {
  try {
    if (latitude == null || longitude == null) {
      return createErrorResponse('Coordonnées GPS manquantes');
    }

    if (!env.openWeatherMapApiKey) {
      return createErrorResponse('OPENWEATHERMAP_API_KEY non configurée');
    }

    var commonQuery =
      '?lat=' + latitude +
      '&lon=' + longitude +
      '&appid=' + env.openWeatherMapApiKey +
      '&units=metric' +
      '&lang=fr';

    var current = await fetchJson(WEATHER_URL + commonQuery);
    var forecast = await fetchJson(FORECAST_URL + commonQuery);
    var result = processWeather25Data(current, forecast || {});

    result.localite = localite;
    result.latitude = Number(latitude);
    result.longitude = Number(longitude);

    return result;
  } catch (error) {
    return createErrorResponse('Erreur: ' + error.message);
  }
}

async function getCurrentWeather(localite) {
  try {
    var coordinates = getCoordinatesForLocalite(localite);
    return getWeatherByCoordinates(coordinates.lat, coordinates.lon, localite);
  } catch (error) {
    return createErrorResponse('Erreur: ' + error.message);
  }
}

async function getRainForecast(localite, days) {
  var weatherData = await getCurrentWeather(localite);

  if (!weatherData.success) {
    return weatherData;
  }

  return {
    success: true,
    localite: localite,
    days_requested: Number(days) || 3,
    pluviometrie_24h: weatherData.pluviometrie_24h,
    pluviometrie_7days: weatherData.pluviometrie_7days,
    rain_hours_24h: weatherData.rain_hours_24h,
    rain_days_7days: weatherData.rain_days_7days,
    current_rain_1h: weatherData.pluviometrie_1h,
    temperature: weatherData.temperature,
    humidity: weatherData.humidity,
    description: weatherData.description
  };
}

function buildAlertTestResponse(weatherData, localite, seuil) {
  var threshold = Number(seuil);
  if (!Number.isFinite(threshold) || threshold === 0) {
    threshold = 25.95;
  }

  var pluviometrie = Number(weatherData.pluviometrie_24h) || 0;
  if (pluviometrie === 0) {
    pluviometrie = Number(weatherData.pluviometrie_1h) || 0;
  }

  var ratio = pluviometrie / threshold;
  var alertLevel = 'NORMAL';

  if (ratio >= 0.85) {
    alertLevel = 'DANGER';
  } else if (ratio >= 0.7) {
    alertLevel = 'ATTENTION';
  }

  return {
    success: true,
    localite: localite,
    pluviometrie_24h: weatherData.pluviometrie_24h,
    pluviometrie_1h: weatherData.pluviometrie_1h,
    pluviometrie_7days: weatherData.pluviometrie_7days,
    pluviometrie_utilisee: pluviometrie,
    seuil_configure: threshold,
    ratio: ratio,
    pourcentage: ratio * 100,
    alert_level: alertLevel,
    temperature: weatherData.temperature,
    humidity: weatherData.humidity,
    description: weatherData.description,
    rain_hours_24h: weatherData.rain_hours_24h,
    rain_days_7days: weatherData.rain_days_7days
  };
}

async function testAlertWithWeather(localite, seuil) {
  var weatherData = await getCurrentWeather(localite);

  if (!weatherData.success) {
    return weatherData;
  }

  return buildAlertTestResponse(weatherData, localite, seuil);
}

module.exports = {
  getCurrentWeather: getCurrentWeather,
  getRainForecast: getRainForecast,
  getWeatherByCoordinates: getWeatherByCoordinates,
  testAlertWithWeather: testAlertWithWeather,
  getCoordinatesForLocalite: getCoordinatesForLocalite
};
