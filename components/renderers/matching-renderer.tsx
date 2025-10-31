'use client';

import { useState, useEffect } from 'react';
import { MatchingLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';

interface MatchingRendererProps {
  lesson: MatchingLesson;
}

export function MatchingRenderer({ lesson }: MatchingRendererProps) {
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);
  const [matches, setMatches] = useState<Map<number, number>>(new Map());
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Shuffle right items on mount
  useEffect(() => {
    const right = lesson.pairs.map(p => p.right);
    const shuffled = [...right].sort(() => Math.random() - 0.5);
    setShuffledRight(shuffled);
  }, [lesson.pairs]);

  const handleLeftClick = (leftIndex: number) => {
    if (matches.has(leftIndex)) return; // Already matched
    setSelectedLeft(leftIndex);
  };

  const handleRightClick = (rightIndex: number) => {
    if (selectedLeft === null) return;

    // Check if this right item is already matched
    const alreadyMatched = Array.from(matches.values()).includes(rightIndex);
    if (alreadyMatched) return;

    // Create new match
    const newMatches = new Map(matches);
    newMatches.set(selectedLeft, rightIndex);
    setMatches(newMatches);
    setSelectedLeft(null);

    // Check if complete
    if (newMatches.size === lesson.pairs.length) {
      // Verify all matches are correct
      let allCorrect = true;
      lesson.pairs.forEach((pair, leftIdx) => {
        const matchedRightIdx = newMatches.get(leftIdx);
        if (matchedRightIdx !== undefined) {
          const matchedRight = shuffledRight[matchedRightIdx];
          if (matchedRight !== pair.right) {
            allCorrect = false;
          }
        }
      });
      if (allCorrect) {
        setIsComplete(true);
      }
    }
  };

  const handleReset = () => {
    setMatches(new Map());
    setSelectedLeft(null);
    setIsComplete(false);
    const right = lesson.pairs.map(p => p.right);
    const shuffled = [...right].sort(() => Math.random() - 0.5);
    setShuffledRight(shuffled);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header with Back Button */}
          <LessonHeader
            title={lesson.title}
            description="Perfect Match!"
          />

          <div className="bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center">
              <svg className="w-12 h-12 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Perfect Match!</h1>
            <p className="text-lg text-success">You matched all pairs correctly!</p>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md px-6 py-3 transition-all duration-200 font-semibold"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          progress={{ current: matches.size, total: lesson.pairs.length }}
        />

        {/* Matching Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-3">
            {lesson.pairs.map((pair, index) => {
              const isMatched = matches.has(index);
              const isSelected = selectedLeft === index;

              return (
                <button
                  key={index}
                  onClick={() => handleLeftClick(index)}
                  disabled={isMatched}
                  className={`w-full px-6 py-4 rounded-xl text-left text-base md:text-lg transition-all duration-200 ${
                    isMatched
                      ? 'bg-success/20 border-2 border-success text-success cursor-not-allowed'
                      : isSelected
                      ? 'bg-accent/90 border-2 border-accent text-accent-foreground shadow-lg'
                      : 'bg-card border-2 border-border hover:bg-accent/20 hover:border-accent hover:shadow-md'
                  }`}
                >
                  {pair.left}
                </button>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {shuffledRight.map((right, index) => {
              const isMatched = Array.from(matches.values()).includes(index);

              return (
                <button
                  key={index}
                  onClick={() => handleRightClick(index)}
                  disabled={isMatched || selectedLeft === null}
                  className={`w-full px-6 py-4 rounded-xl text-left text-base md:text-lg transition-all duration-200 ${
                    isMatched
                      ? 'bg-success/20 border-2 border-success text-success cursor-not-allowed'
                      : selectedLeft !== null
                      ? 'bg-card border-2 border-border hover:bg-accent/20 hover:border-accent hover:shadow-md cursor-pointer'
                      : 'bg-card border-2 border-border opacity-50 cursor-not-allowed'
                  }`}
                >
                  {right}
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center">
          <p className="text-foreground">
            {selectedLeft === null
              ? 'Click an item on the left to start matching'
              : 'Now click the matching item on the right'}
          </p>
        </div>
      </div>
    </div>
  );
}
