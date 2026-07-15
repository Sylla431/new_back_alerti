var express = require('express');
var notificationController = require('../controllers/notificationController');

var router = express.Router();

router.get('/test-push', notificationController.testPush);
router.get('/test-push/:localite', notificationController.testPushLocalite);
router.get('/stats', notificationController.stats);
router.post('/send', notificationController.sendCustom);

module.exports = router;
