'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lock, Trophy, Star, Zap, Award, Crown, Heart, Target } from 'lucide-react';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgeProps {
  badge: Badge;
  onClick?: () => void;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const RARITY_CONFIG: Record<BadgeRarity, {
  gradient: string;
  glow: string;
  border: string;
}> = {
  common: {
    gradient: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-500/50',
    border: 'border-blue-300',
  },
  rare: {
    gradient: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-500/50',
    border: 'border-purple-300',
  },
  epic: {
    gradient: 'from-pink-400 to-pink-600',
    glow: 'shadow-pink-500/50',
    border: 'border-pink-300',
  },
  legendary: {
    gradient: 'from-yellow-400 via-orange-400 to-red-500',
    glow: 'shadow-yellow-500/50',
    border: 'border-yellow-300',
  },
};

const SIZE_CONFIG = {
  sm: {
    container: 'p-3',
    icon: 'text-3xl',
    title: 'text-sm',
    desc: 'text-xs',
  },
  md: {
    container: 'p-6',
    icon: 'text-5xl',
    title: 'text-lg',
    desc: 'text-sm',
  },
  lg: {
    container: 'p-8',
    icon: 'text-7xl',
    title: 'text-2xl',
    desc: 'text-base',
  },
};

export function AchievementBadge({
  badge,
  onClick,
  showProgress = false,
  size = 'md',
}: AchievementBadgeProps) {
  const config = RARITY_CONFIG[badge.rarity];
  const sizeConfig = SIZE_CONFIG[size];
  const isLocked = !badge.unlocked;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={badge.unlocked ? { scale: 1.05, y: -5 } : {}}
      whileTap={badge.unlocked ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={cn(
        'relative rounded-2xl cursor-pointer transition-all duration-300',
        'bg-gradient-to-br',
        config.gradient,
        badge.unlocked ? `shadow-xl ${config.glow}` : 'opacity-50 grayscale',
        sizeConfig.container
      )}
    >
      {/* Badge Border Glow Effect */}
      {badge.unlocked && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-2xl border-2',
            config.border,
            'opacity-0'
          )}
          animate={{
            opacity: [0, 1, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}

      {/* Badge Content */}
      <div className="relative z-10">
        {/* Badge Icon/Emoji */}
        <motion.div
          className={cn(
            'text-center mb-3',
            sizeConfig.icon
          )}
          animate={badge.unlocked ? {
            rotate: [0, 5, -5, 5, 0],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          {badge.icon}
        </motion.div>

        {/* Badge Title */}
        <h3 className={cn(
          'font-display font-bold text-white text-center mb-2',
          sizeConfig.title
        )}>
          {badge.title}
        </h3>

        {/* Badge Description */}
        <p className={cn(
          'text-white/90 text-center leading-relaxed',
          sizeConfig.desc
        )}>
          {badge.description}
        </p>

        {/* Progress Bar (if applicable) */}
        {showProgress && badge.maxProgress && (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-white/80">
              <span>{badge.progress || 0}</span>
              <span>{badge.maxProgress}</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((badge.progress || 0) / badge.maxProgress) * 100}%` }}
                transition={{ duration: 1, type: 'spring' }}
              />
            </div>
          </div>
        )}

        {/* Rarity Indicator */}
        <div className="mt-3 text-center">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white uppercase tracking-wider">
            {badge.rarity}
          </span>
        </div>
      </div>

      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl backdrop-blur-sm">
          <Lock className="w-12 h-12 text-white drop-shadow-lg" />
        </div>
      )}

      {/* Sparkle Effects for Unlocked Badges */}
      {badge.unlocked && (
        <>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${25 + i * 20}%`,
                top: `${10 + i * 15}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}

/**
 * Badge Unlock Animation Component
 * Shows a celebratory animation when a badge is unlocked
 */
interface BadgeUnlockAnimationProps {
  badge: Badge;
  onComplete?: () => void;
}

export function BadgeUnlockAnimation({ badge, onComplete }: BadgeUnlockAnimationProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onComplete}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
        className="relative"
      >
        {/* Main Badge Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl max-w-md">
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <AchievementBadge badge={badge} size="lg" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Achievement Unlocked!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tap anywhere to continue
            </p>
          </motion.div>
        </div>

        {/* Confetti particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: ['#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6', '#10B981'][i % 5],
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 400],
              y: [0, (Math.random() - 0.5) * 400],
              opacity: [1, 0],
              scale: [1, 0],
            }}
            transition={{
              duration: 2,
              ease: 'easeOut',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

/**
 * Badge Collection Grid
 */
interface BadgeCollectionProps {
  badges: Badge[];
  onBadgeClick?: (badge: Badge) => void;
}

export function BadgeCollection({ badges, onBadgeClick }: BadgeCollectionProps) {
  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
          Your Achievements
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          <span className="font-bold text-purple-600 dark:text-purple-400">
            {unlockedCount}
          </span>
          {' '}/{' '}
          <span className="font-bold">
            {badges.length}
          </span>
          {' '}unlocked
        </p>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <AchievementBadge
            key={badge.id}
            badge={badge}
            onClick={() => onBadgeClick?.(badge)}
            showProgress
          />
        ))}
      </div>
    </div>
  );
}
