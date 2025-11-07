'use client';

import { useState } from 'react';
import { QuizLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';
import { CheckCircle, XCircle, Sparkles, Trophy, RefreshCw } from 'lucide-react';
import Confetti from 'react-confetti';
import Image from 'next/image';

interface QuizRendererProps {
  lesson: QuizLesson;
}

export function QuizRenderer({ lesson }: QuizRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

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
      // Trigger confetti for good scores
      const finalPercentage = Math.round((score / totalQuestions) * 100);
      if (finalPercentage >= 70) {
        setShowConfetti(true);
      }
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        {/* Confetti for good scores */}
        {isGoodScore && showConfetti && (
          <Confetti
            width={typeof window !== 'undefined' ? window.innerWidth : 300}
            height={typeof window !== 'undefined' ? window.innerHeight : 200}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
        )}

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header with Back Button */}
          <LessonHeader
            title={lesson.title}
            description="Quiz Complete!"
          />

          {/* Results Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg p-8 md:p-12 text-center space-y-8">
            {/* Trophy Icon */}
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
              Quiz Complete! {isGoodScore ? "🎉" : ""}
            </h1>

            {/* Score Display */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl shadow-lg">
                <Trophy className="w-10 h-10" />
                <div className="text-left">
                  <p className="text-5xl font-bold">{score} / {totalQuestions}</p>
                  <p className="text-xl opacity-90">{percentage}% Correct</p>
                </div>
              </div>

              {/* Progress Bar - Simple version */}
              <div className="max-w-md mx-auto">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isGoodScore
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{percentage}% Complete</p>
              </div>
            </div>

            {isGoodScore ? (
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                Amazing job! You're a superstar! ⭐
              </p>
            ) : (
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                Keep practicing! You're getting better! 💪
              </p>
            )}

            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-6 h-6" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          progress={{ current: currentIndex + 1, total: totalQuestions }}
          score={score}
        />

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg p-6 md:p-10 space-y-6">
          {/* Question */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 md:p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white flex-1">
                {currentQuestion.question}
              </h2>
            </div>
          </div>

          {/* Image if available */}
          {currentQuestion.image && (
            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <Image
                  src={currentQuestion.image.src}
                  alt={currentQuestion.image.alt}
                  width={500}
                  height={400}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 md:space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrect = index === currentQuestion.correctIndex;
              const showCorrect = hasAnswered && isCorrect;
              const showIncorrect = hasAnswered && isSelected && !isCorrect;

              const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  disabled={hasAnswered}
                  className={`w-full flex items-center gap-4 p-4 text-left transition-all duration-200 rounded-xl border-2 ${
                    showCorrect
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                      : showIncorrect
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg'
                  } disabled:opacity-50 disabled:cursor-not-allowed group`}
                >
                  {/* Letter Badge */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl transition-all ${
                    showCorrect
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white scale-110'
                      : showIncorrect
                      ? 'bg-gradient-to-br from-red-400 to-red-500 text-white'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white group-hover:scale-110'
                  }`}>
                    {letters[index]}
                  </div>

                  {/* Option Text */}
                  <span className="flex-1 text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {option}
                  </span>

                  {/* Check/Cross Icon */}
                  {showCorrect && (
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 transition-transform duration-200" />
                  )}
                  {showIncorrect && (
                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 transition-transform duration-200" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {hasAnswered && currentQuestion.explanation && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-5">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1">Did you know?</h3>
                  <p className="text-blue-800 dark:text-blue-200">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          {hasAnswered && (
            <button
              onClick={handleNext}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {currentIndex < totalQuestions - 1 ? 'Next Question →' : 'Finish Quiz 🎉'}
            </button>
          )}
        </div>

        {/* Feedback */}
        {hasAnswered && (
          <div className={`p-6 rounded-xl flex gap-4 items-start shadow-lg border-2 ${
            selectedOption === currentQuestion.correctIndex
              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
              : 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
          }`}>
            {selectedOption === currentQuestion.correctIndex ? (
              <>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">Correct! 🎉</p>
                  <p className="text-green-600 dark:text-green-400 text-lg">Amazing work! Keep it up!</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mb-1">Not quite! 💪</p>
                  <p className="text-orange-600 dark:text-orange-400 text-lg">The correct answer is: <strong>{currentQuestion.options[currentQuestion.correctIndex]}</strong></p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
