'use client';

import { useState } from 'react';
import { QuizLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';
import { SparklyMascot } from '@/components/ui/sparky-mascot';
import { PlayfulProgress } from '@/components/ui/playful-progress';
import { Button } from '@/components/ui/button';
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
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
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-8 md:p-12 text-center space-y-8 animate-bounce-in">
            {/* Sparky Mascot */}
            <SparklyMascot
              mood={isGoodScore ? "celebrating" : "encouraging"}
              size="xl"
              animate
            />

            <h1 className="font-display text-4xl md:text-5xl font-extrabold gradient-text-rainbow">
              Quiz Complete! {isGoodScore ? "🎉" : ""}
            </h1>

            {/* Score Display */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl shadow-playful">
                <Trophy className="w-10 h-10" />
                <div className="text-left">
                  <p className="text-5xl font-bold">{score} / {totalQuestions}</p>
                  <p className="text-xl opacity-90">{percentage}% Correct</p>
                </div>
              </div>

              {/* Progress Bar */}
              <PlayfulProgress
                value={percentage}
                max={100}
                showPercentage={false}
                showStars
                gradient={isGoodScore ? "green" : "purple"}
                animate
              />
            </div>

            {isGoodScore ? (
              <p className="font-display text-2xl font-bold text-green-600">
                Amazing job! You're a superstar! ⭐
              </p>
            ) : (
              <p className="font-display text-2xl font-bold text-orange-600">
                Keep practicing! You're getting better! 💪
              </p>
            )}

            <Button
              onClick={handleRestart}
              variant="playful"
              size="xl"
              className="min-w-[200px]"
            >
              <RefreshCw className="w-6 h-6" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          progress={{ current: currentIndex + 1, total: totalQuestions }}
          score={score}
        />

        {/* Question Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-6 md:p-10 space-y-6 animate-slide-in-up">
          {/* Question */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 md:p-8 shadow-playful">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white flex-1">
                {currentQuestion.question}
              </h2>
            </div>
          </div>

          {/* Image if available */}
          {currentQuestion.image && (
            <div className="flex justify-center animate-fade-in">
              <div className="w-full max-w-md rounded-2xl shadow-playful overflow-hidden">
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
                  className={`quiz-option group ${
                    showCorrect
                      ? 'quiz-option-correct'
                      : showIncorrect
                      ? 'quiz-option-wrong animate-wiggle'
                      : ''
                  }`}
                >
                  {/* Letter Badge */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl transition-all ${
                    showCorrect
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white scale-110'
                      : showIncorrect
                      ? 'bg-gradient-to-br from-red-400 to-red-500 text-white'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white group-hover:scale-110'
                  }`}>
                    {letters[index]}
                  </div>

                  {/* Option Text */}
                  <span className="flex-1 font-body text-lg md:text-xl text-gray-800">
                    {option}
                  </span>

                  {/* Check/Cross Icon */}
                  {showCorrect && (
                    <CheckCircle className="w-8 h-8 text-green-600 animate-bounce-in" />
                  )}
                  {showIncorrect && (
                    <XCircle className="w-8 h-8 text-red-600 animate-bounce-in" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {hasAnswered && currentQuestion.explanation && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 animate-fade-in">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-blue-900 mb-1">Did you know?</h3>
                  <p className="text-blue-800">{currentQuestion.explanation}</p>
                </div>
              </div>
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
              {currentIndex < totalQuestions - 1 ? 'Next Question →' : 'Finish Quiz 🎉'}
            </Button>
          )}
        </div>

        {/* Feedback */}
        {hasAnswered && (
          <div className={`p-6 rounded-2xl flex gap-4 items-start shadow-playful animate-bounce-in ${
            selectedOption === currentQuestion.correctIndex
              ? 'bg-green-50 border-2 border-green-300'
              : 'bg-orange-50 border-2 border-orange-300'
          }`}>
            {selectedOption === currentQuestion.correctIndex ? (
              <>
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-7 h-7 text-green-700" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-green-700 mb-1">Correct! 🎉</p>
                  <p className="text-green-600 text-lg">Amazing work! Keep it up!</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-7 h-7 text-orange-700" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-orange-700 mb-1">Not quite! 💪</p>
                  <p className="text-orange-600 text-lg">The correct answer is: <strong>{currentQuestion.options[currentQuestion.correctIndex]}</strong></p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
