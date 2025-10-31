'use client';

import { useState } from 'react';
import { ReadingLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';

interface ReadingRendererProps {
  lesson: ReadingLesson;
}

export function ReadingRenderer({ lesson }: ReadingRendererProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [score, setScore] = useState(0);

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
    }
  };

  if (showQuestions && currentQuestion) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{lesson.title}</h1>
            <p className="text-muted-foreground text-sm">
              Question {currentQuestionIndex + 1} of {lesson.comprehensionQuestions!.length}
            </p>
          </div>

          {/* Question Card */}
          <div className="bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
            <div className="bg-gradient-to-br from-accent to-accent/70 rounded-xl p-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-accent-foreground">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-3 md:space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctIndex;
                const showCorrect = hasAnswered && isCorrect;
                const showIncorrect = hasAnswered && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={hasAnswered}
                    className={`w-full px-6 py-4 rounded-xl text-left text-base md:text-lg transition-all duration-200 ${
                      showCorrect
                        ? 'bg-success/20 border-2 border-success text-success font-semibold'
                        : showIncorrect
                        ? 'bg-destructive/20 border-2 border-destructive text-destructive font-semibold'
                        : isSelected
                        ? 'bg-accent/90 border-2 border-accent text-accent-foreground shadow-lg font-semibold'
                        : 'bg-card border-2 border-border hover:bg-accent/20 hover:border-accent hover:shadow-md'
                    } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {hasAnswered && currentQuestionIndex < lesson.comprehensionQuestions!.length - 1 && (
              <button
                onClick={handleNextQuestion}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md px-6 py-3 transition-all duration-200 font-semibold"
              >
                Next Question
              </button>
            )}

            {hasAnswered && currentQuestionIndex === lesson.comprehensionQuestions!.length - 1 && (
              <div className="text-center p-6">
                <p className="text-2xl font-bold text-accent">
                  Final Score: {score} / {lesson.comprehensionQuestions!.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
        />

        {/* Content Sections */}
        {lesson.sections.map((section, index) => (
          <div key={index} className="bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
            {section.heading && (
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                {section.heading}
              </h2>
            )}

            <p className="text-base md:text-lg leading-relaxed text-foreground">
              {section.content}
            </p>

            {section.image && (
              <div className="flex justify-center">
                <img
                  src={section.image.src}
                  alt={section.image.alt}
                  className="w-full max-w-md rounded-lg shadow-md"
                />
              </div>
            )}

            {section.callout && (
              <div className={`p-4 rounded-xl ${
                section.callout.type === 'fun-fact' ? 'bg-accent/10 border border-accent/20' :
                section.callout.type === 'tip' ? 'bg-success/10 border border-success/20' :
                section.callout.type === 'warning' ? 'bg-warning/10 border border-warning/20' :
                'bg-card border border-border'
              }`}>
                <p className="text-sm font-semibold uppercase tracking-wide mb-2">
                  {section.callout.type.replace('-', ' ')}
                </p>
                <p className="text-foreground">{section.callout.text}</p>
              </div>
            )}
          </div>
        ))}

        {/* Comprehension Questions Button */}
        {hasQuestions && !showQuestions && (
          <div className="text-center">
            <button
              onClick={handleStartQuestions}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md px-6 py-3 transition-all duration-200 font-semibold"
            >
              Test Your Understanding
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
