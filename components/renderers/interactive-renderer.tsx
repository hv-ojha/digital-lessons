'use client';

import { useState } from 'react';
import { InteractiveLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';
import { Zap, CheckCircle, XCircle, Sparkles, ArrowRight, Trophy } from 'lucide-react';
import { SimpleEducationalBackground } from '@/components/ui/educational-background';
import Confetti from 'react-confetti';
import Image from 'next/image';

interface InteractiveRendererProps {
  lesson: InteractiveLesson;
}

export function InteractiveRenderer({ lesson }: InteractiveRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentStep = lesson.steps[currentIndex];
  const totalSteps = lesson.steps.length;

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
    setHasAnswered(true);

    // Track if the answer is correct
    if (currentStep.correctIndex !== undefined && index === currentStep.correctIndex) {
      setCorrectCount(correctCount + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      // Activity is complete
      setIsComplete(true);
      const percentage = Math.round((correctCount / totalSteps) * 100);
      if (percentage >= 70) {
        setShowConfetti(true);
      }
    }
  };

  const isCorrect = currentStep.correctIndex !== undefined && selectedOption === currentStep.correctIndex;
  const showFeedback = hasAnswered && currentStep.feedback;

  // Completion screen
  if (isComplete) {
    const percentage = Math.round((correctCount / totalSteps) * 100);
    const isGoodScore = percentage >= 70;

    return (
      <>
        <SimpleEducationalBackground />
        <div className="min-h-screen relative py-12 px-4">
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

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header with Back Button */}
          <LessonHeader
            title={lesson.title}
            description="Activity Complete!"
            score={percentage}
          />

          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg p-8 md:p-12 text-center space-y-8">
            {/* Trophy Icon */}
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              isGoodScore
                ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30'
                : 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30'
            }`}>
              <Trophy className={`w-10 h-10 ${isGoodScore ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
              Activity Complete! {isGoodScore ? "🎉" : ""}
            </h1>

            <div className="space-y-4">
              <div className={`inline-flex items-center gap-4 text-white px-8 py-4 rounded-xl shadow-lg ${
                isGoodScore
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500'
              }`}>
                <Trophy className="w-10 h-10" />
                <div className="text-left">
                  <p className="text-5xl font-bold">{correctCount} / {totalSteps}</p>
                  <p className="text-xl opacity-90">{percentage}% Correct</p>
                </div>
              </div>

              {/* Simple Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div className={`h-full rounded-full ${
                    isGoodScore
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  }`} style={{ width: `${percentage}%` }} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{percentage}% Complete</p>
              </div>
            </div>

            <p className={`text-2xl font-bold ${
              isGoodScore
                ? 'text-green-600 dark:text-green-400'
                : 'text-orange-600 dark:text-orange-400'
            }`}>
              {isGoodScore ? 'Fantastic! You\'re an interactive learning pro! ⭐' : 'Nice try! Keep practicing! 💪'}
            </p>

            <button
              onClick={() => {
                setIsComplete(false);
                setCurrentIndex(0);
                setCorrectCount(0);
                setSelectedOption(null);
                setHasAnswered(false);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
            >
              <Zap className="w-6 h-6" />
              Try Again
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
          progress={{ current: currentIndex + 1, total: totalSteps }}
          score={correctCount}
        />

        {/* Step Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-800 dark:text-green-300">
              Step {currentIndex + 1} of {totalSteps}
            </span>
          </div>
        </div>

        {/* Step Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg p-6 md:p-8 space-y-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 md:p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white flex-1">
                {currentStep.instruction}
              </h2>
            </div>
          </div>

          {currentStep.image && (
            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <Image
                  src={currentStep.image.src}
                  alt={currentStep.image.alt}
                  width={500}
                  height={400}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          <div className="space-y-3 md:space-y-4">
            {currentStep.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isStepCorrect = currentStep.correctIndex !== undefined && index === currentStep.correctIndex;
              const showCorrect = hasAnswered && isStepCorrect;
              const showIncorrect = hasAnswered && isSelected && !isStepCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  disabled={hasAnswered}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 transform hover:scale-105 ${
                    showCorrect
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-green-500 dark:border-green-600 scale-105 shadow-lg'
                      : showIncorrect
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-red-500 dark:border-red-600'
                      : isSelected
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-green-500 dark:border-green-600 shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-400 dark:hover:border-green-600 hover:shadow-md'
                  } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="flex-1 font-semibold text-lg md:text-xl">
                    {option}
                  </span>

                  {/* Check/Cross Icon */}
                  {showCorrect && (
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  )}
                  {showIncorrect && (
                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  )}
                </button>
              );
            })}
          </div>

          {showFeedback && currentStep.feedback && (
            <div className={`p-6 rounded-xl border-2 flex gap-4 items-start shadow-lg ${
              isCorrect
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                {isCorrect ? (
                  <CheckCircle className="w-7 h-7 text-green-700 dark:text-green-400" />
                ) : (
                  <Sparkles className="w-7 h-7 text-yellow-700 dark:text-yellow-400" />
                )}
              </div>
              <p className={`text-lg font-semibold ${
                isCorrect ? 'text-green-800 dark:text-green-300' : 'text-yellow-800 dark:text-yellow-300'
              }`}>
                {isCorrect ? currentStep.feedback.correct : currentStep.feedback.incorrect}
              </p>
            </div>
          )}

          {hasAnswered && (
            <button
              onClick={handleNext}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              {currentIndex < totalSteps - 1 ? (
                <>
                  Continue <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  See Results 🎉
                </>
              )}
            </button>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
