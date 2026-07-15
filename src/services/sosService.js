var supabaseService = require('./supabaseService');
var notificationService = require('./notificationService');

function getClient() {
  return supabaseService.getClient();
}

function toIso(value) {
  return (value instanceof Date ? value : new Date(value || Date.now())).toISOString();
}

function fromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    typeUrgence: row.type_urgence,
    description: row.description,
    localite: row.localite,
    latitude: row.latitude,
    longitude: row.longitude,
    statut: row.statut,
    priorite: row.priorite,
    photoUrl: row.photo_url,
    numeroUrgence: row.numero_urgence,
    anonyme: Boolean(row.anonyme),
    signalTimestamp: row.signal_timestamp,
    updatedAt: row.updated_at
  };
}

function validateSignalement(signal) {
  if (!signal.typeUrgence || !String(signal.typeUrgence).trim()) {
    throw Object.assign(new Error("Le type d'urgence est obligatoire"), { status: 400 });
  }
  if (!signal.description || !String(signal.description).trim()) {
    throw Object.assign(new Error('La description est obligatoire'), { status: 400 });
  }
  if (!signal.localite || !String(signal.localite).trim()) {
    throw Object.assign(new Error('La localité est obligatoire'), { status: 400 });
  }
  if (signal.latitude == null || signal.longitude == null) {
    throw Object.assign(new Error('Les coordonnées GPS sont obligatoires'), { status: 400 });
  }
}

async function creerSignalement(input) {
  validateSignalement(input);

  var now = new Date();
  var signal = {
    userId: input.userId != null ? Number(input.userId) : 0,
    typeUrgence: input.typeUrgence,
    description: input.description,
    localite: input.localite,
    latitude: Number(input.latitude),
    longitude: Number(input.longitude),
    statut: input.statut || 'en_cours',
    priorite: input.priorite || 'moyenne',
    photoUrl: input.photoUrl || null,
    numeroUrgence: input.numeroUrgence || null,
    anonyme: Boolean(input.anonyme),
    signalTimestamp: input.signalTimestamp || now,
    updatedAt: now
  };

  var payload = {
    user_id: signal.userId,
    type_urgence: signal.typeUrgence,
    description: signal.description,
    localite: signal.localite,
    latitude: signal.latitude,
    longitude: signal.longitude,
    statut: signal.statut,
    priorite: signal.priorite,
    signal_timestamp: toIso(signal.signalTimestamp),
    updated_at: toIso(signal.updatedAt),
    photo_url: signal.photoUrl,
    numero_urgence: signal.numeroUrgence,
    anonyme: signal.anonyme
  };

  var response = await getClient().from('sos_signals').insert(payload).select();
  if (response.error) throw response.error;

  var created = fromRow(response.data && response.data[0]);
  if (!created) {
    throw new Error('Impossible de créer le signalement SOS');
  }

  try {
    await notificationService.sendSosNotification(created, 'new_signal');
    if (!created.anonyme && created.userId > 0) {
      await notificationService.sendSosConfirmationToUser(created, created.userId);
    }
    if (created.priorite === 'critique') {
      await notificationService.sendCriticalSosAlert(created);
    }
  } catch (error) {
    console.error('Erreur notifications SOS:', error.message);
  }

  return created;
}

async function obtenirTousSignalements() {
  var response = await getClient()
    .from('sos_signals')
    .select('*')
    .order('signal_timestamp', { ascending: false });
  if (response.error) throw response.error;
  return (response.data || []).map(fromRow);
}

async function obtenirSignalementsParUtilisateur(userId) {
  var response = await getClient()
    .from('sos_signals')
    .select('*')
    .eq('user_id', userId)
    .order('signal_timestamp', { ascending: false });
  if (response.error) throw response.error;
  return (response.data || []).map(fromRow);
}

async function obtenirSignalementParId(id) {
  var response = await getClient().from('sos_signals').select('*').eq('id', id).maybeSingle();
  if (response.error) throw response.error;
  return fromRow(response.data);
}

async function mettreAJourStatut(signalId, nouveauStatut) {
  var response = await getClient()
    .from('sos_signals')
    .update({ statut: nouveauStatut, updated_at: toIso(new Date()) })
    .eq('id', signalId)
    .select();
  if (response.error) throw response.error;
  return Boolean(response.data && response.data.length > 0);
}

async function obtenirStatistiques() {
  var signals = await obtenirTousSignalements();
  var parStatut = { en_cours: 0, traite: 0, resolu: 0 };
  var parPriorite = { faible: 0, moyenne: 0, haute: 0, critique: 0 };
  var parType = {};

  signals.forEach(function(signal) {
    if (parStatut[signal.statut] != null) parStatut[signal.statut] += 1;
    if (parPriorite[signal.priorite] != null) parPriorite[signal.priorite] += 1;
    var type = signal.typeUrgence || 'autre';
    parType[type] = (parType[type] || 0) + 1;
  });

  return {
    total: signals.length,
    par_statut: parStatut,
    par_priorite: parPriorite,
    par_type: parType
  };
}

function isUrgent(signal) {
  return signal.priorite === 'haute' || signal.priorite === 'critique';
}

module.exports = {
  creerSignalement: creerSignalement,
  obtenirTousSignalements: obtenirTousSignalements,
  obtenirSignalementsParUtilisateur: obtenirSignalementsParUtilisateur,
  obtenirSignalementParId: obtenirSignalementParId,
  mettreAJourStatut: mettreAJourStatut,
  obtenirStatistiques: obtenirStatistiques,
  isUrgent: isUrgent
};
