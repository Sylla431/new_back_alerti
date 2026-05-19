var ALERT_LEVELS = {
  NORMAL: {
    name: 'NORMAL',
    label: 'Normal',
    description: "Le niveau d'eau est normal",
    minRatio: 0,
    maxRatio: 0.6,
    necessiteNotification: false
  },
  ATTENTION: {
    name: 'ATTENTION',
    label: 'Attention',
    description: "Le niveau d'eau nécessite une surveillance",
    minRatio: 0.6,
    maxRatio: 0.85,
    necessiteNotification: true
  },
  DANGER: {
    name: 'DANGER',
    label: 'Danger',
    description: "Le niveau d'eau est critique, risque d'inondation",
    minRatio: 0.85,
    maxRatio: Number.MAX_VALUE,
    necessiteNotification: true
  }
};

function toNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  var parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function determineAlertLevel(niveauEau, seuilEau) {
  var waterLevel = toNumber(niveauEau);
  var threshold = toNumber(seuilEau);

  if (waterLevel === null || threshold === null || threshold === 0) {
    return ALERT_LEVELS.NORMAL;
  }

  var ratio = waterLevel / threshold;
  var levels = Object.keys(ALERT_LEVELS).map(function(key) {
    return ALERT_LEVELS[key];
  });

  for (var i = 0; i < levels.length; i += 1) {
    var level = levels[i];
    if (ratio >= level.minRatio && ratio < level.maxRatio) {
      return level;
    }
  }

  return ALERT_LEVELS.DANGER;
}

function calculateAlert(niveauEau, seuilEau) {
  var waterLevel = toNumber(niveauEau);
  var threshold = toNumber(seuilEau);
  var level = determineAlertLevel(waterLevel, threshold);
  var result = {
    niveauEau: waterLevel,
    seuilEau: threshold,
    alertLevel: level.name,
    alertLabel: level.label,
    alertDescription: level.description,
    necessiteNotification: level.necessiteNotification
  };

  if (threshold !== null && threshold !== 0 && waterLevel !== null) {
    result.pourcentageSeuil = (waterLevel / threshold) * 100;
  }

  return result;
}

module.exports = {
  ALERT_LEVELS: ALERT_LEVELS,
  calculateAlert: calculateAlert,
  determineAlertLevel: determineAlertLevel
};
