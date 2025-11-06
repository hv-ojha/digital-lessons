'use client';

import { useState } from 'react';
import { MathPracticeLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';
import { Button } from '@/components/ui/button';
import { PlayfulBadge } from '@/components/ui/playful-badge';
import { Lightbulb, CheckCircle, XCircle, RefreshCw, Calculator as CalcIcon } from 'lucide-react';
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

  const currentProblem = lesson.problems[currentIndex];
  const totalProblems = lesson.problems.length;

  const handleSelectAnswer = (answer: number | string) => {
    if (hasAnswered) return;

    setSelectedAnswer(answer);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;

    setHasAnswered(true);

    if (selectedAnswer === currentProblem.answer) {
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
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsComplete(false);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setShowHint(false);
  };

  if (isComplete) {
    const percentage = Math.round((score / totalProblems) * 100);
    const isGoodScore = percentage >= 70;
    const [showConfetti, setShowConfetti] = useState(isGoodScore);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
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

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-8 md:p-12 text-center space-y-8 animate-bounce-in">
            {/* Sparky Mascot */}
            <svg
              viewBox="0 0 200 200"
              className={`w-32 h-32 mx-auto ${isGoodScore ? 'animate-tada' : 'animate-float'}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="mathStarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isGoodScore ? "#10B981" : "#F59E0B"} />
                  <stop offset="50%" stopColor={isGoodScore ? "#3B82F6" : "#F97316"} />
                  <stop offset="100%" stopColor={isGoodScore ? "#8B5CF6" : "#EF4444"} />
                </linearGradient>
              </defs>
              <path
                d="M100 20 L115 70 L165 75 L125 110 L135 160 L100 135 L65 160 L75 110 L35 75 L85 70 Z"
                fill="url(#mathStarGradient)"
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

            <h1 className="font-display text-4xl md:text-5xl font-extrabold gradient-text-magic">
              Practice Complete!
            </h1>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 px-8 py-4 rounded-2xl">
                <CalcIcon className="w-8 h-8 text-blue-600" />
                <p className="text-4xl font-bold text-gray-800">{score} / {totalProblems}</p>
              </div>
              <p className="text-2xl font-semibold text-gray-700">{percentage}% Correct</p>
            </div>

            {isGoodScore ? (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6">
                <p className="text-xl font-bold text-green-700">🎉 Excellent work! You're a math star! ⭐</p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6">
                <p className="text-xl font-bold text-orange-700">💪 Good effort! Keep practicing!</p>
              </div>
            )}

            <Button
              onClick={handleRestart}
              variant="playful"
              size="xl"
              className="w-full max-w-md mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Practice Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
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
          <PlayfulBadge variant="magic" size="lg" icon={<CalcIcon className="w-5 h-5" />}>
            Problem {currentIndex + 1} of {totalProblems}
          </PlayfulBadge>
        </div>

        {/* Problem Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-6 md:p-8 space-y-6 animate-slide-in-up">
          {/* Problem */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center font-display">
              {currentProblem.question}
            </h2>
          </div>

          {/* Image if available */}
          {currentProblem.image && (
            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-lg shadow-md overflow-hidden">
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
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-2xl p-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-800 font-semibold">{currentProblem.hint}</p>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowHint(true)}
                  variant="sunshine"
                  size="sm"
                >
                  <Lightbulb className="w-4 h-4" />
                  Need a hint?
                </Button>
              )}
            </div>
          )}

          {/* Answer Options */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {currentProblem.answerOptions.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentProblem.answer;
              const showCorrect = hasAnswered && isCorrect;
              const showIncorrect = hasAnswered && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={hasAnswered}
                  className={`px-6 py-5 rounded-2xl text-2xl font-bold transition-all duration-200 transform ${
                    showCorrect
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white border-2 border-green-600 scale-110 shadow-playful-lg'
                      : showIncorrect
                      ? 'bg-gradient-to-br from-red-400 to-red-500 text-white border-2 border-red-600 animate-wiggle'
                      : isSelected
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-2 border-purple-600 shadow-lg scale-105'
                      : 'bg-white border-2 border-gray-300 text-gray-800 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 hover:border-blue-400 hover:scale-105 hover:shadow-md'
                  } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Check Answer Button */}
          {selectedAnswer !== null && !hasAnswered && (
            <Button
              onClick={handleCheckAnswer}
              variant="magic"
              size="xl"
              className="w-full"
            >
              <CheckCircle className="w-5 h-5" />
              Check Answer
            </Button>
          )}

          {/* Explanation */}
          {hasAnswered && currentProblem.explanation && (
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-2xl p-4">
              <p className="text-blue-900 font-semibold">{currentProblem.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {hasAnswered && (
            <Button
              onClick={handleNext}
              variant="playful"
              size="xl"
              className="w-full"
            >
              {currentIndex < totalProblems - 1 ? 'Next Problem →' : 'Finish Practice 🎉'}
            </Button>
          )}
        </div>

        {/* Feedback */}
        {hasAnswered && (
          <div className={`p-6 rounded-2xl flex gap-3 items-start animate-bounce-in ${
            selectedAnswer === currentProblem.answer
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400'
              : 'bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-400'
          }`}>
            {selectedAnswer === currentProblem.answer ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-green-700 text-xl md:text-2xl font-bold">Perfect! 🎉</p>
                  <p className="text-green-700 font-semibold">{currentProblem.question} = {currentProblem.answer}</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-red-700 text-xl md:text-2xl font-bold">Not quite! 💪</p>
                  <p className="text-red-700 font-semibold">The correct answer is {currentProblem.answer}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
