#!/usr/bin/env node
/**
 * Smoke tests de bascule — vérifie les routes Node critiques.
 * Usage: node scripts/cutover-smoke.js [baseUrl]
 */
require('dotenv').config();

var baseUrl = (process.argv[2] || 'http://127.0.0.1:3000').replace(/\/$/, '');

var checks = [
  { name: 'root', path: '/' },
  { name: 'health', path: '/api/health' },
  { name: 'migration', path: '/api/migration/status' },
  { name: 'alerts.calculate', path: '/api/alerts/calculate?niveauEau=75&seuilEau=100' },
  { name: 'weather.current', path: '/api/weather/current/bamako' },
  { name: 'sos.types', path: '/api/sos/types-urgence' },
  { name: 'sos.priorites', path: '/api/sos/priorites' },
  { name: 'sos.statuts', path: '/api/sos/statuts' },
  { name: 'quiz.full', path: '/quiz/full-quiz-data' },
  { name: 'sensors.list', path: '/api/sensors' },
  { name: 'sos.signaux', path: '/api/sos/signaux' },
  { name: 'ai.proxy', path: '/api/countries', allowBadGateway: true }
];

async function run() {
  var failed = 0;

  for (var i = 0; i < checks.length; i += 1) {
    var check = checks[i];
    var url = baseUrl + check.path;
    try {
      var response = await fetch(url);
      var ok = response.status < 500 || (check.allowBadGateway && response.status === 502);
      console.log(
        (ok ? 'PASS' : 'FAIL') +
          ' [' + response.status + '] ' +
          check.name +
          ' -> ' +
          check.path +
          (response.status === 502 && check.allowBadGateway ? ' (Python IA offline: proxy OK)' : '')
      );
      if (!ok) failed += 1;
    } catch (error) {
      console.log('FAIL [ERR] ' + check.name + ' -> ' + error.message);
      failed += 1;
    }
  }

  if (failed > 0) {
    console.error('Cutover smoke finished with ' + failed + ' failure(s).');
    process.exit(1);
  }

  console.log('Cutover smoke: all checks passed.');
}

run();
