var conseilService = require('../services/conseilService');
var supabaseConfig = require('../config/supabase');

async function getConseilsParType(req, res, next) {
  try {
    if (!supabaseConfig.isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
      });
    }

    var conseils = await conseilService.getConseilsParType(req.params.type);
    return res.json(conseils);
  } catch (error) {
    return next(error);
  }
}

async function ajouterConseil(req, res, next) {
  try {
    if (!supabaseConfig.isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
      });
    }

    var type = req.body && req.body.type;
    var description = req.body && req.body.description;

    if (!type || !description) {
      return res.status(400).json({
        success: false,
        error: 'Les champs type et description sont obligatoires'
      });
    }

    await conseilService.ajouterConseil({
      type: type,
      description: description
    });

    return res.send('Conseil ajouté avec succès.');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getConseilsParType: getConseilsParType,
  ajouterConseil: ajouterConseil
};
