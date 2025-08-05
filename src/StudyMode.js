// src/StudyMode.js (or your main App.js)
import React, { useState, useEffect, useContext, Suspense, lazy, useCallback } from 'react';
import { QuestionContext } from './contexts/QuestionContext';
import { useShortcuts } from './contexts/ShortcutContext';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from './hooks/useLocalStorage';
import './App.css';

// Lazy load components
const QuestionView = lazy(() => import('./components/QuestionView'));
const SettingsPopoverComponent = lazy(() => import('./components/SettingsPopover'));
const ReviewDeck = lazy(() => import('./components/ReviewDeck'));
const TagFilter = lazy(() => import('./components/TagFilter'));
const EasyStudyModeView = lazy(() => import('./components/EasyStudyModeView'));
const ProgressDashboard = lazy(() => import('./components/ProgressDashboard'));

const StudyMode = () => {
    const navigate = useNavigate();
    const { questions, loading, error } = useContext(QuestionContext);
    const { shortcutPrev, shortcutNext, shortcutExplanation } = useShortcuts();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useLocalStorage('currentQuestionIndex', 0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useLocalStorage('selectedTags', []);
    const [incorrectlyAnsweredQuestions, setIncorrectlyAnsweredQuestions] = useLocalStorage('incorrectlyAnsweredQuestions', []);
    const [answeredQuestions, setAnsweredQuestions] = useLocalStorage('answeredQuestions', []);
    const [correctAnswers, setCorrectAnswers] = useLocalStorage('correctAnswers', []);
    const [showExplanation, setShowExplanation] = useState(false); // This state is for modes where explanation is toggled

    const MODES = {
        STUDY: 'study', // Original study mode (answers first, then explanation toggle)
        EASY_STUDY: 'easy_study', // The new mode: always show correct answer and explanation immediately
        REVIEW: 'review',
        PROGRESS: 'progress' // Progress dashboard mode
    };
    const [currentMode, setCurrentMode] = useLocalStorage('currentAppMode', MODES.STUDY);

    const [jumpToValue, setJumpToValue] = useState((currentQuestionIndex + 1).toString());

    const allTags = React.useMemo(() => Array.from(new Set(questions.flatMap(q => q.tags || []))), [questions]);

    const filteredQuestions = React.useMemo(() => {
        if (searchQuery === '' && selectedTags.length === 0) {
            return questions;
        }
        return questions.filter(q => {
            const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTags = selectedTags.length === 0 || q.tags?.some(tag => selectedTags.includes(tag));
            return matchesSearch && matchesTags;
        });
    }, [questions, searchQuery, selectedTags]);

    useEffect(() => {
        if (currentQuestionIndex >= filteredQuestions.length) {
            setCurrentQuestionIndex(Math.max(0, filteredQuestions.length - 1));
        }
    }, [filteredQuestions, currentQuestionIndex, setCurrentQuestionIndex]);

    useEffect(() => {
        setJumpToValue((currentQuestionIndex + 1).toString());
    }, [currentQuestionIndex]);

    const [flashEnabled, setFlashEnabled] = useState(false);

    const handleAnswerResult = useCallback((questionId, isCorrect) => {
        // Track that this question has been answered
        setAnsweredQuestions(prev => (prev.includes(questionId) ? prev : [...prev, questionId]));
        
        // Track correct answers
        if (isCorrect) {
            setCorrectAnswers(prev => (prev.includes(questionId) ? prev : [...prev, questionId]));
        } else {
            setIncorrectlyAnsweredQuestions(prev => (prev.includes(questionId) ? prev : [...prev, questionId]));
        }
        
        // Auto-advance to next question if flash is enabled and answer is correct
        if (flashEnabled && isCorrect) {
            setTimeout(() => {
                if (currentQuestionIndex < filteredQuestions.length - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                }
            }, 1000); // 1 second delay to show the correct answer feedback before moving
        }
    }, [setAnsweredQuestions, setCorrectAnswers, setIncorrectlyAnsweredQuestions, flashEnabled, currentMode, MODES.QUIZ, currentQuestionIndex, filteredQuestions.length, setCurrentQuestionIndex]);

    const handleNext = useCallback(() => {
        if (currentMode === MODES.QUIZ || currentMode === MODES.STUDY) {
            setShowExplanation(false);
        }
        setCurrentQuestionIndex(prev => Math.min(prev + 1, filteredQuestions.length - 1));
    }, [setCurrentQuestionIndex, filteredQuestions.length, currentMode, MODES.QUIZ, MODES.STUDY]);

    const handlePrevious = useCallback(() => {
        if (currentMode === MODES.QUIZ || currentMode === MODES.STUDY) {
            setShowExplanation(false);
        }
        setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
    }, [setCurrentQuestionIndex, currentMode, MODES.QUIZ, MODES.STUDY]); // Corrected dependency for consistency

    const toggleExplanation = useCallback(() => {
        setShowExplanation(prev => !prev);
    }, []);

    const handleJumpToQuestion = () => {
        const questionNumber = parseInt(jumpToValue, 10);

        if (!isNaN(questionNumber) && questionNumber >= 1 && questionNumber <= questions.length) {
            setSelectedTags([]);
            setSearchQuery('');
            setCurrentQuestionIndex(questionNumber - 1);
            if (currentMode === MODES.QUIZ || currentMode === MODES.STUDY) {
                setShowExplanation(false);
            }
        } else {
            setJumpToValue((currentQuestionIndex + 1).toString());
            alert(`Please enter a number between 1 and ${questions.length}.`);
        }
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName.toLowerCase() === 'input') {
                return;
            }
            if (e.key === shortcutNext) handleNext();
            if (e.key === shortcutPrev) handlePrevious();
            if ((currentMode === MODES.QUIZ || currentMode === MODES.STUDY) && (e.key === shortcutExplanation || (shortcutExplanation === 'Space' && e.code === 'Space'))) {
                toggleExplanation();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcutPrev, shortcutNext, shortcutExplanation, handleNext, handlePrevious, toggleExplanation, currentMode, MODES.QUIZ, MODES.STUDY]);

    const reviewQuestions = questions.filter(q => incorrectlyAnsweredQuestions.includes(q.id));

    const clearIncorrectlyAnsweredQuestions = useCallback(() => {
        setIncorrectlyAnsweredQuestions([]);
    }, [setIncorrectlyAnsweredQuestions]);

    if (loading) {
        return <div className="loading-message">📦 იტვირთება...</div>;
    }

    if (error) {
        return <div className="error-message">❗{error.message}</div>;
    }

    const renderQuestionComponent = () => {
        const currentQuestion = filteredQuestions[currentQuestionIndex];
        if (!currentQuestion) {
            return (
                <div className="welcome-message">
                    <h2>❗შესატყვისი კითხვები ვერ მოიძებნა</h2>
                    <p>სცადეთ სხვა საძიებო სიტყვა ან ფილტრი.</p>
                </div>
            );
        }

        switch (currentMode) {
            case MODES.EASY_STUDY:
                return (
                    <EasyStudyModeView
                        question={currentQuestion}
                    />
                );
            case MODES.STUDY:
            default:
                return (
                    <QuestionView
                        question={currentQuestion}
                        onAnswerResult={handleAnswerResult}
                        showExplanation={showExplanation}
                        toggleExplanation={toggleExplanation}
                        alwaysShowCorrectAnswer={false}
                        isForcedAnswered={false} // <--- Pass false for original Study Mode
                    />
                );
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>🧠 რეზიდენტურის ტესტები</h1>
                <Suspense fallback={
                    <div className="settings-popover">
                        <button className="settings-button" disabled aria-label="Settings">⚙️</button>
                    </div>
                }>
                    <SettingsPopoverComponent />
                </Suspense>
            </header>

            <div className="main-layout-container">
                <aside className="sidebar">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="🔎 მოძებნე კითხვა"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Suspense fallback={<div className="loading-message">📦 იტვირთება...</div>}>
                        <TagFilter
                            allTags={allTags}
                            selectedTags={selectedTags}
                            onTagChange={setSelectedTags}
                        />
                    </Suspense>
                </aside>

                <main className="content-area">
                    <div className="mode-toggle">
{/* Flash Enable Toggle */}
                        <button
                            onClick={() => setFlashEnabled(prev => !prev)}
                            className={flashEnabled ? 'active' : ''}
                        >
                            ⚡ Flash {flashEnabled ? 'On' : 'Off'}
                        </button>

                        {/* Quiz Mode Button */}
                        <button
                            onClick={() => navigate('/quiz')}
                        >🎯 ქვიზ რეჟიმი</button>
                        
                        {/* Original Study Mode Button */}
                        <button
                            onClick={() => {
                                setCurrentMode(MODES.STUDY);
                                setCurrentQuestionIndex(0);
                                setIncorrectlyAnsweredQuestions([]);
                            }}
                            className={currentMode === MODES.STUDY ? 'active' : ''}
                        >📚 სწავლის რეჟიმი</button>

                        {/* NEW: Easy Study Mode Button */}
                        <button
                            onClick={() => {
                                setCurrentMode(MODES.EASY_STUDY);
                                setCurrentQuestionIndex(0);
                                setIncorrectlyAnsweredQuestions([]);
                            }}
                            className={currentMode === MODES.EASY_STUDY ? 'active' : ''}
                        >🌟 მარტივი სწავლის რეჟიმი</button>
                        
                        
                        {/* Review Mode Button */}
                        <button
                            onClick={() => {
                                setCurrentMode(MODES.REVIEW);
                            }}
                            disabled={reviewQuestions.length === 0}
                            className={currentMode === MODES.REVIEW ? 'active' : ''}
                        >🔁 გადახედვა ({reviewQuestions.length})</button>
                        
                        {/* Progress Dashboard Button */}
                        <button
                            onClick={() => {
                                setCurrentMode(MODES.PROGRESS);
                            }}
                            className={currentMode === MODES.PROGRESS ? 'active' : ''}
                        >📊 პროგრესი</button>
                    </div>
                    
                    <Suspense fallback={<div className="loading-message">📦 იტვირთება...</div>}>
                        {filteredQuestions.length > 0 ? (
                            currentMode === MODES.REVIEW ? (
                                <ReviewDeck
                                    questions={questions}
                                    incorrectlyAnsweredQuestions={incorrectlyAnsweredQuestions}
                                    onAnswerResult={handleAnswerResult}
                                    onBackToQuiz={() => {
                                        setCurrentMode(MODES.STUDY);
                                    }}
                                    showExplanation={showExplanation}
                                    toggleExplanation={toggleExplanation}
                                    clearIncorrectlyAnsweredQuestions={clearIncorrectlyAnsweredQuestions}
                                />
                            ) : currentMode === MODES.PROGRESS ? (
                                <ProgressDashboard
                                    questions={questions}
                                    incorrectlyAnsweredQuestions={incorrectlyAnsweredQuestions}
                                />
                            ) : (
                                <>
                                    {renderQuestionComponent()}
                                    <div className="navigation-controls">
                                        <div className="question-jumper">
                                            <span>📍 კითხვა</span>
                                            <input
                                                type="number"
                                                className="question-jump-input"
                                                value={jumpToValue}
                                                onChange={(e) => setJumpToValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleJumpToQuestion();
                                                        e.target.blur(); 
                                                    }
                                                }}
                                                onBlur={handleJumpToQuestion}
                                                min="1"
                                                max={questions.length}
                                            />
                                            <span>/ {filteredQuestions.length}</span>
                                        </div>
                                        
                                        <div className="navigation-buttons">
                                            <button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>◀️ წინა</button>
                                            <button onClick={handleNext} disabled={currentQuestionIndex >= filteredQuestions.length - 1}>▶️ შემდეგი</button>
                                        </div>
                                    </div>
                                </>
                            )
                        ) : (
                            <div className="welcome-message">
                                <h2>❗შესატყვისი კითხვები ვერ მოიძებნა</h2>
                                <p>სცადეთ სხვა საძიებო სიტყვა ან ფილტრი.</p>
                            </div>
                        )}
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default StudyMode;