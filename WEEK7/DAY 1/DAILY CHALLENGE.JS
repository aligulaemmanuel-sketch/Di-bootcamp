 const express = require('express');
const session = require('express-session');

const app = express();
const PORT = 3000;

// 1. DATA MODEL
const triviaQuestions = [
  { question: "What is the capital of France?", answer: "Paris" },
  { question: "Which planet is known as the Red Planet?", answer: "Mars" },
  { question: "What is the largest mammal in the world?", answer: "Blue whale" },
];

// 2. MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'trivia-secret-key',
  resave: false,
  saveUninitialized: true
}));

// 3. THE ROUTER (Defining logic directly in the same file)
const quizRouter = express.Router();

// GET /quiz - Start or continue the quiz
quizRouter.get('/', (req, res) => {
  if (req.session.currentQuestionIndex === undefined) {
    req.session.currentQuestionIndex = 0;
    req.session.score = 0;
  }

  const currentIndex = req.session.currentQuestionIndex;

  if (currentIndex >= triviaQuestions.length) {
    return res.redirect('/quiz/score');
  }

  const currentQuestion = triviaQuestions[currentIndex].question;
  res.send(`
    <h1>Question ${currentIndex + 1}</h1>
    <p>${currentQuestion}</p>
    <form action="/quiz" method="POST">
      <input type="text" name="answer" placeholder="Your answer" required autofocus>
      <button type="submit">Submit</button>
    </form>
  `);
});

// POST /quiz - Submit answer
quizRouter.post('/', (req, res) => {
  const currentIndex = req.session.currentQuestionIndex;
  const userAnswer = req.body.answer;
  const correctAnswer = triviaQuestions[currentIndex].answer;

  let feedback = "";
  if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
    req.session.score++;
    feedback = "<h2 style='color:green'>Correct!</h2>";
  } else {
    feedback = `<h2 style='color:red'>Wrong!</h2><p>The correct answer was <b>${correctAnswer}</b>.</p>`;
  }

  req.session.currentQuestionIndex++;

  res.send(`
    ${feedback}
    <a href="/quiz">${req.session.currentQuestionIndex < triviaQuestions.length ? 'Next Question' : 'See Final Score'}</a>
  `);
});

// GET /quiz/score - Display final score
quizRouter.get('/score', (req, res) => {
  const score = req.session.score || 0;
  const total = triviaQuestions.length;
  
  req.session.currentQuestionIndex = undefined;
  req.session.score = undefined;

  res.send(`
    <h1>Quiz Complete!</h1>
    <p>Your final score is: <strong>${score} / ${total}</strong></p>
    <a href="/quiz">Restart Quiz</a>
  `);
});

// 4. MOUNT THE ROUTER
app.use('/quiz', quizRouter);

// Home redirect
app.get('/', (req, res) => {
  res.send('<h1>Trivia Game</h1><a href="/quiz">Start Quiz</a>');
});

app.listen(PORT, () => {
  console.log(`Server started! View it at http://localhost:${PORT}`);
});