'use client';

import { useState } from 'react';
import { MathPracticeLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';
import { Lightbulb, CheckCircle, XCircle, RefreshCw, Calculator as CalcIcon, Trophy } from 'lucide-react';
import { SimpleEducationalBackground } from '@/components/ui/educational-background';
import Confetti from 'react-confetti';
import Image from 'next/image';

interface MathRendererProps {
  lesson: MathPracticeLesson;
}

export function MathRenderer({ lesson }: MathRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentProblem = lesson.problems[currentIndex];
  const totalProblems = lesson.problems.length;

  const handleSelectAnswer = (answer: number | string) => {
    if (hasAnswered) return;

    setSelectedAnswer(answer);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;

    setHasAnswered(true);

    // Use loose equality (==) to handle number vs string comparison
    // Example: 42 == "42" is true, which is what we want
    if (selectedAnswer == currentProblem.answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalProblems - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setShowHint(false);
    } else {
      // Calculate if we should show confetti
      // Use loose equality (==) to handle number vs string comparison
      const finalScore = selectedAnswer == currentProblem.answer ? score + 1 : score;
      const percentage = Math.round((finalScore / totalProblems) * 100);
      const isGoodScore = percentage >= 70;

      setIsComplete(true);
      setShowConfetti(isGoodScore);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsComplete(false);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setShowHint(false);
    setShowConfetti(false);
  };

  if (isComplete) {
    const percentage = Math.round((score / totalProblems) * 100);
    const isGoodScore = percentage >= 70;

    return (
      <>
        <SimpleEducationalBackground />
        <div className="min-h-screen relative py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Confetti for good scores */}
          {isGoodScore && showConfetti && (
            <Confetti
              width={typeof window !== 'undefined' ? window.innerWidth : 300}
              height={typeof window !== 'undefined' ? window.innerHeight : 200}
              recycle={false}
              numberOfPieces={500}
              gravity={0.3}
              onConfettiComplete={() => setShowConfetti(false)}
            />
          )}

          {/* Header with Back Button */}
          <LessonHeader
            title={lesson.title}
            description="Practice Complete!"
            score={percentage}
          />

          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg p-8 md:p-12 text-center space-y-8">
            {/* Trophy Icon */}
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              isGoodScore
                ? 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30'
                : 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30'
            }`}>
              <Trophy className={`w-10 h-10 ${isGoodScore ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
              Practice Complete! {isGoodScore ? "🎉" : ""}
            </h1>

            <div className="space-y-4">
              <div className={`inline-flex items-center gap-4 text-white px-8 py-4 rounded-xl shadow-lg ${
                isGoodScore
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500'
              }`}>
                <CalcIcon className="w-10 h-10" />
                <div className="text-left">
                  <p className="text-5xl font-bold">{score} / {totalProblems}</p>
                  <p className="text-xl opacity-90">{percentage}% Correct</p>
                </div>
              </div>

              {/* Simple Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div className={`h-full rounded-full ${
                    isGoodScore
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  }`} style={{ width: `${percentage}%` }} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{percentage}% Complete</p>
              </div>
            </div>

            <p className={`text-2xl font-bold ${
              isGoodScore
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-orange-600 dark:text-orange-400'
            }`}>
              {isGoodScore ? 'Excellent work! You\'re a math star! ⭐' : 'Good effort! Keep practicing! 💪'}
            </p>

            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-6 h-6" />
              Practice Again
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <SimpleEducationalBackground />
      <div className="min-h-screen relative py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          progress={{ current: currentIndex + 1, total: totalProblems }}
          score={score}
        />

        {/* Problem Number Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <CalcIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-blue-800 dark:text-blue-300">
              Problem {currentIndex + 1} of {totalProblems}
            </span>
          </div>
        </div>

        {/* Problem Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg p-6 md:p-8 space-y-6">
          {/* Problem */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-8 shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
              {currentProblem.question}
            </h2>
          </div>

          {/* Image if available */}
          {currentProblem.image && (
            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <Image
                  src={currentProblem.image.src}
                  alt={currentProblem.image.alt}
                  width={500}
                  height={400}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Hint */}
          {currentProblem.hint && !hasAnswered && (
            <div className="text-center">
              {showHint ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-800 dark:text-yellow-300 font-semibold">{currentProblem.hint}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 font-semibold rounded-lg border-2 border-yellow-300 dark:border-yellow-700 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  Need a hint?
                </button>
              )}
            </div>
          )}

          {/* Answer Options */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {currentProblem.answerOptions.map((option, index) => {
              // Use loose equality (==) to handle number vs string comparison
              const isSelected = selectedAnswer == option;
              const isCorrect = option == currentProblem.answer;
              const showCorrect = hasAnswered && isCorrect;
              const showIncorrect = hasAnswered && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={hasAnswered}
                  className={`px-6 py-5 rounded-xl text-2xl font-bold transition-all duration-200 transform border-2 ${
                    showCorrect
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-green-500 dark:border-green-600 scale-105 shadow-lg'
                      : showIncorrect
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-red-500 dark:border-red-600'
                      : isSelected
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 border-purple-500 dark:border-purple-600 shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-600 hover:scale-105 hover:shadow-md'
                  } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Check Answer Button */}
          {selectedAnswer !== null && !hasAnswered && (
            <button
              onClick={handleCheckAnswer}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Check Answer
            </button>
          )}

          {/* Explanation */}
          {hasAnswered && currentProblem.explanation && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-4">
              <p className="text-blue-900 dark:text-blue-300 font-semibold">{currentProblem.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {hasAnswered && (
            <button
              onClick={handleNext}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              {currentIndex < totalProblems - 1 ? 'Next Problem →' : 'Finish Practice 🎉'}
            </button>
          )}
        </div>

        {/* Feedback */}
        {hasAnswered && (
          <div className={`p-6 rounded-xl border-2 flex gap-3 items-start shadow-lg ${
            selectedAnswer == currentProblem.answer
              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
              : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
          }`}>
            {selectedAnswer == currentProblem.answer ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-green-700 dark:text-green-300 text-xl md:text-2xl font-bold">Perfect! 🎉</p>
                  <p className="text-green-700 dark:text-green-300 font-semibold">{currentProblem.question} = {currentProblem.answer}</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-red-700 dark:text-red-300 text-xl md:text-2xl font-bold">Not quite! 💪</p>
                  <p className="text-red-700 dark:text-red-300 font-semibold">The correct answer is {currentProblem.answer}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
}
