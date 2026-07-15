var express = require('express');
var sosController = require('../controllers/sosController');

var router = express.Router();

router.post('/signal', sosController.creerSignalement);
router.post('/signal-anonyme', sosController.creerSignalementAnonyme);
router.get('/signaux', sosController.obtenirTousSignalements);
router.get('/signaux/user/:userId', sosController.obtenirSignalementsUtilisateur);
router.get('/signal/:id', sosController.obtenirSignalementParId);
router.patch('/signal/:id/statut', sosController.mettreAJourStatut);
router.get('/statistiques', sosController.obtenirStatistiques);
router.get('/urgents', sosController.obtenirUrgents);
router.get('/types-urgence', sosController.obtenirTypesUrgence);
router.get('/priorites', sosController.obtenirPriorites);
router.get('/statuts', sosController.obtenirStatuts);

module.exports = router;
