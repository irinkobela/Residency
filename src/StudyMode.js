// src/StudyMode.js (or your main App.js)
import React, { useState, useEffect, useContext, Suspense, lazy, useCallback } from 'react';
import { QuestionContext } from './contexts/QuestionContext';
import { useShortcuts } from './contexts/ShortcutContext';
import useLocalStorage from './hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import './App.css';

// Lazy load components
const QuestionView = lazy(() => import('./components/QuestionView'));
const SettingsPopoverComponent = lazy(() => import('./components/SettingsPopover'));
const ReviewDeck = lazy(() => import('./components/ReviewDeck'));
const TagFilter = lazy(() => import('./components/TagFilter'));
const EasyStudyModeView = lazy(() => import('./components/EasyStudyModeView'));

const StudyMode = () => {
    const navigate = useNavigate();
    const { questions, loading, error } = useContext(QuestionContext);
    const { shortcutPrev, shortcutNext, shortcutExplanation } = useShortcuts();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useLocalStorage('currentQuestionIndex', 0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useLocalStorage('selectedTags', []);
    const [incorrectlyAnsweredQuestions, setIncorrectlyAnsweredQuestions] = useLocalStorage('incorrectlyAnsweredQuestions', []);
    const [showExplanation, setShowExplanation] = useState(false); // This state is for modes where explanation is toggled

    const MODES = {
        QUIZ: 'quiz',
        STUDY: 'study', // Original study mode (answers first, then explanation toggle)
        EASY_STUDY: 'easy_study', // The new mode: always show correct answer and explanation immediately
        REVIEW: 'review'
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

    const handleAnswerResult = useCallback((questionId, isCorrect) => {
        if (!isCorrect) {
            setIncorrectlyAnsweredQuestions(prev => (prev.includes(questionId) ? prev : [...prev, questionId]));
        }
        if (currentMode === MODES.QUIZ) {
            setShowExplanation(true);
        }
    }, [setIncorrectlyAnsweredQuestions, currentMode, MODES.QUIZ]);

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
            case MODES.QUIZ:
                return (
                    <QuestionView
                        question={currentQuestion}
                        onAnswerResult={handleAnswerResult}
                        showExplanation={showExplanation}
                        toggleExplanation={toggleExplanation}
                        alwaysShowCorrectAnswer={false}
                        isForcedAnswered={false} // <--- Pass false for Quiz Mode
                    />
                );
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
                        {/* Quiz Mode Button */}
                        <button
                            onClick={() => {
                                setCurrentMode(MODES.QUIZ);
                            }}
                            className={currentMode === MODES.QUIZ ? 'active' : ''}
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