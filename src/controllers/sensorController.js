var sensorService = require('../services/sensorService');
var supabaseConfig = require('../config/supabase');

function ensureSupabase(res) {
  if (!supabaseConfig.isSupabaseConfigured()) {
    res.status(503).json({
      success: false,
      error: 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    });
    return false;
  }
  return true;
}

async function getAllSensors(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var sensors = await sensorService.getAllSensors();
    return res.json(sensors);
  } catch (error) {
    return next(error);
  }
}

async function addDispositive(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    await sensorService.addDispositive(req.body || {});
    return res.send('Dispositif ajouté avec succès');
  } catch (error) {
    return next(error);
  }
}

async function getSensorHistory(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var history = await sensorService.getHistoryBySensorId(req.params.id);
    return res.json(history);
  } catch (error) {
    return next(error);
  }
}

async function getHistoryByDate(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    if (!req.query.date) {
      return res.status(400).json({ success: false, error: 'Le paramètre date est obligatoire (YYYY-MM-DD)' });
    }
    var history = await sensorService.getHistoryBySensorIdAndDate(req.params.id, req.query.date);
    return res.json(history);
  } catch (error) {
    return next(error);
  }
}

async function getSensorWithHistory(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var sensor = await sensorService.getSensorWithHistory(req.params.sensorId);
    if (!sensor) return res.status(404).send();
    return res.json(sensor);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllSensors: getAllSensors,
  addDispositive: addDispositive,
  getSensorHistory: getSensorHistory,
  getHistoryByDate: getHistoryByDate,
  getSensorWithHistory: getSensorWithHistory
};
