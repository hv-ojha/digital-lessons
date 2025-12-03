'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type SparkyEmotion = 'happy' | 'thinking' | 'celebrating' | 'encouraging' | 'excited';

interface SparkyMascotProps {
  emotion?: SparkyEmotion;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

const SIZE_MAP = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-40 h-40',
  xl: 'w-56 h-56',
};

/**
 * Mitthu - The Cheerful Parrot - Your friendly AI learning companion!
 *
 * This mascot provides emotional feedback and encouragement throughout
 * the learning journey. Perfect for engaging kids and making learning fun!
 */
export function SparkyMascot({
  emotion = 'happy',
  size = 'md',
  className,
  animate = true
}: SparkyMascotProps) {
  const getEyes = () => {
    switch (emotion) {
      case 'happy':
      case 'encouraging':
        return { y: 32, pupilY: 34 };
      case 'excited':
      case 'celebrating':
        return { y: 30, pupilY: 30 }; // Wide eyes
      case 'thinking':
        return { y: 33, pupilY: 36 }; // Looking up
      default:
        return { y: 32, pupilY: 34 };
    }
  };

  const getBeak = () => {
    switch (emotion) {
      case 'happy':
      case 'encouraging':
        return { upper: 'M 50 40 Q 62 38 65 45', lower: 'M 50 40 Q 62 42 65 45', open: true };
      case 'excited':
      case 'celebrating':
        return { upper: 'M 50 40 Q 64 36 68 45', lower: 'M 50 40 Q 64 45 68 50', open: true };
      default:
        return { upper: 'M 50 40 Q 60 38 63 43', lower: 'M 50 40 Q 60 42 63 43', open: false };
    }
  };

  const eyes = getEyes();
  const beak = getBeak();

  return (
    <motion.div
      className={cn(SIZE_MAP[size], 'relative', className)}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        {/* Body - colorful and round */}
        <motion.ellipse
          cx="50"
          cy="60"
          rx="32"
          ry="35"
          className="fill-green-400 dark:fill-green-500"
          animate={animate ? {
            scale: [1, 1.05, 1],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '50% 60%' }}
        />

        {/* Wings with bright colors */}
        <motion.ellipse
          cx="25"
          cy="65"
          rx="18"
          ry="28"
          className="fill-teal-400 dark:fill-teal-500"
          animate={animate ? {
            rotate: [0, -10, 0],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '25px 65px' }}
        />
        <motion.ellipse
          cx="75"
          cy="65"
          rx="18"
          ry="28"
          className="fill-teal-400 dark:fill-teal-500"
          animate={animate ? {
            rotate: [0, 10, 0],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '75px 65px' }}
        />

        {/* Wing details - feathers */}
        <ellipse cx="25" cy="65" rx="8" ry="15" className="fill-blue-400 dark:fill-blue-500 opacity-70" />
        <ellipse cx="75" cy="65" rx="8" ry="15" className="fill-blue-400 dark:fill-blue-500 opacity-70" />

        {/* Tail - long and colorful */}
        <motion.path
          d="M 50 90 Q 45 98 40 105 M 50 90 Q 50 100 50 108 M 50 90 Q 55 98 60 105"
          className="stroke-blue-500 dark:stroke-blue-600"
          strokeWidth="4"
          strokeLinecap="round"
          animate={animate ? {
            d: [
              "M 50 90 Q 45 98 40 105 M 50 90 Q 50 100 50 108 M 50 90 Q 55 98 60 105",
              "M 50 90 Q 43 98 38 105 M 50 90 Q 48 100 48 108 M 50 90 Q 57 98 62 105",
              "M 50 90 Q 45 98 40 105 M 50 90 Q 50 100 50 108 M 50 90 Q 55 98 60 105"
            ]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />

        {/* Head - round and friendly */}
        <ellipse cx="50" cy="35" rx="28" ry="30" className="fill-green-300 dark:fill-green-400" />

        {/* Cute head crest/feathers */}
        <motion.g
          animate={animate ? {
            rotate: [-3, 3, -3],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          style={{ transformOrigin: '50px 20px' }}
        >
          <ellipse cx="45" cy="15" rx="4" ry="10" className="fill-red-400 dark:fill-red-500" />
          <ellipse cx="50" cy="12" rx="4" ry="12" className="fill-yellow-400 dark:fill-yellow-500" />
          <ellipse cx="55" cy="15" rx="4" ry="10" className="fill-orange-400 dark:fill-orange-500" />
        </motion.g>

        {/* Eyes with white circles */}
        <circle cx="40" cy={eyes.y} r="7" className="fill-white" />
        <circle cx="60" cy={eyes.y} r="7" className="fill-white" />

        {/* Pupils with blink */}
        <motion.g
          animate={animate ? {
            scaleY: [1, 0.1, 1],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
          style={{ transformOrigin: `50% ${eyes.pupilY}%` }}
        >
          <circle cx="40" cy={eyes.pupilY} r="3.5" className="fill-gray-900" />
          <circle cx="60" cy={eyes.pupilY} r="3.5" className="fill-gray-900" />
          {/* Sparkle */}
          <circle cx="38" cy="32" r="1.5" className="fill-white" />
          <circle cx="58" cy="32" r="1.5" className="fill-white" />
        </motion.g>

        {/* Curved Beak - iconic parrot feature */}
        <path
          d={beak.upper}
          className="fill-orange-400 dark:fill-orange-500"
          strokeWidth="1"
          stroke="currentColor"
        />
        {beak.open && (
          <path
            d={beak.lower}
            className="fill-yellow-500 dark:fill-yellow-600"
          />
        )}

        {/* Rosy cheeks */}
        {(emotion === 'happy' || emotion === 'celebrating' || emotion === 'excited') && (
          <>
            <ellipse cx="28" cy="42" rx="4" ry="3" className="fill-pink-400 opacity-60" />
            <ellipse cx="72" cy="42" rx="4" ry="3" className="fill-pink-400 opacity-60" />
          </>
        )}

        {/* Belly patch - lighter color */}
        <ellipse cx="50" cy="70" rx="18" ry="20" className="fill-yellow-200 dark:fill-yellow-300 opacity-50" />

        {/* Cute little feet */}
        <path d="M 45 90 L 43 96 M 47 90 L 47 96" className="stroke-orange-500 dark:stroke-orange-600" strokeWidth="2" strokeLinecap="round" />
        <path d="M 55 90 L 53 96 M 57 90 L 57 96" className="stroke-orange-500 dark:stroke-orange-600" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Floating intelligent emojis for celebrating */}
      {animate && (emotion === 'celebrating' || emotion === 'excited') && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => {
            // Intelligent emojis that make Sparky look smart
            const intelligentEmojis = ['💡', '🧠', '📚', '✨', '🎓', '💭'];
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${10 + (i % 2) * 20}%`,
                }}
                animate={{
                  y: [-10, -40],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0.8, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <span className="text-2xl">{intelligentEmojis[i]}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Mitthu Message Bubble - For showing tips and encouragement
 */
interface SparkyMessageProps {
  emotion?: SparkyEmotion;
  message: string;
  children?: React.ReactNode;
}

export function SparkyMessage({ emotion = 'happy', message, children }: SparkyMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-purple-200 dark:border-purple-800"
    >
      <SparkyMascot emotion={emotion} size="md" />
      <div className="flex-1">
        <div className="inline-block px-5 py-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl rounded-tl-none border border-purple-200 dark:border-purple-800">
          <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
            {message}
          </p>
        </div>
        {children && (
          <div className="mt-3">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}
