import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionContext } from '../contexts/QuestionContext';
import './QuizMode.css';

const QUIZ_DURATION_SECONDS = 3 * 60 * 60; // 3 hours

const QuizMode = () => {
  const { questions } = useContext(QuestionContext);
  const navigate = useNavigate();

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [quizFinished, setQuizFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const timerRef = useRef(null);
  const georgianAlphabet = ['ა ', 'ბ ', 'გ ', 'დ ', 'ე ', 'ვ ', 'ზ ', 'თ ', 'ი ', 'კ', 'ლ', 'მ', 'ნ', 'ო', 'პ', 'ჟ', 'რ', 'ს'];

  useEffect(() => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setQuizQuestions(shuffled.slice(0, 200));
    setStartTime(new Date());
  }, [questions]);

  useEffect(() => {
    if (quizQuestions.length === 0 || quizFinished) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          handleSubmitQuiz();
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

  const formatDisplayTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
  };

  const getEndTime = (startDate) => {
    if (!startDate) return '';
    const endDate = new Date(startDate.getTime() + QUIZ_DURATION_SECONDS * 1000);
    return formatDisplayTime(endDate);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNavigate = (index) => {
    if (index >= 0 && index < quizQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleSubmitQuiz = () => {
    clearInterval(timerRef.current);
    setQuizFinished(true);
    navigate('/results', { state: { userAnswers, quizQuestions } });
  };

  if (quizQuestions.length === 0) {
    return <div className="loading-screen">იტვირთება...</div>;
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <header className="quiz-page-header">
        <h1>ტესტირების შედეგები</h1>
      </header>

      <div className="quiz-info-bar">
        <div><span className="info-label">დაწყების დრო:</span> {formatDisplayTime(startTime)}</div>
        <div><span className="info-label">დასრულების დრო:</span> {getEndTime(startTime)}</div>
        <div><span className="info-label">დარჩენილი დრო:</span> {formatTime(timeLeft)}</div>
      </div>

      <div className="quiz-main-content">
        <aside className="question-navigator">
          <div className="question-grid">
            {quizQuestions.map((question, idx) => (
              <button
                key={question.id}
                className={`
                  question-grid-btn 
                  ${userAnswers.hasOwnProperty(question.id) ? 'answered' : ''}
                  ${currentQuestionIndex === idx ? 'active' : ''}
                `}
                onClick={() => handleNavigate(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </aside>

        <main className="question-panel">
          <div className="question-content">
            <h3><strong>{currentQuestionIndex + 1}.</strong> {currentQuestion.question}</h3>
            <div className="answer-options">
 {currentQuestion.answers.map((answer, index) => (
                <div key={index} className="answer-option">
                  <input
                    type="radio"
                    id={`q${currentQuestion.id}-ans${index}`}
                    name={`question-${currentQuestion.id}`}
                    checked={userAnswers[currentQuestion.id] === index}
                    onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                    className="radio-input"
                  />
                  <label htmlFor={`q${currentQuestion.id}-ans${index}`} className="radio-label">
                    <span className="answer-prefix">{georgianAlphabet[index]}:</span>
                    {answer.text}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <footer className="question-footer">
            <div className="navigation-buttons">
              <button onClick={() => handleNavigate(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0}>
                წინა
              </button>
              {currentQuestionIndex < quizQuestions.length - 1 ? (
                <button onClick={() => handleNavigate(currentQuestionIndex + 1)}>
                  შემდეგი
                </button>
              ) : (
                <button onClick={handleSubmitQuiz} className="submit-btn">
                  ტესტის დასრულება
                </button>
              )}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default QuizMode;
