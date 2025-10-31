'use client';

import { useState, useEffect } from 'react';
import { MatchingLesson } from '@/types/lesson-content';
import { LessonHeader } from './lesson-header';
import { Button } from '@/components/ui/button';
import { PlayfulBadge } from '@/components/ui/playful-badge';
import { Link2, CheckCircle, RefreshCw, Sparkles, Trophy } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 py-12 px-4">
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

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-8 md:p-12 text-center space-y-8 animate-bounce-in">
            {/* Sparky Mascot - Celebrating */}
            <svg
              viewBox="0 0 200 200"
              className="w-32 h-32 mx-auto animate-tada"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="matchingStarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EC4899" />
                  <stop offset="50%" stopColor="#F472B6" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
              </defs>
              <path
                d="M100 20 L115 70 L165 75 L125 110 L135 160 L100 135 L65 160 L75 110 L35 75 L85 70 Z"
                fill="url(#matchingStarGradient)"
                stroke="#DB2777"
                strokeWidth="3"
              />
              <circle cx="85" cy="85" r="8" fill="white" />
              <circle cx="115" cy="85" r="8" fill="white" />
              <circle cx="87" cy="87" r="4" fill="#1F2937" />
              <circle cx="117" cy="87" r="4" fill="#1F2937" />
              {/* Big happy smile */}
              <path d="M 75 100 Q 100 125 125 100" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" fill="none" />
            </svg>

            <h1 className="font-display text-4xl md:text-5xl font-extrabold gradient-text-rainbow">
              Perfect Match! 🎉
            </h1>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-100 to-purple-100 px-8 py-4 rounded-2xl">
                <Trophy className="w-8 h-8 text-pink-600" />
                <p className="text-4xl font-bold text-gray-800">{lesson.pairs.length} / {lesson.pairs.length}</p>
              </div>
              <p className="text-2xl font-semibold text-gray-700">100% Correct</p>
            </div>

            <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-6">
              <p className="text-xl font-bold text-pink-700">Incredible! You matched all pairs perfectly! ⭐</p>
            </div>

            <Button
              onClick={handleReset}
              variant="rainbow"
              size="xl"
              className="w-full max-w-md mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          progress={{ current: matches.size, total: lesson.pairs.length }}
        />

        {/* Progress Badge */}
        <div className="flex justify-center">
          <PlayfulBadge variant="rainbow" size="lg" icon={<Link2 className="w-5 h-5" />}>
            {matches.size} of {lesson.pairs.length} Matched
          </PlayfulBadge>
        </div>

        {/* Instructions */}
        <div className={`p-6 rounded-2xl border-2 flex gap-4 items-center shadow-playful animate-bounce-in ${
          selectedLeft === null
            ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-300'
            : 'bg-gradient-to-r from-pink-100 to-rose-100 border-pink-300'
        }`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            selectedLeft === null ? 'bg-blue-200' : 'bg-pink-200'
          }`}>
            {selectedLeft === null ? (
              <Sparkles className="w-7 h-7 text-blue-700" />
            ) : (
              <Link2 className="w-7 h-7 text-pink-700" />
            )}
          </div>
          <p className={`text-lg font-bold ${
            selectedLeft === null ? 'text-blue-800' : 'text-pink-800'
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
              <PlayfulBadge variant="magic" size="default">
                Choose from here
              </PlayfulBadge>
            </div>
            {lesson.pairs.map((pair, index) => {
              const isMatched = matches.has(index);
              const isSelected = selectedLeft === index;

              return (
                <button
                  key={index}
                  onClick={() => handleLeftClick(index)}
                  disabled={isMatched}
                  className={`w-full p-5 rounded-2xl text-left text-base md:text-lg transition-all duration-200 transform flex items-center gap-3 ${
                    isMatched
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white border-2 border-green-600 cursor-not-allowed shadow-playful-lg scale-105'
                      : isSelected
                      ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white border-2 border-pink-600 shadow-lg scale-105'
                      : 'bg-white border-2 border-gray-300 text-gray-800 hover:bg-gradient-to-br hover:from-pink-100 hover:to-rose-100 hover:border-pink-400 hover:scale-105 hover:shadow-md cursor-pointer'
                  }`}
                >
                  {isMatched && (
                    <CheckCircle className="w-6 h-6 text-white animate-bounce-in" />
                  )}
                  <span className="flex-1 font-body">{pair.left}</span>
                </button>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div className="text-center mb-4">
              <PlayfulBadge variant="sunshine" size="default">
                Match it here
              </PlayfulBadge>
            </div>
            {shuffledRight.map((right, index) => {
              const isMatched = Array.from(matches.values()).includes(index);

              return (
                <button
                  key={index}
                  onClick={() => handleRightClick(index)}
                  disabled={isMatched || selectedLeft === null}
                  className={`w-full p-5 rounded-2xl text-left text-base md:text-lg transition-all duration-200 transform flex items-center gap-3 ${
                    isMatched
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white border-2 border-green-600 cursor-not-allowed shadow-playful-lg scale-105'
                      : selectedLeft !== null
                      ? 'bg-white border-2 border-gray-300 text-gray-800 hover:bg-gradient-to-br hover:from-yellow-100 hover:to-orange-100 hover:border-yellow-400 hover:scale-105 hover:shadow-md cursor-pointer'
                      : 'bg-gray-100 border-2 border-gray-200 text-gray-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {isMatched && (
                    <CheckCircle className="w-6 h-6 text-white animate-bounce-in" />
                  )}
                  <span className="flex-1 font-body">{right}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
