var { GoogleAuth } = require('google-auth-library');
var env = require('../config/env');
var supabaseConfig = require('../config/supabase');

function getClient() {
  return supabaseConfig.getSupabaseClient();
}

async function getAllFcmTokens() {
  if (!supabaseConfig.isSupabaseConfigured()) return [];
  var response = await getClient()
    .from('fcm_tokens')
    .select('fcm_token')
    .eq('is_active', true);
  if (response.error) throw response.error;
  return (response.data || [])
    .map(function(row) { return row.fcm_token; })
    .filter(Boolean);
}

async function getFcmTokensForUser(userId) {
  if (!supabaseConfig.isSupabaseConfigured()) return [];
  var response = await getClient()
    .from('fcm_tokens')
    .select('fcm_token')
    .eq('is_active', true)
    .eq('user_id', userId);
  if (response.error) throw response.error;
  return (response.data || [])
    .map(function(row) { return row.fcm_token; })
    .filter(Boolean);
}

async function getFcmTokensForLocalite(localite) {
  if (!supabaseConfig.isSupabaseConfigured()) return [];
  var response = await getClient()
    .from('fcm_tokens')
    .select('fcm_token')
    .eq('is_active', true)
    .eq('localite', localite);
  if (response.error) throw response.error;
  return (response.data || [])
    .map(function(row) { return row.fcm_token; })
    .filter(Boolean);
}

async function sendViaGateway(payload) {
  if (!env.fcmGatewayUrl) {
    return sendDirectFcm(payload);
  }

  var headers = { 'Content-Type': 'application/json' };
  if (env.fcmGatewayApiKey) {
    headers['x-api-key'] = env.fcmGatewayApiKey;
  }

  var response = await fetch(env.fcmGatewayUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    var text = await response.text();
    throw new Error('FCM gateway error: ' + response.status + ' ' + text);
  }

  return response.json();
}

async function sendDirectFcm(payload) {
  if (!env.firebaseProjectId || !env.firebaseClientEmail || !env.firebasePrivateKey) {
    throw new Error(
      'Firebase non configuré. Définir FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY ou FCM_GATEWAY_URL.'
    );
  }

  var tokens = payload.tokens || (payload.token ? [payload.token] : []);
  if (!tokens.length) {
    return { success: false, successCount: 0, errorCount: 0, message: 'No tokens' };
  }

  var auth = new GoogleAuth({
    credentials: {
      project_id: env.firebaseProjectId,
      client_email: env.firebaseClientEmail,
      private_key: String(env.firebasePrivateKey).replace(/\\n/g, '\n')
    },
    scopes: ['https://www.googleapis.com/auth/firebase.messaging']
  });

  var client = await auth.getClient();
  var accessToken = await client.getAccessToken();
  var bearerToken = typeof accessToken === 'string' ? accessToken : accessToken && accessToken.token;
  if (!bearerToken) throw new Error('Unable to generate FCM access token');

  var fcmUrl = 'https://fcm.googleapis.com/v1/projects/' + env.firebaseProjectId + '/messages:send';
  var successCount = 0;
  var errorCount = 0;
  var results = [];

  for (var i = 0; i < tokens.length; i += 1) {
    var token = tokens[i];
    try {
      var response = await fetch(fcmUrl, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + bearerToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: {
            token: token,
            notification: {
              title: payload.title || 'Alerti',
              body: payload.body || ''
            },
            data: payload.data || {}
          }
        })
      });
      var data = await response.json();
      results.push({ token: String(token).slice(0, 10) + '...', success: response.ok, data: data });
      if (response.ok) successCount += 1;
      else errorCount += 1;
    } catch (error) {
      results.push({ token: String(token).slice(0, 10) + '...', success: false, error: error.message });
      errorCount += 1;
    }
  }

  return {
    success: successCount > 0,
    totalTokens: tokens.length,
    successCount: successCount,
    errorCount: errorCount,
    results: results,
    message: 'Sent to ' + successCount + '/' + tokens.length + ' tokens successfully'
  };
}

async function sendPush(title, body, data, tokens) {
  if (!tokens || !tokens.length) return false;
  var result = await sendViaGateway({
    tokens: tokens,
    title: title,
    body: body,
    data: data || {}
  });
  return Boolean(result && result.success);
}

async function sendSosNotification(sosSignal, eventType) {
  var tokens = await getAllFcmTokens();
  return sendPush(
    'SOS — ' + (sosSignal.typeUrgence || 'urgence'),
    sosSignal.description || 'Nouveau signalement SOS',
    {
      type: 'sos',
      eventType: String(eventType || 'new_signal'),
      signalId: String(sosSignal.id || ''),
      localite: String(sosSignal.localite || ''),
      priorite: String(sosSignal.priorite || '')
    },
    tokens
  );
}

async function sendSosConfirmationToUser(sosSignal, userId) {
  var tokens = await getFcmTokensForUser(userId);
  return sendPush(
    'Signalement reçu',
    'Votre signalement SOS a bien été enregistré.',
    {
      type: 'sos_confirmation',
      signalId: String(sosSignal.id || ''),
      userId: String(userId)
    },
    tokens
  );
}

async function sendCriticalSosAlert(sosSignal) {
  var tokens = await getAllFcmTokens();
  return sendPush(
    'ALERTE CRITIQUE SOS',
    (sosSignal.localite || '') + ' — ' + (sosSignal.description || 'Urgence critique'),
    {
      type: 'sos_critical',
      signalId: String(sosSignal.id || ''),
      priorite: 'critique'
    },
    tokens
  );
}

async function sendTestPush(title, body, localite) {
  var tokens = localite
    ? await getFcmTokensForLocalite(localite)
    : await getAllFcmTokens();
  return sendPush(title || 'Test Alerti', body || 'Notification de test', { type: 'test' }, tokens);
}

module.exports = {
  getAllFcmTokens: getAllFcmTokens,
  getFcmTokensForUser: getFcmTokensForUser,
  getFcmTokensForLocalite: getFcmTokensForLocalite,
  sendPush: sendPush,
  sendSosNotification: sendSosNotification,
  sendSosConfirmationToUser: sendSosConfirmationToUser,
  sendCriticalSosAlert: sendCriticalSosAlert,
  sendTestPush: sendTestPush,
  sendViaGateway: sendViaGateway
};
