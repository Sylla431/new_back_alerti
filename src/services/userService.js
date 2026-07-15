var supabaseService = require('./supabaseService');

function getClient() {
  return supabaseService.getClient();
}

function normalizePhone(phone) {
  if (phone == null) return '';
  return String(phone).replace(/\D/g, '');
}

function passwordEquals(storedPassword, providedPassword) {
  if (storedPassword == null || providedPassword == null) return false;
  return String(storedPassword).trim() === String(providedPassword).trim();
}

function sanitizeUser(user) {
  if (!user) return null;
  var copy = Object.assign({}, user);
  delete copy.password;
  return copy;
}

async function findByEmail(email) {
  var response = await getClient().from('users').select('*').eq('email', email).maybeSingle();
  if (response.error) throw response.error;
  return response.data || null;
}

async function findByNumTel(numTel) {
  var normalized = normalizePhone(numTel);
  var response = await getClient().from('users').select('*').eq('num_tel', normalized).maybeSingle();
  if (response.error) throw response.error;
  return response.data || null;
}

async function saveUser(user) {
  var payload = {
    email: user.email || null,
    password: user.password,
    nom: user.nom || null,
    prenom: user.prenom || null,
    role: user.role || null,
    localite: user.localite || null,
    num_tel: normalizePhone(user.num_tel)
  };

  var response = await getClient().from('users').insert(payload).select();
  if (response.error) throw response.error;
  return Boolean(response.data && response.data.length > 0);
}

async function authenticate(email, password) {
  var user = await findByEmail(email);
  return Boolean(user && passwordEquals(user.password, password));
}

async function mobileAuthenticate(numTel, password) {
  var user = await findByNumTel(numTel);
  return Boolean(user && passwordEquals(user.password, password));
}

async function updatePasswordByNumTel(numTel, newPassword) {
  var normalized = normalizePhone(numTel);
  var response = await getClient()
    .from('users')
    .update({ password: newPassword })
    .eq('num_tel', normalized)
    .select();
  if (response.error) throw response.error;
  return Boolean(response.data && response.data.length > 0);
}

module.exports = {
  normalizePhone: normalizePhone,
  sanitizeUser: sanitizeUser,
  findByEmail: findByEmail,
  findByNumTel: findByNumTel,
  saveUser: saveUser,
  authenticate: authenticate,
  mobileAuthenticate: mobileAuthenticate,
  updatePasswordByNumTel: updatePasswordByNumTel
};
