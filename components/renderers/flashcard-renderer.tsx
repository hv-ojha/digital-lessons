'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlashcardLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles, Star } from 'lucide-react';
import { SparkyMascot } from '@/components/sparky-mascot';
import { PlayfulButton } from '@/components/ui/playful-button';
import { SimpleEducationalBackground } from '@/components/ui/educational-background';
import Image from 'next/image';

interface FlashcardRendererProps {
  lesson: FlashcardLesson;
}

export function FlashcardRenderer({ lesson }: FlashcardRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = lesson.cards[currentIndex];
  const totalCards = lesson.cards.length;

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      // TODO: Add page flip sound
      // playSound('flip');
    } else {
      // Reached the end of cards
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      // TODO: Add page flip sound
      // playSound('flip');
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    // TODO: Add flip sound
    // playSound('cardFlip');
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
  };

  const progress = Math.round(((currentIndex + 1) / totalCards) * 100);

  // Completion Screen
  if (isComplete) {
    return (
      <>
        <SimpleEducationalBackground />
        <div className="min-h-screen relative py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <LessonHeader
              title={lesson.title}
              description="Flashcards Complete!"
            />

            {/* Completion Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-playful-lg p-8 md:p-12 text-center space-y-8"
            >
              {/* Trophy Animation */}
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
                className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-playful-lg"
              >
                <Star className="w-12 h-12 text-white fill-current" />
              </motion.div>

              <div>
                <h1 className="heading-kid-hero text-gray-900 dark:text-gray-100 mb-4">
                  Great Job! 🎉
                </h1>
                <p className="text-kid-body text-gray-600 dark:text-gray-400">
                  You reviewed all {totalCards} flashcard{totalCards !== 1 ? 's' : ''}!
                </p>
              </div>

              {/* Sparky Message */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <SparkyMascot emotion="celebrating" size="lg" />
                <p className="mt-4 text-lg font-semibold text-purple-600 dark:text-purple-400">
                  Amazing work! You're getting smarter every day! 🌟
                </p>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <PlayfulButton
                  variant="playful"
                  size="lg"
                  icon={<RotateCcw className="w-5 h-5" />}
                  onClick={handleRestart}
                >
                  Review Again
                </PlayfulButton>
              </div>

              {/* Study Tips */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  💡 <strong>Study Tip:</strong> Reviewing multiple times helps you remember better. Try going through these cards again tomorrow!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SimpleEducationalBackground />
      <div className="min-h-screen relative py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          progress={{ current: currentIndex + 1, total: totalCards }}
        />

        {/* Progress Bar with Sparky */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <SparkyMascot emotion="thinking" size="sm" animate={false} />
          </motion.div>

          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-display font-semibold">Card {currentIndex + 1} of {totalCards}</span>
              <span className="font-semibold">{progress}% Complete</span>
            </div>
            <div className="progress-playful">
              <motion.div
                className="progress-fill bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, type: 'spring' }}
              />
            </div>
          </div>
        </motion.div>

        {/* 3D Flashcard */}
        <div className="perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-[500px] md:h-[600px]"
            >
              <motion.div
                className="relative w-full h-full cursor-pointer preserve-3d"
                onClick={handleFlip}
                animate={{
                  rotateY: isFlipped ? 180 : 0,
                }}
                transition={{
                  duration: 0.6,
                  type: 'spring',
                  stiffness: 100,
                }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Front of Card */}
                <motion.div
                  className="absolute w-full h-full rounded-3xl shadow-playful-lg p-8 md:p-12 flex flex-col items-center justify-center overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 overflow-hidden opacity-20">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-32 h-32 rounded-full bg-white"
                        style={{
                          left: `${(i * 25) % 100}%`,
                          top: `${(i * 35) % 100}%`,
                        }}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                          duration: 3 + i,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative z-10 text-center space-y-6 w-full">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full"
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                      <span className="text-sm text-white font-bold uppercase tracking-wider">Question</span>
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl md:text-6xl font-display font-bold text-white leading-tight px-4"
                    >
                      {currentCard.front}
                    </motion.h2>

                    {currentCard.hint && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 mx-4 md:mx-12"
                      >
                        <p className="text-white text-lg md:text-xl font-medium">
                          💡 Hint: {currentCard.hint}
                        </p>
                      </motion.div>
                    )}

                    <motion.div
                      className="absolute top-4 right-4"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="flex items-center gap-2 text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                        <RotateCcw className="w-3 h-3" />
                        <span className="text-xs font-semibold">Click to flip</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Back of Card */}
                <motion.div
                  className="absolute w-full h-full rounded-3xl shadow-playful-lg p-8 md:p-12 flex flex-col items-center justify-center overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  }}
                >
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 overflow-hidden opacity-20">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          left: `${(i * 20) % 100}%`,
                          top: `${(i * 25) % 100}%`,
                        }}
                        animate={{
                          rotate: 360,
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 4 + i,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <Star className="w-8 h-8 text-white fill-current" />
                      </motion.div>
                    ))}
                  </div>

                  <div className="relative z-10 text-center space-y-6 w-full">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full"
                    >
                      <Star className="w-5 h-5 text-white fill-current" />
                      <span className="text-sm text-white font-bold uppercase tracking-wider">Answer</span>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl md:text-5xl font-display font-bold text-white leading-relaxed px-4"
                    >
                      {currentCard.back}
                    </motion.p>

                    {currentCard.image && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex justify-center"
                      >
                        <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-4 border-white/30">
                          <Image
                            src={currentCard.image.src}
                            alt={currentCard.image.alt}
                            width={500}
                            height={400}
                            className="w-full h-auto"
                            loading="lazy"
                          />
                        </div>
                      </motion.div>
                    )}

                    <motion.div
                      className="absolute top-4 right-4"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="flex items-center gap-2 text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                        <RotateCcw className="w-3 h-3" />
                        <span className="text-xs font-semibold">Click to flip</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 justify-center items-center flex-wrap"
        >
          <PlayfulButton
            variant="outline"
            size="lg"
            icon={<ChevronLeft className="w-5 h-5" />}
            iconPosition="left"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </PlayfulButton>

          <PlayfulButton
            variant="playful"
            size="lg"
            icon={<RotateCcw className="w-5 h-5" />}
            onClick={handleFlip}
          >
            {isFlipped ? 'See Question' : 'Reveal Answer'}
          </PlayfulButton>

          <PlayfulButton
            variant={currentIndex === totalCards - 1 ? "playful" : "outline"}
            size="lg"
            icon={currentIndex === totalCards - 1 ? <Star className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            iconPosition="right"
            onClick={handleNext}
          >
            {currentIndex === totalCards - 1 ? 'Finish' : 'Next'}
          </PlayfulButton>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 text-center"
        >
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            💡 <strong>Study Tip:</strong> Try to answer before flipping the card. Repeat cards you find difficult!
          </p>
        </motion.div>
        </div>
      </div>
    </>
  );
}
