var express = require('express');
var conseilController = require('../controllers/conseilController');

var router = express.Router();

router.post('/add_conseil', conseilController.ajouterConseil);
router.get('/type/:type', conseilController.getConseilsParType);

module.exports = router;
