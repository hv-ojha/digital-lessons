'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flame, CheckCircle, Trophy } from 'lucide-react';

interface StreakTrackerProps {
  streakCount: number;
  completedDays?: number[];
  maxStreak?: number;
  className?: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function StreakTracker({
  streakCount,
  completedDays = [],
  maxStreak = 0,
  className,
}: StreakTrackerProps) {
  const getStreakMessage = (count: number) => {
    if (count === 0) return "Start your learning journey today!";
    if (count < 3) return "Great start! Keep going!";
    if (count < 7) return "You're building momentum!";
    if (count < 14) return "Incredible dedication!";
    if (count < 30) return "You're unstoppable!";
    return "Legendary learner!";
  };

  const getFlameIntensity = (count: number) => {
    if (count === 0) return 'from-gray-400 to-gray-600';
    if (count < 3) return 'from-orange-400 to-orange-600';
    if (count < 7) return 'from-orange-500 to-red-500';
    if (count < 14) return 'from-red-500 to-pink-600';
    return 'from-yellow-400 via-orange-500 to-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-6', className)}
    >
      {/* Streak Header */}
      <div className="relative bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20 rounded-3xl p-8 shadow-playful overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
        </div>

        <div className="relative z-10 flex items-center gap-6">
          {/* Animated Flame */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative"
          >
            <div className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center',
              'bg-gradient-to-br shadow-2xl',
              getFlameIntensity(streakCount)
            )}>
              <Flame className="w-12 h-12 text-white drop-shadow-lg" />
            </div>

            {/* Flame particles */}
            {streakCount > 0 && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      'absolute w-2 h-2 rounded-full',
                      'bg-yellow-400'
                    )}
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: [0, (Math.random() - 0.5) * 40],
                      y: [0, -40 - Math.random() * 20],
                      opacity: [1, 0],
                      scale: [1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>

          {/* Streak Info */}
          <div className="flex-1">
            <motion.h3
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent leading-none mb-2"
            >
              {streakCount}
              <span className="text-2xl ml-2">🔥</span>
            </motion.h3>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Day Streak!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {getStreakMessage(streakCount)}
            </p>
          </div>

          {/* Personal Best */}
          {maxStreak > streakCount && (
            <div className="hidden lg:block text-center">
              <div className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl shadow-lg">
                <Trophy className="w-6 h-6 text-white mx-auto mb-1" />
                <div className="text-xs text-white font-semibold">
                  Personal Best
                </div>
                <div className="text-2xl font-bold text-white">
                  {maxStreak}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Milestone Progress */}
        <div className="relative z-10 mt-6">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
            <span>Current</span>
            <span>Next milestone: {Math.ceil(streakCount / 7) * 7} days</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${(streakCount % 7) * (100 / 7)}%` }}
              transition={{ duration: 1, type: 'spring' }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h4 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">
          This Week
        </h4>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, index) => {
            const isCompleted = completedDays.includes(index);
            return (
              <motion.div
                key={day}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  'aspect-square rounded-xl flex flex-col items-center justify-center',
                  'font-semibold text-sm transition-all cursor-pointer',
                  isCompleted
                    ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                )}
              >
                <span className="text-xs mb-1">{day}</span>
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <div className="w-5 h-5" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Week Stats */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              This week
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {completedDays.length} / 7 days
            </span>
          </div>
        </div>
      </div>

      {/* Encouragement Messages */}
      {streakCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-4"
        >
          <p className="text-center text-sm text-gray-700 dark:text-gray-300 font-medium">
            {streakCount >= 7 ? (
              <>🎉 Amazing! You've learned for a whole week!</>
            ) : streakCount >= 3 ? (
              <>⭐ Keep it up! You're doing great!</>
            ) : (
              <>🌟 Great start! Come back tomorrow!</>
            )}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Compact Streak Display - For headers/navigation
 */
interface CompactStreakProps {
  streakCount: number;
  className?: string;
}

export function CompactStreak({ streakCount, className }: CompactStreakProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full',
        'bg-gradient-to-r from-orange-400 to-red-500 text-white',
        'font-semibold shadow-lg cursor-pointer',
        className
      )}
    >
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      >
        <Flame className="w-5 h-5" />
      </motion.div>
      <span className="text-lg font-bold">{streakCount}</span>
      <span className="text-sm opacity-90 hidden sm:inline">day streak</span>
    </motion.div>
  );
}
