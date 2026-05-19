var express = require('express');
var healthController = require('../controllers/healthController');

var router = express.Router();

router.get('/', healthController.getHealth);

module.exports = router;
