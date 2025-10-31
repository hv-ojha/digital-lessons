'use client';

import { useState } from 'react';
import { QuizLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';

interface QuizRendererProps {
  lesson: QuizLesson;
}

export function QuizRenderer({ lesson }: QuizRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const currentQuestion = lesson.questions[currentIndex];
  const totalQuestions = lesson.questions.length;

  const handleSelectOption = (index: number) => {
    if (hasAnswered) return;

    setSelectedOption(index);
    setHasAnswered(true);

    if (index === currentQuestion.correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsComplete(false);
    setSelectedOption(null);
    setHasAnswered(false);
  };

  if (isComplete) {
    const percentage = Math.round((score / totalQuestions) * 100);
    const isGoodScore = percentage >= 70;

    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header with Back Button */}
          <LessonHeader
            title={lesson.title}
            description="Quiz Complete!"
          />

          {/* Results Card */}
          <div className="bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-8 text-center space-y-6">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              isGoodScore ? 'bg-success/10' : 'bg-warning/10'
            }`}>
              {isGoodScore ? (
                <svg className="w-12 h-12 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              ) : (
                <svg className="w-12 h-12 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Quiz Complete!</h1>

            <div className="space-y-2">
              <p className="text-3xl font-bold text-accent">{score} / {totalQuestions}</p>
              <p className="text-xl text-muted-foreground">{percentage}% Correct</p>
            </div>

            {isGoodScore ? (
              <p className="text-lg text-success">Great job! You did really well!</p>
            ) : (
              <p className="text-lg text-warning">Keep practicing! You can do better!</p>
            )}

            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md px-6 py-3 transition-all duration-200 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          progress={{ current: currentIndex + 1, total: totalQuestions }}
          score={score}
        />

        {/* Question Card */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
          {/* Question */}
          <div className="bg-gradient-to-br from-accent to-accent/70 rounded-xl p-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-accent-foreground">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Image if available */}
          {currentQuestion.image && (
            <div className="flex justify-center">
              <img
                src={currentQuestion.image.src}
                alt={currentQuestion.image.alt}
                className="w-full max-w-md rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 md:space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrect = index === currentQuestion.correctIndex;
              const showCorrect = hasAnswered && isCorrect;
              const showIncorrect = hasAnswered && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  disabled={hasAnswered}
                  className={`w-full px-6 py-4 rounded-xl text-left text-base md:text-lg transition-all duration-200 ${
                    showCorrect
                      ? 'bg-success/20 border-2 border-success text-success font-semibold'
                      : showIncorrect
                      ? 'bg-destructive/20 border-2 border-destructive text-destructive font-semibold'
                      : isSelected
                      ? 'bg-accent/90 border-2 border-accent text-accent-foreground shadow-lg font-semibold'
                      : 'bg-card border-2 border-border hover:bg-accent/20 hover:border-accent hover:shadow-md'
                  } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {hasAnswered && currentQuestion.explanation && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
              <p className="text-foreground">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {hasAnswered && (
            <button
              onClick={handleNext}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md px-6 py-3 transition-all duration-200 font-semibold"
            >
              {currentIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          )}
        </div>

        {/* Feedback */}
        {hasAnswered && (
          <div className={`p-6 rounded-xl flex gap-3 items-start ${
            selectedOption === currentQuestion.correctIndex
              ? 'bg-success/10 border border-success/20'
              : 'bg-destructive/10 border border-destructive/30'
          }`}>
            {selectedOption === currentQuestion.correctIndex ? (
              <>
                <svg className="w-6 h-6 text-success flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-success text-lg md:text-xl font-semibold">Correct! Well done!</p>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-destructive flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-destructive text-lg md:text-xl font-semibold">Not quite! The correct answer is: {currentQuestion.options[currentQuestion.correctIndex]}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
