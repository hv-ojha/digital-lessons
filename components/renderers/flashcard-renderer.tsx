'use client';

import { useState } from 'react';
import { FlashcardLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';
import { PlayfulBadge } from '@/components/ui/playful-badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          progress={{ current: currentIndex + 1, total: totalCards }}
        />

        {/* Card Counter Badge */}
        <div className="flex justify-center">
          <PlayfulBadge variant="magic" size="lg" icon={<Sparkles className="w-5 h-5" />}>
            Card {currentIndex + 1} of {totalCards}
          </PlayfulBadge>
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
              className="absolute w-full h-full backface-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 md:p-12 flex flex-col items-center justify-center shadow-playful-lg"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-center space-y-6 w-full">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-semibold uppercase tracking-wide">Question</span>
                </div>

                <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white leading-tight">
                  {currentCard.front}
                </h2>

                {currentCard.hint && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mt-6">
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
              className="absolute w-full h-full backface-hidden rounded-3xl bg-gradient-to-br from-green-500 to-teal-600 p-8 md:p-12 flex flex-col items-center justify-center shadow-playful-lg"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="text-center space-y-6 w-full">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-semibold uppercase tracking-wide">Answer</span>
                </div>

                <p className="font-display text-2xl md:text-4xl font-bold text-white leading-relaxed">
                  {currentCard.back}
                </p>

                {currentCard.image && (
                  <div className="flex justify-center mt-6">
                    <img
                      src={currentCard.image.src}
                      alt={currentCard.image.alt}
                      className="w-full max-w-md rounded-2xl shadow-playful"
                    />
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
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            disabled={currentIndex === 0}
            variant="magic"
            size="lg"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </Button>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleFlip();
            }}
            variant="sunshine"
            size="lg"
          >
            <RotateCcw className="w-5 h-5" />
            Flip Card
          </Button>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={currentIndex === totalCards - 1}
            variant="magic"
            size="lg"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
