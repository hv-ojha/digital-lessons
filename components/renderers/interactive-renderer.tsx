'use client';

import { useState } from 'react';
import { InteractiveLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';
import { Button } from '@/components/ui/button';
import { PlayfulBadge } from '@/components/ui/playful-badge';
import { Zap, CheckCircle, XCircle, Sparkles, ArrowRight, Trophy } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4">
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

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-8 md:p-12 text-center space-y-8 animate-bounce-in">
            {/* Sparky Mascot */}
            <svg
              viewBox="0 0 200 200"
              className={`w-32 h-32 mx-auto ${isGoodScore ? 'animate-tada' : 'animate-float'}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="interactiveStarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isGoodScore ? "#10B981" : "#F59E0B"} />
                  <stop offset="50%" stopColor={isGoodScore ? "#14B8A6" : "#F97316"} />
                  <stop offset="100%" stopColor={isGoodScore ? "#06B6D4" : "#EF4444"} />
                </linearGradient>
              </defs>
              <path
                d="M100 20 L115 70 L165 75 L125 110 L135 160 L100 135 L65 160 L75 110 L35 75 L85 70 Z"
                fill="url(#interactiveStarGradient)"
                stroke={isGoodScore ? "#059669" : "#DC2626"}
                strokeWidth="3"
              />
              <circle cx="85" cy="85" r="8" fill="white" />
              <circle cx="115" cy="85" r="8" fill="white" />
              <circle cx="87" cy="87" r="4" fill="#1F2937" />
              <circle cx="117" cy="87" r="4" fill="#1F2937" />
              {isGoodScore ? (
                <path d="M 75 100 Q 100 125 125 100" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" fill="none" />
              ) : (
                <path d="M 80 105 Q 100 120 120 105" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
              )}
            </svg>

            <h1 className="font-display text-4xl md:text-5xl font-extrabold gradient-text-success">
              Activity Complete! {isGoodScore ? "🎉" : ""}
            </h1>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 px-8 py-4 rounded-2xl">
                <Trophy className="w-8 h-8 text-green-600" />
                <p className="text-4xl font-bold text-gray-800">{correctCount} / {totalSteps}</p>
              </div>
              <p className="text-2xl font-semibold text-gray-700">{percentage}% Correct</p>
            </div>

            {isGoodScore ? (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6">
                <p className="text-xl font-bold text-green-700">Fantastic! You're an interactive learning pro! ⭐</p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6">
                <p className="text-xl font-bold text-orange-700">Nice try! Keep practicing! 💪</p>
              </div>
            )}

            <Button
              onClick={() => {
                setIsComplete(false);
                setCurrentIndex(0);
                setCorrectCount(0);
                setSelectedOption(null);
                setHasAnswered(false);
              }}
              variant="success"
              size="xl"
              className="w-full max-w-md mx-auto"
            >
              <Zap className="w-5 h-5" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4">
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
          <PlayfulBadge variant="success" size="lg" icon={<Zap className="w-5 h-5" />}>
            Step {currentIndex + 1} of {totalSteps}
          </PlayfulBadge>
        </div>

        {/* Step Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-6 md:p-8 space-y-6 animate-slide-in-up">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 md:p-8 shadow-playful">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white flex-1">
                {currentStep.instruction}
              </h2>
            </div>
          </div>

          {currentStep.image && (
            <div className="flex justify-center animate-fade-in">
              <div className="w-full max-w-md rounded-2xl shadow-playful overflow-hidden">
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
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 transform hover:scale-105 ${
                    showCorrect
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-600 scale-110 shadow-playful-lg'
                      : showIncorrect
                      ? 'bg-gradient-to-br from-red-400 to-red-500 text-white border-red-600 animate-wiggle'
                      : isSelected
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white border-green-600 shadow-lg scale-105'
                      : 'bg-white border-gray-300 text-gray-800 hover:bg-gradient-to-br hover:from-green-100 hover:to-emerald-100 hover:border-green-400 hover:shadow-md'
                  } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="flex-1 font-body text-lg md:text-xl">
                    {option}
                  </span>

                  {/* Check/Cross Icon */}
                  {showCorrect && (
                    <CheckCircle className="w-8 h-8 text-white animate-bounce-in" />
                  )}
                  {showIncorrect && (
                    <XCircle className="w-8 h-8 text-white animate-bounce-in" />
                  )}
                </button>
              );
            })}
          </div>

          {showFeedback && currentStep.feedback && (
            <div className={`p-6 rounded-2xl border-2 flex gap-4 items-start shadow-playful animate-bounce-in ${
              isCorrect
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400'
                : 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                isCorrect ? 'bg-green-200' : 'bg-yellow-200'
              }`}>
                {isCorrect ? (
                  <CheckCircle className="w-7 h-7 text-green-700" />
                ) : (
                  <Sparkles className="w-7 h-7 text-yellow-700" />
                )}
              </div>
              <p className={`text-lg font-semibold ${
                isCorrect ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {isCorrect ? currentStep.feedback.correct : currentStep.feedback.incorrect}
              </p>
            </div>
          )}

          {hasAnswered && (
            <Button
              onClick={handleNext}
              variant="success"
              size="xl"
              className="w-full"
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
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
