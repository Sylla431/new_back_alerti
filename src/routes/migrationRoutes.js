var express = require('express');

var router = express.Router();

router.get('/status', function(req, res) {
  res.json({
    success: true,
    strategy: 'progressive',
    currentBackend: 'Express API — modules applicatifs migrés',
    migratedModules: [
      'alerts/calculate',
      'weather (localite)',
      'conseils',
      'quiz',
      'sensors',
      'sos',
      'notifications',
      'auth (email + mobile JWT)',
      'ai-proxy (Flask)'
    ],
    legacyBackends: {
      springBoot: 'Back_end-Alert-I (à débrancher progressivement)',
      pythonAi: 'alerti (exposé via proxy Node)'
    },
    nextModules: [
      'cutover Flutter base URL',
      'désactiver endpoints Spring dupliqués'
    ]
  });
});

module.exports = router;
