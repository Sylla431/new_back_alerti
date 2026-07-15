var sosService = require('../services/sosService');
var supabaseConfig = require('../config/supabase');

function ensureSupabase(res) {
  if (!supabaseConfig.isSupabaseConfigured()) {
    res.status(503).json({
      success: false,
      message: 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    });
    return false;
  }
  return true;
}

function success(data, message, total) {
  var body = { success: true, data: data };
  if (message) body.message = message;
  if (total != null) body.total = total;
  return body;
}

async function creerSignalement(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var created = await sosService.creerSignalement(req.body || {});
    return res.json(success(created, 'Signalement SOS créé avec succès'));
  } catch (error) {
    if (error.status === 400 || error.message) {
      return res.status(error.status || 400).json({
        success: false,
        message: 'Données invalides: ' + error.message
      });
    }
    return next(error);
  }
}

async function creerSignalementAnonyme(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var body = req.body || {};
    var created = await sosService.creerSignalement({
      userId: 0,
      typeUrgence: body.typeUrgence,
      description: body.description,
      localite: body.localite,
      latitude: body.latitude,
      longitude: body.longitude,
      priorite: body.priorite || 'moyenne',
      photoUrl: body.photoUrl,
      numeroUrgence: body.numeroUrgence,
      anonyme: true
    });
    return res.json(success(created, 'Signalement anonyme créé avec succès'));
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du signalement anonyme: ' + error.message
    });
  }
}

async function obtenirTousSignalements(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var signals = await sosService.obtenirTousSignalements();
    return res.json(success(signals, null, signals.length));
  } catch (error) {
    return next(error);
  }
}

async function obtenirSignalementsUtilisateur(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var signals = await sosService.obtenirSignalementsParUtilisateur(Number(req.params.userId));
    return res.json(success(signals, null, signals.length));
  } catch (error) {
    return next(error);
  }
}

async function obtenirSignalementParId(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var signal = await sosService.obtenirSignalementParId(Number(req.params.id));
    if (!signal) {
      return res.status(404).json({ success: false, message: 'Signalement non trouvé' });
    }
    return res.json(success(signal));
  } catch (error) {
    return next(error);
  }
}

async function mettreAJourStatut(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var statut = req.body && req.body.statut;
    if (!statut || !String(statut).trim()) {
      return res.status(400).json({ success: false, message: 'Le nouveau statut est obligatoire' });
    }
    var ok = await sosService.mettreAJourStatut(Number(req.params.id), statut);
    if (!ok) {
      return res.status(500).json({ success: false, message: 'Impossible de mettre à jour le statut' });
    }
    return res.json({ success: true, message: 'Statut mis à jour avec succès' });
  } catch (error) {
    return next(error);
  }
}

async function obtenirStatistiques(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var stats = await sosService.obtenirStatistiques();
    return res.json(success(stats));
  } catch (error) {
    return next(error);
  }
}

async function obtenirUrgents(req, res, next) {
  try {
    if (!ensureSupabase(res)) return;
    var signals = await sosService.obtenirTousSignalements();
    var urgents = signals.filter(sosService.isUrgent);
    return res.json(success(urgents, null, urgents.length));
  } catch (error) {
    return next(error);
  }
}

function obtenirTypesUrgence(req, res) {
  return res.json(success([
    { code: 'inondation', label: 'Inondation', description: "Risque ou présence d'inondation" },
    { code: 'accident', label: 'Accident', description: 'Accident de la route ou autre' },
    { code: 'incendie', label: 'Incendie', description: "Début ou présence d'incendie" },
    { code: 'agression', label: 'Agression', description: 'Violence ou agression' },
    { code: 'blessure', label: 'Blessure', description: 'Personne blessée nécessitant assistance' },
    { code: 'infrastructure', label: 'Infrastructure', description: "Problème d'infrastructure publique" },
    { code: 'pollution', label: 'Pollution', description: 'Pollution ou déversement dangereux' },
    { code: 'autre', label: 'Autre', description: "Autre type d'urgence" }
  ]));
}

function obtenirPriorites(req, res) {
  return res.json(success([
    { code: 'faible', label: 'Faible', description: 'Urgence mineure', couleur: 'green' },
    { code: 'moyenne', label: 'Moyenne', description: 'Urgence modérée', couleur: 'orange' },
    { code: 'haute', label: 'Haute', description: 'Urgence importante', couleur: 'red' },
    { code: 'critique', label: 'Critique', description: 'Urgence critique', couleur: 'darkred' }
  ]));
}

function obtenirStatuts(req, res) {
  return res.json(success([
    { code: 'en_cours', label: 'En cours', description: 'Signalement en cours de traitement' },
    { code: 'traite', label: 'Traité', description: 'Signalement pris en charge' },
    { code: 'resolu', label: 'Résolu', description: 'Signalement résolu' }
  ]));
}

module.exports = {
  creerSignalement: creerSignalement,
  creerSignalementAnonyme: creerSignalementAnonyme,
  obtenirTousSignalements: obtenirTousSignalements,
  obtenirSignalementsUtilisateur: obtenirSignalementsUtilisateur,
  obtenirSignalementParId: obtenirSignalementParId,
  mettreAJourStatut: mettreAJourStatut,
  obtenirStatistiques: obtenirStatistiques,
  obtenirUrgents: obtenirUrgents,
  obtenirTypesUrgence: obtenirTypesUrgence,
  obtenirPriorites: obtenirPriorites,
  obtenirStatuts: obtenirStatuts
};
