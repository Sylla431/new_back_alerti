var userService = require('../services/userService');
var jwtService = require('../services/jwtService');
var supabaseConfig = require('../config/supabase');

function ensureSupabase(res) {
  if (!supabaseConfig.isSupabaseConfigured()) {
    res.status(503).json({
      message: 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    });
    return false;
  }
  return true;
}

async function register(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var user = req.body || {};
    if (user.email && (await userService.findByEmail(user.email))) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    var created = await userService.saveUser(user);
    if (!created) {
      return res.status(400).json({ message: "Échec de la création de l'utilisateur" });
    }
    return res.json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function login(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var email = req.body && req.body.email;
    var password = req.body && req.body.password;
    if (!(await userService.authenticate(email, password))) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    var token = jwtService.generateToken(email);
    return res.json({ token: token });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function mobileRegister(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var user = req.body || {};
    if (await userService.findByNumTel(user.num_tel)) {
      return res.status(400).json({ message: 'Cet numero existe déjà' });
    }
    var created = await userService.saveUser(user);
    if (!created) {
      return res.status(400).json({ message: "Échec de la création de l'utilisateur" });
    }
    return res.json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function mobileLogin(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var numTel = req.body && req.body.num_tel;
    var password = req.body && req.body.password;
    if (!(await userService.mobileAuthenticate(numTel, password))) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    var user = await userService.findByNumTel(numTel);
    var token = jwtService.generateToken(user.num_tel);
    return res.json({ token: token });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function requestPasswordReset(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var numTel = req.body && req.body.num_tel;
    var normalized = userService.normalizePhone(numTel);
    if (!normalized) {
      return res.status(400).json({ message: 'Numéro de téléphone invalide' });
    }
    if (!(await userService.findByNumTel(normalized))) {
      return res.status(400).json({ message: 'Aucun compte associé à ce numéro' });
    }
    return res.json({ message: 'Numéro vérifié' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function confirmPasswordReset(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var numTel = req.body && req.body.num_tel;
    var newPassword = req.body && req.body.new_password;
    var normalized = userService.normalizePhone(numTel);
    if (!normalized || !newPassword || !String(newPassword).trim()) {
      return res.status(400).json({ message: 'Données de réinitialisation invalides' });
    }
    if (!(await userService.findByNumTel(normalized))) {
      return res.status(400).json({ message: 'Aucun compte associé à ce numéro' });
    }
    var updated = await userService.updatePasswordByNumTel(normalized, String(newPassword).trim());
    if (!updated) {
      return res.status(400).json({ message: 'Impossible de mettre à jour le mot de passe' });
    }
    return res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function getCurrentUser(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).send();
    }
    var token = authHeader.slice(7);
    var numTel = jwtService.extractSubjectLoose(token);
    var user = await userService.findByNumTel(numTel);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    return res.json(userService.sanitizeUser(user));
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
}

module.exports = {
  register: register,
  login: login,
  mobileRegister: mobileRegister,
  mobileLogin: mobileLogin,
  requestPasswordReset: requestPasswordReset,
  confirmPasswordReset: confirmPasswordReset,
  getCurrentUser: getCurrentUser
};
