var createClient = require('@supabase/supabase-js').createClient;
var env = require('./env');

var client = null;

function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseKey);
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return client;
}

module.exports = {
  getSupabaseClient: getSupabaseClient,
  isSupabaseConfigured: isSupabaseConfigured
};
