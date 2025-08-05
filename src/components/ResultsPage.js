import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResultsPage.css';

const ResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userAnswers, quizQuestions } = location.state || {};

    const calculateScore = () => {
        if (!quizQuestions || !userAnswers) return { score: 0, total: 0 };

        const total = quizQuestions.length;
        const correctAnswers = quizQuestions.reduce((acc, question) => {
            const userAnswerIndex = userAnswers[question.id];
            const isCorrect = userAnswerIndex !== undefined && question.answers[userAnswerIndex].isCorrect;
            return acc + (isCorrect ? 1 : 0);
        }, 0);

        return { score: correctAnswers, total };
    };

    const { score, total } = calculateScore();

    return (
        <div className="results-page">
            <div className="results-summary">
                <h1>ტესტის შედეგები</h1>
                <p className="score">თქვენი შედეგები: <strong>{score} / {total}</strong></p>
                <h2>გადახედვა</h2>
            </div>
            <div className="results-header">
                <button className="back-button" onClick={() => navigate('/')}>
                    ← დაბრუნება სწავლის რეჟიმში
                </button>
            </div>
            <div className="question-review-container">
                {quizQuestions && quizQuestions.map((question, index) => {
                    const userAnswerIndex = userAnswers[question.id];
                    const userAnswerText = userAnswerIndex !== undefined ? question.answers[userAnswerIndex].text : 'პასუხი არ არის მოცემული';
                    const correctAnswer = question.answers.find(ans => ans.isCorrect);
                    const correctAnswerIndex = question.answers.findIndex(ans => ans.isCorrect);
                    const isCorrect = userAnswerIndex === correctAnswerIndex;

                    return (
                        <div key={index} className={`result-question-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                            <h3 className="question-title">{index + 1}. {question.question}</h3>
                            <div className="answer-block">
                                <p><strong>თქვენი პასუხი:</strong> <span className="user-answer">{userAnswerText}</span></p>
                                <p><strong>სწორი პასუხი:</strong> <span className="correct-answer">{correctAnswer.text}</span></p>
                                {isCorrect ? (
                                    <p className="result-indicator correct">✓ სწორი</p>
                                ) : (
                                    <p className="result-indicator incorrect">✗ არასწორი</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResultsPage;