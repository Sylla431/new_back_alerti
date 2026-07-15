var supabaseService = require('./supabaseService');

function getClient() {
  return supabaseService.getClient();
}

async function getAllQuizWithQuestions() {
  // Liste mobile: id + description suffisent.
  // Les questions sont chargées ensuite via /quiz/questions-by-quiz.
  // Évite une jointure lourde qui timeout parfois via ngrok.
  var response = await getClient()
    .from('quiz')
    .select('id,description,updated_at')
    .order('id', { ascending: true });

  if (response.error) {
    throw response.error;
  }

  return (response.data || []).map(function(quiz) {
    return Object.assign({}, quiz, { questions: [] });
  });
}

async function getQuestionsWithReponsesByQuizId(quizId) {
  var response = await getClient()
    .from('questions')
    .select('*,reponses(*)')
    .eq('quiz_id', quizId);

  if (response.error) {
    throw response.error;
  }

  return response.data || [];
}

async function addQuiz(quiz) {
  var quizResponse = await getClient()
    .from('quiz')
    .insert({ description: quiz.description })
    .select();

  if (quizResponse.error) {
    throw quizResponse.error;
  }

  if (!quizResponse.data || quizResponse.data.length === 0) {
    throw new Error('Impossible de créer le quiz');
  }

  var quizId = quizResponse.data[0].id;
  var questions = quiz.questions || [];

  for (var i = 0; i < questions.length; i += 1) {
    await addQuestionToQuiz(quizId, questions[i]);
  }

  return quizId;
}

async function addQuestionToQuiz(quizId, question) {
  var questionResponse = await getClient()
    .from('questions')
    .insert({
      textequestion: question.textequestion,
      quiz_id: quizId
    })
    .select();

  if (questionResponse.error) {
    throw questionResponse.error;
  }

  if (!questionResponse.data || questionResponse.data.length === 0) {
    throw new Error('Impossible de créer la question');
  }

  var questionId = questionResponse.data[0].id;
  var reponses = question.reponses || [];

  for (var i = 0; i < reponses.length; i += 1) {
    var reponse = reponses[i];
    var reponseResponse = await getClient()
      .from('reponses')
      .insert({
        reponse1: reponse.reponse1,
        reponse2: reponse.reponse2,
        reponse3: reponse.reponse3,
        estCorrect: reponse.estCorrect,
        question_id: questionId
      })
      .select();

    if (reponseResponse.error) {
      throw reponseResponse.error;
    }
  }

  return questionId;
}

module.exports = {
  getAllQuizWithQuestions: getAllQuizWithQuestions,
  getQuestionsWithReponsesByQuizId: getQuestionsWithReponsesByQuizId,
  addQuiz: addQuiz,
  addQuestionToQuiz: addQuestionToQuiz
};
