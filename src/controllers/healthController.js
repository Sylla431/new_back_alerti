var env = require('../config/env');
var supabase = require('../config/supabase');

function getHealth(req, res) {
  res.json({
    success: true,
    status: 'ok',
    service: 'new-back-alerti',
    environment: env.nodeEnv,
    checks: {
      supabaseConfigured: supabase.isSupabaseConfigured(),
      pythonAiBaseUrl: env.pythonAiBaseUrl,
      firebaseConfigured: Boolean(
        env.firebaseProjectId &&
        env.firebaseClientEmail &&
        env.firebasePrivateKey
      ),
      openWeatherMapConfigured: Boolean(env.openWeatherMapApiKey)
    },
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  getHealth: getHealth
};
