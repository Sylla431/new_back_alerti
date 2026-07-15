var dotenv = require('dotenv');

// Sur Vercel, les variables viennent du dashboard — .env local est optionnel
dotenv.config({ quiet: true });

function getBoolean(value, defaultValue) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return String(value).toLowerCase() === 'true';
}

var nodeEnv = process.env.NODE_ENV || 'development';

module.exports = {
  nodeEnv: nodeEnv,
  isProduction: nodeEnv === 'production' || Boolean(process.env.VERCEL),
  port: process.env.PORT || '3000',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  corsCredentials: getBoolean(process.env.CORS_CREDENTIALS, false),
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '',
  jwtSecret: process.env.JWT_SECRET || '',
  openWeatherMapApiKey: process.env.OPENWEATHERMAP_API_KEY || '',
  // En production, pointer vers l'API Python déployée (pas localhost)
  pythonAiBaseUrl: process.env.PYTHON_AI_BASE_URL || 'http://localhost:5000',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY || '',
  fcmGatewayUrl: process.env.FCM_GATEWAY_URL || process.env.AWS_API_GATEWAY_URL || '',
  fcmGatewayApiKey: process.env.FCM_GATEWAY_API_KEY || process.env.AWS_LAMBDA_API_KEY || ''
};
