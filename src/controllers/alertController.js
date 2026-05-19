var alertService = require('../services/alertService');

function calculateAlertLevel(req, res) {
  var result = alertService.calculateAlert(req.query.niveauEau, req.query.seuilEau);
  res.json(result);
}

module.exports = {
  calculateAlertLevel: calculateAlertLevel
};
