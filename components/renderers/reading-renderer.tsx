'use client';

import { useState } from 'react';
import { ReadingLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';
import { Button } from '@/components/ui/button';
import { PlayfulBadge } from '@/components/ui/playful-badge';
import { BookOpen, CheckCircle, XCircle, Sparkles, Lightbulb, AlertTriangle, Trophy } from 'lucide-react';
import Confetti from 'react-confetti';

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
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

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-8 md:p-12 text-center space-y-8 animate-bounce-in">
            {/* Sparky Mascot */}
            <svg
              viewBox="0 0 200 200"
              className={`w-32 h-32 mx-auto ${isGoodScore ? 'animate-tada' : 'animate-float'}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="readingStarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isGoodScore ? "#10B981" : "#F59E0B"} />
                  <stop offset="50%" stopColor={isGoodScore ? "#3B82F6" : "#F97316"} />
                  <stop offset="100%" stopColor={isGoodScore ? "#8B5CF6" : "#EF4444"} />
                </linearGradient>
              </defs>
              <path
                d="M100 20 L115 70 L165 75 L125 110 L135 160 L100 135 L65 160 L75 110 L35 75 L85 70 Z"
                fill="url(#readingStarGradient)"
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
              Great Reading! {isGoodScore ? "🎉" : ""}
            </h1>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-100 to-pink-100 px-8 py-4 rounded-2xl">
                <Trophy className="w-8 h-8 text-purple-600" />
                <p className="text-4xl font-bold text-gray-800">{score} / {lesson.comprehensionQuestions!.length}</p>
              </div>
              <p className="text-2xl font-semibold text-gray-700">{percentage}% Correct</p>
            </div>

            {isGoodScore ? (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6">
                <p className="text-xl font-bold text-green-700">Amazing comprehension! You're a reading superstar! ⭐</p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6">
                <p className="text-xl font-bold text-orange-700">Good effort! Keep reading to improve! 📚</p>
              </div>
            )}

            <Button
              onClick={() => {
                setIsComplete(false);
                setShowQuestions(false);
                setCurrentQuestionIndex(0);
                setScore(0);
                setSelectedAnswer(null);
                setHasAnswered(false);
              }}
              variant="playful"
              size="xl"
              className="w-full max-w-md mx-auto"
            >
              <BookOpen className="w-5 h-5" />
              Read Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Questions view
  if (showQuestions && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
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
            <PlayfulBadge variant="magic" size="lg" icon={<BookOpen className="w-5 h-5" />}>
              Question {currentQuestionIndex + 1} of {lesson.comprehensionQuestions!.length}
            </PlayfulBadge>
          </div>

          {/* Question Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-6 md:p-8 space-y-6 animate-slide-in-up">
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
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 transform hover:scale-105 ${
                      showCorrect
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-600 scale-110 shadow-playful-lg'
                        : showIncorrect
                        ? 'bg-gradient-to-br from-red-400 to-red-500 text-white border-red-600 animate-wiggle'
                        : isSelected
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-600 shadow-lg scale-105'
                        : 'bg-white border-gray-300 text-gray-800 hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 hover:border-purple-400 hover:shadow-md'
                    } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {/* Letter Badge */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
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

            {/* Next Button */}
            {hasAnswered && (
              <Button
                onClick={handleNextQuestion}
                variant="playful"
                size="xl"
                className="w-full"
              >
                {currentQuestionIndex < lesson.comprehensionQuestions!.length - 1 ? 'Next Question →' : 'See Results 🎉'}
              </Button>
            )}
          </div>

          {/* Feedback */}
          {hasAnswered && (
            <div className={`p-6 rounded-2xl flex gap-4 items-start shadow-playful animate-bounce-in ${
              selectedAnswer === currentQuestion.correctIndex
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400'
                : 'bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-400'
            }`}>
              {selectedAnswer === currentQuestion.correctIndex ? (
                <>
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-7 h-7 text-green-700" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-green-700 mb-1">Excellent! 🎉</p>
                    <p className="text-green-600 text-lg">You understood that perfectly!</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
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
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-6 md:p-8 space-y-6 animate-slide-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {section.heading && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold gradient-text-magic">
                  {section.heading}
                </h2>
              </div>
            )}

            <p className="text-base md:text-lg leading-relaxed text-gray-800 font-body">
              {section.content}
            </p>

            {section.image && (
              <div className="flex justify-center animate-fade-in">
                <img
                  src={section.image.src}
                  alt={section.image.alt}
                  className="w-full max-w-md rounded-2xl shadow-playful"
                />
              </div>
            )}

            {section.callout && (
              <div className={`p-5 rounded-2xl border-2 flex gap-3 items-start ${
                section.callout.type === 'fun-fact'
                  ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300'
                  : section.callout.type === 'tip'
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300'
                  : section.callout.type === 'warning'
                  ? 'bg-gradient-to-r from-red-100 to-orange-100 border-red-300'
                  : 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-300'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  section.callout.type === 'fun-fact'
                    ? 'bg-yellow-200'
                    : section.callout.type === 'tip'
                    ? 'bg-green-200'
                    : section.callout.type === 'warning'
                    ? 'bg-red-200'
                    : 'bg-blue-200'
                }`}>
                  {section.callout.type === 'fun-fact' ? (
                    <Sparkles className={`w-6 h-6 ${
                      section.callout.type === 'fun-fact' ? 'text-yellow-700' : ''
                    }`} />
                  ) : section.callout.type === 'tip' ? (
                    <Lightbulb className="w-6 h-6 text-green-700" />
                  ) : section.callout.type === 'warning' ? (
                    <AlertTriangle className="w-6 h-6 text-red-700" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-blue-700" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold uppercase tracking-wide mb-1 ${
                    section.callout.type === 'fun-fact'
                      ? 'text-yellow-800'
                      : section.callout.type === 'tip'
                      ? 'text-green-800'
                      : section.callout.type === 'warning'
                      ? 'text-red-800'
                      : 'text-blue-800'
                  }`}>
                    {section.callout.type.replace('-', ' ')}
                  </p>
                  <p className={`font-semibold ${
                    section.callout.type === 'fun-fact'
                      ? 'text-yellow-900'
                      : section.callout.type === 'tip'
                      ? 'text-green-900'
                      : section.callout.type === 'warning'
                      ? 'text-red-900'
                      : 'text-blue-900'
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
          <div className="text-center animate-bounce-in">
            <Button
              onClick={handleStartQuestions}
              variant="playful"
              size="xl"
              className="min-w-[250px]"
            >
              <Sparkles className="w-5 h-5" />
              Test Your Understanding
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
