var notificationService = require('../services/notificationService');
var supabaseConfig = require('../config/supabase');

async function testPush(req, res, next) {
  try {
    if (!supabaseConfig.isSupabaseConfigured()) {
      return res.status(503).json({ success: false, message: 'Supabase non configuré' });
    }
    var sent = await notificationService.sendTestPush('Test Alerti', 'Notification de test push');
    return res.json({ success: true, notification_sent: sent });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function testPushLocalite(req, res, next) {
  try {
    var sent = await notificationService.sendTestPush(
      'Test Alerti',
      'Notification de test pour ' + req.params.localite,
      req.params.localite
    );
    return res.json({ success: true, localite: req.params.localite, notification_sent: sent });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function stats(req, res, next) {
  try {
    var tokens = await notificationService.getAllFcmTokens();
    return res.json({
      success: true,
      activeTokens: tokens.length
    });
  } catch (error) {
    return next(error);
  }
}

async function sendCustom(req, res, next) {
  try {
    var body = req.body || {};
    var tokens = body.tokens || (body.token ? [body.token] : await notificationService.getAllFcmTokens());
    var result = await notificationService.sendViaGateway({
      tokens: tokens,
      title: body.title || 'Alerti',
      body: body.body || '',
      data: body.data || {}
    });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  testPush: testPush,
  testPushLocalite: testPushLocalite,
  stats: stats,
  sendCustom: sendCustom
};
