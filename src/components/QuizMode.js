import React, { useState, useEffect, useContext, useRef } from 'react';
import { QuestionContext } from '../contexts/QuestionContext';
import { useNavigate } from 'react-router-dom';
import './QuizMode.css';

const QUIZ_DURATION_SECONDS = 3 * 60 * 60; // 3 hours
const NUM_QUIZ_QUESTIONS = 200;

const QuizMode = () => {
  const { questions } = useContext(QuestionContext);
  const navigate = useNavigate();

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: selectedAnswerIndex }
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [quizFinished, setQuizFinished] = useState(false);

  const timerRef = useRef(null);

  // Select random questions on mount
  useEffect(() => {
    if (questions.length > 0) {
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      setQuizQuestions(shuffled.slice(0, NUM_QUIZ_QUESTIONS));
    }
  }, [questions]);

  // Timer logic
  useEffect(() => {
    if (quizQuestions.length === 0 || quizFinished) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          setQuizFinished(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [quizQuestions, quizFinished]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    clearInterval(timerRef.current);
    setQuizFinished(true);
    // Logic to calculate score and show results will go here
  };

  if (quizQuestions.length === 0) {
    return <div className="quiz-loading">Loading quiz...</div>;
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];

  return (
    <div className="quiz-mode-container">
      <div className="quiz-header">
        <h2>🎯 ქვიზ რეჟიმი</h2>
        <div className="timer">⏳ {formatTime(timeLeft)}</div>
      </div>

      {quizFinished ? (
        <div className="quiz-results">
          <h3>Quiz Finished!</h3>
          {/* Results will be displayed here */}
          <button onClick={() => navigate('/')}>Back to Study Mode</button>
        </div>
      ) : (
        <div className="quiz-content">
          <div className="question-progress">
            კითხვა {currentQuestionIndex + 1} / {quizQuestions.length}
          </div>
          <div className="quiz-question-card">
            <h3 className="quiz-question-text">{currentQuestion.question}</h3>
            <div className="quiz-answers-container">
              {currentQuestion.answers.map((answer, index) => (
                <button
                  key={index}
                  className={`quiz-answer-button ${userAnswers[currentQuestion.id] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                >
                  {answer.text}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-navigation">
            <button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>◀️ წინა</button>
            <button onClick={handleNext} disabled={currentQuestionIndex === quizQuestions.length - 1}>▶️ შემდეგი</button>
            {currentQuestionIndex === quizQuestions.length - 1 && (
              <button onClick={handleSubmitQuiz} className="submit-quiz-button">დასრულება</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizMode;