var supabaseService = require('./supabaseService');

function getClient() {
  return supabaseService.getClient();
}

function toIso(date) {
  return (date instanceof Date ? date : new Date(date || Date.now())).toISOString();
}

async function getAllSensors() {
  var response = await getClient().from('sensors').select('*');
  if (response.error) throw response.error;
  return response.data || [];
}

async function findById(sensorId) {
  var response = await getClient().from('sensors').select('*').eq('id', sensorId).maybeSingle();
  if (response.error) throw response.error;
  return response.data || null;
}

async function getHistoryBySensorId(sensorId) {
  var response = await getClient()
    .from('history')
    .select('*')
    .eq('sensor_id', sensorId)
    .order('timestamp', { ascending: false });
  if (response.error) throw response.error;
  return response.data || [];
}

async function getHistoryBySensorIdAndDate(sensorId, date) {
  var start = date + 'T00:00:00';
  var endDate = new Date(date + 'T00:00:00Z');
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  var end = endDate.toISOString().slice(0, 19);

  var response = await getClient()
    .from('history')
    .select('*')
    .eq('sensor_id', sensorId)
    .gte('timestamp', start)
    .lt('timestamp', end);
  if (response.error) throw response.error;
  return response.data || [];
}

async function getSensorWithHistory(sensorId) {
  var sensor = await findById(sensorId);
  if (!sensor) return null;
  var history = await getHistoryBySensorId(sensorId);
  sensor.history = history;
  return sensor;
}

async function addDispositive(sensorPartial) {
  var now = new Date();
  var payload = {
    timestamp: toIso(sensorPartial.timestamp || now),
    updated_at: toIso(now)
  };

  if (sensorPartial.id != null) payload.id = sensorPartial.id;
  if (sensorPartial.statut != null) payload.statut = sensorPartial.statut;
  if (sensorPartial.localite != null) payload.localite = sensorPartial.localite;
  if (sensorPartial.latitude != null) payload.latitude = sensorPartial.latitude;
  if (sensorPartial.longitude != null) payload.longitude = sensorPartial.longitude;
  if (sensorPartial.seuilniveauEau != null) payload.seuilniveauEau = sensorPartial.seuilniveauEau;

  var response = await getClient().from('sensors').insert(payload).select();
  if (response.error) throw response.error;
  return response.data && response.data[0] ? response.data[0] : null;
}

module.exports = {
  getAllSensors: getAllSensors,
  findById: findById,
  getHistoryBySensorId: getHistoryBySensorId,
  getHistoryBySensorIdAndDate: getHistoryBySensorIdAndDate,
  getSensorWithHistory: getSensorWithHistory,
  addDispositive: addDispositive
};
