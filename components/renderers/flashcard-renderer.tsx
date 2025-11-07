'use client';

import { useState } from 'react';
import { FlashcardLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface FlashcardRendererProps {
  lesson: FlashcardLesson;
}

export function FlashcardRenderer({ lesson }: FlashcardRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = lesson.cards[currentIndex];
  const totalCards = lesson.cards.length;

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          progress={{ current: currentIndex + 1, total: totalCards }}
        />

        {/* Card Counter Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-purple-800 dark:text-purple-300">
              Card {currentIndex + 1} of {totalCards}
            </span>
          </div>
        </div>

        {/* 3D Flashcard with Flip Animation */}
        <div className="perspective-1000 px-4">
          <div
            onClick={handleFlip}
            className="relative w-full h-[500px] cursor-pointer"
            style={{
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front of Card */}
            <div
              className="absolute w-full h-full backface-hidden rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 md:p-12 flex flex-col items-center justify-center shadow-lg"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-center space-y-6 w-full">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-semibold uppercase tracking-wide">Question</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                  {currentCard.front}
                </h2>

                {currentCard.hint && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mt-6">
                    <p className="text-white/90 text-lg">💡 Hint: {currentCard.hint}</p>
                  </div>
                )}

                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                  <p className="text-white/80 text-sm flex items-center gap-2 animate-bounce">
                    <RotateCcw className="w-4 h-4" />
                    Click to flip
                  </p>
                </div>
              </div>
            </div>

            {/* Back of Card */}
            <div
              className="absolute w-full h-full backface-hidden rounded-xl bg-gradient-to-br from-green-500 to-teal-600 p-8 md:p-12 flex flex-col items-center justify-center shadow-lg"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="text-center space-y-6 w-full">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-semibold uppercase tracking-wide">Answer</span>
                </div>

                <p className="text-2xl md:text-4xl font-bold text-white leading-relaxed">
                  {currentCard.back}
                </p>

                {currentCard.image && (
                  <div className="flex justify-center mt-6">
                    <div className="w-full max-w-md rounded-xl shadow-lg overflow-hidden border-2 border-white/20">
                      <Image
                        src={currentCard.image.src}
                        alt={currentCard.image.alt}
                        width={500}
                        height={400}
                        className="w-full h-auto"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}

                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                  <p className="text-white/80 text-sm flex items-center gap-2 animate-bounce">
                    <RotateCcw className="w-4 h-4" />
                    Click to flip back
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-center items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            disabled={currentIndex === 0}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFlip();
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Flip Card
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={currentIndex === totalCards - 1}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
