var express = require('express');
var quizController = require('../controllers/quizController');

var router = express.Router();

router.get('/full-quiz-data', quizController.getFullQuizData);
router.get('/questions-by-quiz', quizController.getQuestionsByQuizId);

module.exports = router;
