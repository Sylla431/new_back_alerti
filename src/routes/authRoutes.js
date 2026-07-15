var express = require('express');
var authController = require('../controllers/authController');

var router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/mobile/register', authController.mobileRegister);
router.post('/mobile/login', authController.mobileLogin);
router.post('/mobile/password/reset/request', authController.requestPasswordReset);
router.post('/mobile/password/reset/confirm', authController.confirmPasswordReset);
router.get('/mobile/me', authController.getCurrentUser);

module.exports = router;
