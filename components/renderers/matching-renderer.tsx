'use client';

import { useState, useEffect } from 'react';
import { MatchingLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';
import { Link2, CheckCircle, RefreshCw, Sparkles, Trophy } from 'lucide-react';
import { SimpleEducationalBackground } from '@/components/ui/educational-background';
import Confetti from 'react-confetti';

interface MatchingRendererProps {
  lesson: MatchingLesson;
}

export function MatchingRenderer({ lesson }: MatchingRendererProps) {
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);
  const [matches, setMatches] = useState<Map<number, number>>(new Map());
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

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
        setShowConfetti(true);
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
      <>
        <SimpleEducationalBackground />
        <div className="min-h-screen relative py-12 px-4">
        {/* Confetti celebration */}
        {showConfetti && (
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
            description="Perfect Match!"
            score={100}
          />

          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg p-8 md:p-12 text-center space-y-8">
            {/* Trophy Icon */}
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-pink-600 dark:text-pink-400" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
              Perfect Match! 🎉
            </h1>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl shadow-lg">
                <Trophy className="w-10 h-10" />
                <div className="text-left">
                  <p className="text-5xl font-bold">{lesson.pairs.length} / {lesson.pairs.length}</p>
                  <p className="text-xl opacity-90">100% Correct</p>
                </div>
              </div>

              {/* Simple Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: '100%' }} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">100% Complete</p>
              </div>
            </div>

            <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              Incredible! You matched all pairs perfectly! ⭐
            </p>

            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-6 h-6" />
              Play Again
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <SimpleEducationalBackground />
      <div className="min-h-screen relative py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          progress={{ current: matches.size, total: lesson.pairs.length }}
        />

        {/* Progress Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <Link2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-purple-800 dark:text-purple-300">
              {matches.size} of {lesson.pairs.length} Matched
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className={`p-6 rounded-xl border-2 flex gap-4 items-center shadow-lg ${
          selectedLeft === null
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
            : 'bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700'
        }`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            selectedLeft === null
              ? 'bg-blue-100 dark:bg-blue-900/30'
              : 'bg-pink-100 dark:bg-pink-900/30'
          }`}>
            {selectedLeft === null ? (
              <Sparkles className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            ) : (
              <Link2 className="w-7 h-7 text-pink-700 dark:text-pink-400" />
            )}
          </div>
          <p className={`text-lg font-semibold ${
            selectedLeft === null
              ? 'text-blue-800 dark:text-blue-300'
              : 'text-pink-800 dark:text-pink-300'
          }`}>
            {selectedLeft === null
              ? '👈 Click an item on the left to start matching'
              : '👉 Now click the matching item on the right'}
          </p>
        </div>

        {/* Matching Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="space-y-3">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">
                  Choose from here
                </span>
              </div>
            </div>
            {lesson.pairs.map((pair, index) => {
              const isMatched = matches.has(index);
              const isSelected = selectedLeft === index;

              return (
                <button
                  key={index}
                  onClick={() => handleLeftClick(index)}
                  disabled={isMatched}
                  className={`w-full p-5 rounded-xl text-left text-base md:text-lg transition-all duration-200 transform flex items-center gap-3 ${
                    isMatched
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-2 border-green-300 dark:border-green-700 cursor-not-allowed shadow-lg scale-105'
                      : isSelected
                      ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-900 dark:text-pink-100 border-2 border-pink-300 dark:border-pink-700 shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-400 dark:hover:border-pink-600 hover:scale-105 hover:shadow-md cursor-pointer'
                  }`}
                >
                  {isMatched && (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 transition-transform duration-200" />
                  )}
                  <span className="flex-1 font-semibold">{pair.left}</span>
                </button>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                  Match it here
                </span>
              </div>
            </div>
            {shuffledRight.map((right, index) => {
              const isMatched = Array.from(matches.values()).includes(index);

              return (
                <button
                  key={index}
                  onClick={() => handleRightClick(index)}
                  disabled={isMatched || selectedLeft === null}
                  className={`w-full p-5 rounded-xl text-left text-base md:text-lg transition-all duration-200 transform flex items-center gap-3 ${
                    isMatched
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-2 border-green-300 dark:border-green-700 cursor-not-allowed shadow-lg scale-105'
                      : selectedLeft !== null
                      ? 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-400 dark:hover:border-yellow-600 hover:scale-105 hover:shadow-md cursor-pointer'
                      : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {isMatched && (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 transition-transform duration-200" />
                  )}
                  <span className="flex-1 font-semibold">{right}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
