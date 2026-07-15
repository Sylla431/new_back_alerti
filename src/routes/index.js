var express = require('express');
var alertRoutes = require('./alertRoutes');
var conseilRoutes = require('./conseilRoutes');
var healthRoutes = require('./healthRoutes');
var migrationRoutes = require('./migrationRoutes');
var quizRoutes = require('./quizRoutes');
var weatherRoutes = require('./weatherRoutes');
var sensorRoutes = require('./sensorRoutes');
var sosRoutes = require('./sosRoutes');
var notificationRoutes = require('./notificationRoutes');
var aiProxyRoutes = require('./aiProxyRoutes');
var aiProxyController = require('../controllers/aiProxyController');

var router = express.Router();

router.use('/health', healthRoutes);
router.use('/migration', migrationRoutes);
router.use('/alerts', alertRoutes);
router.get('/alerts', aiProxyController.forwardToPython);
router.use('/conseils', conseilRoutes);
router.use('/quiz', quizRoutes);
router.use('/weather', weatherRoutes);
router.use('/sensors', sensorRoutes);
router.use('/sos', sosRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', aiProxyRoutes);

module.exports = router;
