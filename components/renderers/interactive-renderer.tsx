'use client';

import { useState } from 'react';
import { InteractiveLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';

interface InteractiveRendererProps {
  lesson: InteractiveLesson;
}

export function InteractiveRenderer({ lesson }: InteractiveRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const currentStep = lesson.steps[currentIndex];
  const totalSteps = lesson.steps.length;

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
    setHasAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    }
  };

  const isCorrect = currentStep.correctIndex !== undefined && selectedOption === currentStep.correctIndex;
  const showFeedback = hasAnswered && currentStep.feedback;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          progress={{ current: currentIndex + 1, total: totalSteps }}
        />

        {/* Step Card */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
          <div className="bg-gradient-to-br from-accent to-accent/70 rounded-xl p-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-accent-foreground">
              {currentStep.instruction}
            </h2>
          </div>

          {currentStep.image && (
            <div className="flex justify-center">
              <img
                src={currentStep.image.src}
                alt={currentStep.image.alt}
                className="w-full max-w-md rounded-lg shadow-md"
              />
            </div>
          )}

          <div className="space-y-3 md:space-y-4">
            {currentStep.options.map((option, index) => {
              const isSelected = selectedOption === index;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  disabled={hasAnswered}
                  className={`w-full px-6 py-4 rounded-xl text-left text-base md:text-lg transition-all duration-200 ${
                    isSelected
                      ? 'bg-accent/90 border-2 border-accent text-accent-foreground shadow-lg font-semibold'
                      : 'bg-card border-2 border-border hover:bg-accent/20 hover:border-accent hover:shadow-md'
                  } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className={`p-6 rounded-xl ${
              isCorrect ? 'bg-success/10 border border-success/20' : 'bg-warning/10 border border-warning/20'
            }`}>
              <p className={isCorrect ? 'text-success' : 'text-warning'}>
                {isCorrect ? currentStep.feedback.correct : currentStep.feedback.incorrect}
              </p>
            </div>
          )}

          {hasAnswered && currentIndex < totalSteps - 1 && (
            <button
              onClick={handleNext}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md px-6 py-3 transition-all duration-200 font-semibold"
            >
              Continue
            </button>
          )}

          {hasAnswered && currentIndex === totalSteps - 1 && (
            <div className="text-center p-6">
              <p className="text-2xl font-bold text-accent">Activity Complete!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
