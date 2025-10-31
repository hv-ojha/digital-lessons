'use client';

import { useState } from 'react';
import { FlashcardLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';

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
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          progress={{ current: currentIndex + 1, total: totalCards }}
        />

        {/* Flashcard */}
        <div
          onClick={handleFlip}
          className="bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-12 min-h-[400px] flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transition-all duration-200"
        >
          <div className="text-center space-y-6 w-full">
            {!isFlipped ? (
              <>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Front</p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  {currentCard.front}
                </h2>
                {currentCard.hint && !isFlipped && (
                  <p className="text-sm text-warning">{currentCard.hint}</p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Back</p>
                <p className="text-2xl md:text-3xl text-foreground">
                  {currentCard.back}
                </p>
              </>
            )}

            {currentCard.image && (
              <div className="flex justify-center mt-6">
                <img
                  src={currentCard.image.src}
                  alt={currentCard.image.alt}
                  className="w-full max-w-sm rounded-lg shadow-md"
                />
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-8">
              Click to {isFlipped ? 'flip back' : 'see answer'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-3 bg-card border-2 border-border rounded-xl hover:bg-accent/20 hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === totalCards - 1}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
