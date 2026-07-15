var express = require('express');
var quizController = require('../controllers/quizController');

var router = express.Router();

router.post('/add-quiz', quizController.addQuiz);
router.post('/:quizId/add-question', quizController.addQuestionToQuiz);

module.exports = router;
