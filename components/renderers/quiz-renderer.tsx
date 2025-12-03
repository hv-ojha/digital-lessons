'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';
import { CheckCircle, XCircle, Sparkles, Trophy, RefreshCw, Star } from 'lucide-react';
import { SparkyMascot, SparkyMessage } from '@/components/sparky-mascot';
import { Celebration, QuickFeedback } from '@/components/celebration';
import { PlayfulButton } from '@/components/ui/playful-button';
import { SimpleEducationalBackground } from '@/components/ui/educational-background';
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const currentQuestion = lesson.questions[currentIndex];
  const totalQuestions = lesson.questions.length;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleSelectOption = (index: number) => {
    if (hasAnswered) return;

    setSelectedOption(index);
    setHasAnswered(true);
    setShowFeedback(true);

    if (index === currentQuestion.correctIndex) {
      setScore(score + 1);
      // TODO: Add success sound effect
      // playSound('correct');
    } else {
      // TODO: Add incorrect sound effect
      // playSound('incorrect');
    }

    // Hide feedback after animation
    setTimeout(() => setShowFeedback(false), 1500);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      const finalScore = selectedOption === currentQuestion.correctIndex ? score + 1 : score;
      setScore(finalScore);
      setIsComplete(true);

      // Show celebration based on score
      const finalPercentage = Math.round((finalScore / totalQuestions) * 100);
      if (finalPercentage === 100) {
        setShowCelebration(true);
        // TODO: Add perfect score sound
        // playSound('perfect');
      } else if (finalPercentage >= 70) {
        setShowCelebration(true);
        // TODO: Add completion sound
        // playSound('complete');
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsComplete(false);
    setSelectedOption(null);
    setHasAnswered(false);
    setShowCelebration(false);
  };

  if (isComplete) {
    const percentage = Math.round((score / totalQuestions) * 100);
    const isPerfect = percentage === 100;
    const isGoodScore = percentage >= 70;

    return (
      <>
        <SimpleEducationalBackground />
        <div className="min-h-screen relative py-12 px-4">
          {/* Celebration Animation */}
          {showCelebration && (
          <Celebration
            type={isPerfect ? 'perfect' : 'complete'}
            message={isPerfect ? "Perfect Score! You're amazing!" : "Great job completing the quiz!"}
            score={percentage}
            onComplete={() => setShowCelebration(false)}
            duration={4000}
          />
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header with Back Button */}
          <LessonHeader
            title={lesson.title}
            description="Quiz Complete!"
          />

          {/* Sparky Celebration */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <SparkyMessage
              emotion={isPerfect ? "celebrating" : isGoodScore ? "excited" : "encouraging"}
              message={
                isPerfect
                  ? "WOW! A perfect score! You're absolutely brilliant! I'm so proud of you! 🌟"
                  : isGoodScore
                  ? "Fantastic work! You really know your stuff! Keep up the amazing learning! 🎉"
                  : "Great effort! Every quiz makes you smarter. Let's try again and do even better! 💪"
              }
            />
          </motion.div>

          {/* Results Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-playful p-8 md:p-12 text-center space-y-8"
          >
            {/* Animated Trophy */}
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-playful-lg"
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="heading-kid-hero text-gray-900 dark:text-gray-100">
              Quiz Complete! {isPerfect ? "⭐" : isGoodScore ? "🎉" : "💪"}
            </h1>

            {/* Animated Score Display */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.6 }}
              className="space-y-4"
            >
              <div className={`inline-flex items-center gap-4 px-8 py-6 rounded-2xl shadow-playful bg-gradient-to-r ${
                isPerfect
                  ? 'from-yellow-400 via-orange-400 to-pink-500'
                  : isGoodScore
                  ? 'from-green-400 to-emerald-500'
                  : 'from-purple-500 to-pink-500'
              } text-white`}>
                {isPerfect && <Star className="w-12 h-12 fill-current" />}
                {isGoodScore && !isPerfect && <Trophy className="w-12 h-12" />}
                <div className="text-left">
                  <p className="text-6xl font-display font-bold">{score} / {totalQuestions}</p>
                  <p className="text-2xl opacity-90 font-semibold">{percentage}% Correct</p>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="progress-playful">
                  <motion.div
                    className={`progress-fill ${
                      isPerfect
                        ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500'
                        : isGoodScore
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, type: 'spring' }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-semibold">
                  {percentage}% Mastery
                </p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className={`text-2xl font-bold ${
                isPerfect
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : isGoodScore
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}
            >
              {isPerfect
                ? "Perfect! You're a genius! ⭐"
                : isGoodScore
                ? "Amazing job! You're a superstar! 🌟"
                : "Keep practicing! You're getting better! 💪"}
            </motion.p>

            <PlayfulButton
              variant="playful"
              size="lg"
              icon={<RefreshCw className="w-6 h-6" />}
              onClick={handleRestart}
            >
              Try Again
            </PlayfulButton>
          </motion.div>
        </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <SimpleEducationalBackground />
      <div className="min-h-screen relative py-12 px-4">
        {/* Quick Feedback */}
        {showFeedback && (
        <QuickFeedback
          correct={selectedOption === currentQuestion.correctIndex}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          progress={{ current: currentIndex + 1, total: totalQuestions }}
          score={score}
        />

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-playful p-6 md:p-10 space-y-6"
          >
          {/* Question */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 md:p-8 shadow-playful"
          >
            <div className="flex items-start gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white flex-1">
                {currentQuestion.question}
              </h2>
            </div>
          </motion.div>

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
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={!hasAnswered ? { scale: 1.02, x: 4 } : {}}
                  whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                  onClick={() => handleSelectOption(index)}
                  disabled={hasAnswered}
                  className={`w-full flex items-center gap-4 p-4 text-left transition-all duration-200 rounded-2xl border-2 ${
                    showCorrect
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 shadow-lg'
                      : showIncorrect
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg'
                  } disabled:cursor-not-allowed group`}
                >
                  {/* Letter Badge */}
                  <motion.div
                    animate={showCorrect ? {
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    } : showIncorrect ? {
                      x: [-4, 4, -4, 4, 0]
                    } : {}}
                    transition={{ duration: 0.5 }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl font-display transition-all ${
                      showCorrect
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white scale-110 shadow-lg'
                        : showIncorrect
                        ? 'bg-gradient-to-br from-red-400 to-red-500 text-white'
                        : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white group-hover:scale-110'
                    }`}
                  >
                    {letters[index]}
                  </motion.div>

                  {/* Option Text */}
                  <span className="flex-1 text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {option}
                  </span>

                  {/* Check/Cross Icon */}
                  {showCorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </motion.div>
                  )}
                  {showIncorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          {hasAnswered && currentQuestion.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 rounded-2xl p-5"
            >
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-blue-900 dark:text-blue-100 mb-1">Did you know? 💡</h3>
                  <p className="text-blue-800 dark:text-blue-200 leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Next Button */}
          {hasAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PlayfulButton
                variant="playful"
                size="lg"
                onClick={handleNext}
                fullWidth
              >
                {currentIndex < totalQuestions - 1 ? 'Next Question →' : 'Finish Quiz 🎉'}
              </PlayfulButton>
            </motion.div>
          )}
        </motion.div>
        </AnimatePresence>

        {/* Sparky Feedback */}
        <AnimatePresence>
          {hasAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SparkyMessage
                emotion={selectedOption === currentQuestion.correctIndex ? "celebrating" : "encouraging"}
                message={
                  selectedOption === currentQuestion.correctIndex
                    ? "Woohoo! You got it right! You're so smart! 🎉"
                    : `Not quite, but that's okay! The correct answer is: ${currentQuestion.options[currentQuestion.correctIndex]}. Keep learning! 💪`
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </>
  );
}
