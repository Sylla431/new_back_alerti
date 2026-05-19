var express = require('express');

var router = express.Router();

router.get('/status', function(req, res) {
  res.json({
    success: true,
    strategy: 'progressive',
    currentBackend: 'Express API foundation ready',
    legacyBackends: {
      springBoot: 'Back_end-Alert-I',
      pythonAi: 'alerti'
    },
    nextModules: [
      'weather',
      'alerts',
      'sensors',
      'sos',
      'auth',
      'ai-proxy'
    ]
  });
});

module.exports = router;
