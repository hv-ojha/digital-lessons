'use client';

import { useState } from 'react';
import { ReadingLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';
import { BookOpen, CheckCircle, XCircle, Sparkles, Lightbulb, AlertTriangle, Trophy, ArrowRight } from 'lucide-react';
import Confetti from 'react-confetti';
import Image from 'next/image';

interface ReadingRendererProps {
  lesson: ReadingLesson;
}

export function ReadingRenderer({ lesson }: ReadingRendererProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const hasQuestions = lesson.comprehensionQuestions && lesson.comprehensionQuestions.length > 0;
  const currentQuestion = hasQuestions ? lesson.comprehensionQuestions![currentQuestionIndex] : null;

  const handleStartQuestions = () => {
    setShowQuestions(true);
  };

  const handleSelectAnswer = (index: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(index);
    setHasAnswered(true);

    if (currentQuestion && index === currentQuestion.correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (hasQuestions && currentQuestionIndex < lesson.comprehensionQuestions!.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    } else {
      // Quiz is complete
      setIsComplete(true);
      const percentage = Math.round((score / lesson.comprehensionQuestions!.length) * 100);
      if (percentage >= 70) {
        setShowConfetti(true);
      }
    }
  };

  // Completion screen
  if (isComplete && hasQuestions) {
    const percentage = Math.round((score / lesson.comprehensionQuestions!.length) * 100);
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
            onConfettiComplete={() => setShowConfetti(false)}
          />
        )}

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header with Back Button */}
          <LessonHeader
            title={lesson.title}
            description="Reading Complete!"
            score={percentage}
          />

          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg p-8 md:p-12 text-center space-y-8">
            {/* Trophy Icon */}
            <Trophy className={`w-32 h-32 mx-auto ${isGoodScore ? 'text-green-500' : 'text-orange-500'}`} />

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Great Reading! {isGoodScore ? "🎉" : ""}
            </h1>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <Trophy className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <p className="text-4xl font-bold text-gray-800 dark:text-gray-200">{score} / {lesson.comprehensionQuestions!.length}</p>
              </div>
              <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{percentage}% Correct</p>
            </div>

            {isGoodScore ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <p className="text-xl font-bold text-green-700 dark:text-green-400">Amazing comprehension! You're a reading superstar! ⭐</p>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <p className="text-xl font-bold text-orange-700 dark:text-orange-400">Good effort! Keep reading to improve! 📚</p>
              </div>
            )}

            <button
              onClick={() => {
                setIsComplete(false);
                setShowQuestions(false);
                setCurrentQuestionIndex(0);
                setScore(0);
                setSelectedAnswer(null);
                setHasAnswered(false);
              }}
              className="w-full max-w-md mx-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Read Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Questions view
  if (showQuestions && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header with Progress */}
          <LessonHeader
            title={lesson.title}
            description="Comprehension Questions"
            progress={{ current: currentQuestionIndex + 1, total: lesson.comprehensionQuestions!.length }}
            score={score}
          />

          {/* Question Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-purple-900 dark:text-purple-100">Question {currentQuestionIndex + 1} of {lesson.comprehensionQuestions!.length}</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg p-6 md:p-8 space-y-6">
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

            {/* Options */}
            <div className="space-y-3 md:space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctIndex;
                const showCorrect = hasAnswered && isCorrect;
                const showIncorrect = hasAnswered && isSelected && !isCorrect;

                const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={hasAnswered}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 transform hover:scale-105 ${
                      showCorrect
                        ? 'bg-green-500 text-white border-green-600 scale-105 shadow-lg'
                        : showIncorrect
                        ? 'bg-red-500 text-white border-red-600'
                        : isSelected
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-600 shadow-lg scale-105'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md'
                    } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {/* Letter Badge */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                      showCorrect
                        ? 'bg-white/30 text-white'
                        : showIncorrect
                        ? 'bg-white/30 text-white'
                        : isSelected
                        ? 'bg-white/30 text-white'
                        : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                    }`}>
                      {letters[index]}
                    </div>

                    {/* Option Text */}
                    <span className="flex-1 text-lg md:text-xl">
                      {option}
                    </span>

                    {/* Check/Cross Icon */}
                    {showCorrect && (
                      <CheckCircle className="w-8 h-8 text-white" />
                    )}
                    {showIncorrect && (
                      <XCircle className="w-8 h-8 text-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            {hasAnswered && (
              <button
                onClick={handleNextQuestion}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                {currentQuestionIndex < lesson.comprehensionQuestions!.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  'See Results 🎉'
                )}
              </button>
            )}
          </div>

          {/* Feedback */}
          {hasAnswered && (
            <div className={`p-6 rounded-xl flex gap-4 items-start shadow-lg ${
              selectedAnswer === currentQuestion.correctIndex
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-700'
            }`}>
              {selectedAnswer === currentQuestion.correctIndex ? (
                <>
                  <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-7 h-7 text-green-700 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">Excellent! 🎉</p>
                    <p className="text-green-600 dark:text-green-400 text-lg">You understood that perfectly!</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-7 h-7 text-orange-700 dark:text-orange-300" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
        />

        {/* Content Sections */}
        {lesson.sections.map((section, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg p-6 md:p-8 space-y-6"
          >
            {section.heading && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {section.heading}
                </h2>
              </div>
            )}

            <p className="text-base md:text-lg leading-relaxed text-gray-800 dark:text-gray-200">
              {section.content}
            </p>

            {section.image && (
              <div className="flex justify-center">
                <div className="w-full max-w-md rounded-xl shadow-lg overflow-hidden">
                  <Image
                    src={section.image.src}
                    alt={section.image.alt}
                    width={500}
                    height={400}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {section.callout && (
              <div className={`p-5 rounded-xl border-2 flex gap-3 items-start ${
                section.callout.type === 'fun-fact'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                  : section.callout.type === 'tip'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                  : section.callout.type === 'warning'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  section.callout.type === 'fun-fact'
                    ? 'bg-yellow-200 dark:bg-yellow-800'
                    : section.callout.type === 'tip'
                    ? 'bg-green-200 dark:bg-green-800'
                    : section.callout.type === 'warning'
                    ? 'bg-red-200 dark:bg-red-800'
                    : 'bg-blue-200 dark:bg-blue-800'
                }`}>
                  {section.callout.type === 'fun-fact' ? (
                    <Sparkles className={`w-6 h-6 ${
                      section.callout.type === 'fun-fact' ? 'text-yellow-700 dark:text-yellow-300' : ''
                    }`} />
                  ) : section.callout.type === 'tip' ? (
                    <Lightbulb className="w-6 h-6 text-green-700 dark:text-green-300" />
                  ) : section.callout.type === 'warning' ? (
                    <AlertTriangle className="w-6 h-6 text-red-700 dark:text-red-300" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-blue-700 dark:text-blue-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold uppercase tracking-wide mb-1 ${
                    section.callout.type === 'fun-fact'
                      ? 'text-yellow-800 dark:text-yellow-300'
                      : section.callout.type === 'tip'
                      ? 'text-green-800 dark:text-green-300'
                      : section.callout.type === 'warning'
                      ? 'text-red-800 dark:text-red-300'
                      : 'text-blue-800 dark:text-blue-300'
                  }`}>
                    {section.callout.type.replace('-', ' ')}
                  </p>
                  <p className={`font-semibold ${
                    section.callout.type === 'fun-fact'
                      ? 'text-yellow-900 dark:text-yellow-200'
                      : section.callout.type === 'tip'
                      ? 'text-green-900 dark:text-green-200'
                      : section.callout.type === 'warning'
                      ? 'text-red-900 dark:text-red-200'
                      : 'text-blue-900 dark:text-blue-200'
                  }`}>
                    {section.callout.text}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Comprehension Questions Button */}
        {hasQuestions && !showQuestions && (
          <div className="text-center">
            <button
              onClick={handleStartQuestions}
              className="min-w-[250px] px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Test Your Understanding
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
