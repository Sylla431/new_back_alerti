var quizService = require('../services/quizService');
var supabaseConfig = require('../config/supabase');

function ensureSupabase(res) {
  if (!supabaseConfig.isSupabaseConfigured()) {
    res.status(503).json({
      success: false,
      error: 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    });
    return false;
  }

  return true;
}

async function getFullQuizData(req, res, next) {
  try {
    if (!ensureSupabase(res)) {
      return;
    }

    var data = await quizService.getAllQuizWithQuestions();
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getQuestionsByQuizId(req, res, next) {
  try {
    if (!ensureSupabase(res)) {
      return;
    }

    var quizId = req.query.quizId;
    if (quizId == null || quizId === '') {
      return res.status(400).json({
        success: false,
        error: 'Le paramètre quizId est obligatoire'
      });
    }

    var data = await quizService.getQuestionsWithReponsesByQuizId(quizId);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function addQuiz(req, res, next) {
  try {
    if (!ensureSupabase(res)) {
      return;
    }

    if (!req.body || !req.body.description) {
      return res.status(400).json({
        success: false,
        error: 'Le champ description est obligatoire'
      });
    }

    await quizService.addQuiz(req.body);
    return res.send('Quiz ajouté avec succès');
  } catch (error) {
    return next(error);
  }
}

async function addQuestionToQuiz(req, res, next) {
  try {
    if (!ensureSupabase(res)) {
      return;
    }

    var quizId = Number(req.params.quizId);
    if (!Number.isFinite(quizId)) {
      return res.status(400).json({
        success: false,
        error: 'quizId invalide'
      });
    }

    if (!req.body || !req.body.textequestion) {
      return res.status(400).json({
        success: false,
        error: 'Le champ textequestion est obligatoire'
      });
    }

    await quizService.addQuestionToQuiz(quizId, req.body);
    return res.send('Question ajoutée avec succès !');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getFullQuizData: getFullQuizData,
  getQuestionsByQuizId: getQuestionsByQuizId,
  addQuiz: addQuiz,
  addQuestionToQuiz: addQuestionToQuiz
};
