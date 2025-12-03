'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type MascotEmotion = 'happy' | 'thinking' | 'celebrating' | 'encouraging' | 'excited' | 'curious';
export type MascotCharacter = 'gajju' | 'ullu' | 'mitthu';

interface MascotProps {
  character?: MascotCharacter;
  emotion?: MascotEmotion;
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
 * GAJJU - The Friendly Elephant 🐘
 * Inspired by Lord Ganesha - remover of obstacles, god of wisdom and knowledge
 * Perfect for Indian audience - warm, wise, and adorable!
 */
function GajjuElephant({ emotion, animate }: { emotion: MascotEmotion; animate: boolean }) {
  const getEyes = () => {
    switch (emotion) {
      case 'happy':
      case 'encouraging':
        return { leftX: 30, rightX: 70, y: 35, pupilY: 37 };
      case 'excited':
      case 'celebrating':
        return { leftX: 30, rightX: 70, y: 32, pupilY: 32 }; // Wide eyes
      case 'thinking':
      case 'curious':
        return { leftX: 28, rightX: 68, y: 35, pupilY: 35 }; // Looking to side
      default:
        return { leftX: 30, rightX: 70, y: 35, pupilY: 37 };
    }
  };

  const getMouth = () => {
    switch (emotion) {
      case 'happy':
      case 'encouraging':
        return 'M 35 60 Q 50 70 65 60'; // Big smile
      case 'excited':
      case 'celebrating':
        return 'M 30 58 Q 50 75 70 58'; // Huge smile
      case 'thinking':
      case 'curious':
        return 'M 40 62 L 60 62'; // Neutral/thinking
      default:
        return 'M 35 60 Q 50 68 65 60';
    }
  };

  const eyes = getEyes();
  const mouth = getMouth();

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Head - round and friendly */}
      <motion.ellipse
        cx="50"
        cy="50"
        rx="40"
        ry="45"
        className="fill-purple-400 dark:fill-purple-500"
        animate={animate ? {
          scale: [1, 1.02, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '50% 50%' }}
      />

      {/* Big Floppy Ears - iconic elephant feature */}
      <motion.ellipse
        cx="15"
        cy="45"
        rx="12"
        ry="20"
        className="fill-purple-300 dark:fill-purple-400"
        animate={animate ? {
          rotate: [-5, 5, -5],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '15px 45px' }}
      />
      <motion.ellipse
        cx="85"
        cy="45"
        rx="12"
        ry="20"
        className="fill-purple-300 dark:fill-purple-400"
        animate={animate ? {
          rotate: [5, -5, 5],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '85px 45px' }}
      />

      {/* Inner ear pink details */}
      <ellipse cx="15" cy="45" rx="6" ry="12" className="fill-pink-300 dark:fill-pink-400" />
      <ellipse cx="85" cy="45" rx="6" ry="12" className="fill-pink-300 dark:fill-pink-400" />

      {/* Cute Trunk - curved and friendly */}
      <motion.path
        d="M 50 65 Q 48 75 50 85 Q 52 90 55 92 Q 58 90 60 85"
        className="fill-purple-400 dark:fill-purple-500 stroke-purple-500 dark:stroke-purple-600"
        strokeWidth="2"
        animate={animate ? {
          d: [
            "M 50 65 Q 48 75 50 85 Q 52 90 55 92 Q 58 90 60 85",
            "M 50 65 Q 52 75 50 85 Q 48 90 45 92 Q 42 90 40 85",
            "M 50 65 Q 48 75 50 85 Q 52 90 55 92 Q 58 90 60 85"
          ]
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Trunk tip */}
      <ellipse cx="57" cy="92" rx="4" ry="3" className="fill-pink-300 dark:fill-pink-400" />

      {/* Big Expressive Eyes - white circles */}
      <circle cx={eyes.leftX} cy={eyes.y} r="8" className="fill-white" />
      <circle cx={eyes.rightX} cy={eyes.y} r="8" className="fill-white" />

      {/* Pupils with animation */}
      <motion.g
        animate={animate ? {
          scaleY: [1, 0.1, 1],
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatDelay: 2,
        }}
        style={{ transformOrigin: `50% ${eyes.pupilY}%` }}
      >
        <circle cx={eyes.leftX} cy={eyes.pupilY} r="4" className="fill-gray-800 dark:fill-gray-900" />
        <circle cx={eyes.rightX} cy={eyes.pupilY} r="4" className="fill-gray-800 dark:fill-gray-900" />
        {/* Light reflection in eyes */}
        <circle cx={eyes.leftX - 1.5} cy={eyes.pupilY - 1.5} r="1.5" className="fill-white opacity-80" />
        <circle cx={eyes.rightX - 1.5} cy={eyes.pupilY - 1.5} r="1.5" className="fill-white opacity-80" />
      </motion.g>

      {/* Cute little tusks */}
      <path d="M 38 55 L 36 62 L 40 60 Z" className="fill-white" />
      <path d="M 62 55 L 64 62 L 60 60 Z" className="fill-white" />

      {/* Happy Mouth */}
      <path
        d={mouth}
        className="stroke-gray-700 dark:stroke-gray-800"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Rosy Cheeks */}
      {(emotion === 'happy' || emotion === 'excited' || emotion === 'celebrating') && (
        <>
          <ellipse cx="22" cy="52" rx="5" ry="4" className="fill-pink-300 opacity-60" />
          <ellipse cx="78" cy="52" rx="5" ry="4" className="fill-pink-300 opacity-60" />
        </>
      )}

      {/* Forehead decoration - like tilak/bindi (Indian touch) */}
      <circle cx="50" cy="25" r="3" className="fill-yellow-400 dark:fill-yellow-500" />
    </svg>
  );
}

/**
 * ULLU - The Wise Owl 🦉
 * Symbol of Lakshmi's vahana (vehicle) - wisdom, knowledge, prosperity
 * Nocturnal learner - studies all night!
 */
function UlluOwl({ emotion, animate }: { emotion: MascotEmotion; animate: boolean }) {
  const getEyes = () => {
    switch (emotion) {
      case 'happy':
      case 'encouraging':
        return { size: 12, pupilY: 42 };
      case 'excited':
      case 'celebrating':
        return { size: 14, pupilY: 40 }; // Wide eyes
      case 'thinking':
      case 'curious':
        return { size: 11, pupilY: 44 }; // Squinting
      default:
        return { size: 12, pupilY: 42 };
    }
  };

  const getBeak = () => {
    switch (emotion) {
      case 'happy':
      case 'encouraging':
        return 'M 45 55 L 50 60 L 55 55 L 50 58 Z'; // Open beak
      case 'excited':
      case 'celebrating':
        return 'M 43 53 L 50 62 L 57 53 L 50 58 Z'; // Very open
      default:
        return 'M 47 55 L 50 58 L 53 55 Z'; // Closed
    }
  };

  const eyes = getEyes();
  const beak = getBeak();

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Body - round and fluffy */}
      <motion.ellipse
        cx="50"
        cy="55"
        rx="35"
        ry="40"
        className="fill-amber-600 dark:fill-amber-700"
        animate={animate ? {
          scale: [1, 1.03, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '50% 55%' }}
      />

      {/* Wings */}
      <motion.ellipse
        cx="20"
        cy="60"
        rx="15"
        ry="25"
        className="fill-amber-700 dark:fill-amber-800"
        animate={animate ? {
          scaleX: [1, 0.9, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '20px 60px' }}
      />
      <motion.ellipse
        cx="80"
        cy="60"
        rx="15"
        ry="25"
        className="fill-amber-700 dark:fill-amber-800"
        animate={animate ? {
          scaleX: [1, 0.9, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '80px 60px' }}
      />

      {/* Head with ear tufts */}
      <ellipse cx="50" cy="35" rx="30" ry="28" className="fill-amber-500 dark:fill-amber-600" />

      {/* Ear Tufts - iconic owl feature */}
      <motion.path
        d="M 25 15 Q 22 20 25 25"
        className="stroke-amber-700 dark:stroke-amber-800"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        animate={animate ? {
          d: [
            "M 25 15 Q 22 20 25 25",
            "M 25 18 Q 22 20 25 25",
            "M 25 15 Q 22 20 25 25"
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
      <motion.path
        d="M 75 15 Q 78 20 75 25"
        className="stroke-amber-700 dark:stroke-amber-800"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        animate={animate ? {
          d: [
            "M 75 15 Q 78 20 75 25",
            "M 75 18 Q 78 20 75 25",
            "M 75 15 Q 78 20 75 25"
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />

      {/* Large Owl Eyes - most prominent feature */}
      <circle cx="38" cy="38" r={eyes.size} className="fill-white" />
      <circle cx="62" cy="38" r={eyes.size} className="fill-white" />

      {/* Eye circles */}
      <circle cx="38" cy="38" r={eyes.size + 2} className="fill-none stroke-amber-700 dark:stroke-amber-800" strokeWidth="2" />
      <circle cx="62" cy="38" r={eyes.size + 2} className="fill-none stroke-amber-700 dark:stroke-amber-800" strokeWidth="2" />

      {/* Pupils with blink animation */}
      <motion.g
        animate={animate ? {
          scaleY: [1, 0.1, 1],
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatDelay: 3,
        }}
        style={{ transformOrigin: '50% 38%' }}
      >
        <circle cx="38" cy={eyes.pupilY} r="5" className="fill-gray-900" />
        <circle cx="62" cy={eyes.pupilY} r="5" className="fill-gray-900" />
        {/* Sparkle in eyes */}
        <circle cx="36" cy="40" r="2" className="fill-white opacity-90" />
        <circle cx="60" cy="40" r="2" className="fill-white opacity-90" />
      </motion.g>

      {/* Beak */}
      <path
        d={beak}
        className="fill-orange-500 dark:fill-orange-600"
      />

      {/* Chest Pattern */}
      <ellipse cx="50" cy="70" rx="20" ry="18" className="fill-amber-300 dark:fill-amber-400 opacity-50" />

      {/* Feet */}
      <path d="M 40 88 L 38 95 M 42 88 L 42 95 M 44 88 L 46 95" className="stroke-orange-600 dark:stroke-orange-700" strokeWidth="2" strokeLinecap="round" />
      <path d="M 60 88 L 58 95 M 62 88 L 62 95 M 64 88 L 66 95" className="stroke-orange-600 dark:stroke-orange-700" strokeWidth="2" strokeLinecap="round" />

      {/* Wisdom Book (Indian touch - owl with knowledge) */}
      {emotion === 'thinking' && (
        <g>
          <rect x="35" y="75" width="30" height="15" rx="2" className="fill-purple-400 dark:fill-purple-500" />
          <line x1="42" y1="80" x2="58" y2="80" className="stroke-purple-600 dark:stroke-purple-700" strokeWidth="1" />
          <line x1="42" y1="85" x2="58" y2="85" className="stroke-purple-600 dark:stroke-purple-700" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
}

/**
 * MITTHU - The Cheerful Parrot 🦜
 * Talkative, colorful, friendly - perfect learning companion!
 * Parrots learn by repeating - great metaphor for learning
 */
function MitthuParrot({ emotion, animate }: { emotion: MascotEmotion; animate: boolean }) {
  const getEyes = () => {
    switch (emotion) {
      case 'happy':
      case 'encouraging':
        return { y: 32, pupilY: 34 };
      case 'excited':
      case 'celebrating':
        return { y: 30, pupilY: 30 }; // Wide eyes
      case 'thinking':
      case 'curious':
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
    <svg viewBox="0 0 100 100" className="w-full h-full">
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
      {(emotion === 'happy' || emotion === 'celebrating') && (
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
  );
}

/**
 * Main Mascot Component - Choose your learning buddy!
 */
export function NewMascot({
  character = 'gajju',
  emotion = 'happy',
  size = 'md',
  className,
  animate = true
}: MascotProps) {
  const renderMascot = () => {
    switch (character) {
      case 'gajju':
        return <GajjuElephant emotion={emotion} animate={animate} />;
      case 'ullu':
        return <UlluOwl emotion={emotion} animate={animate} />;
      case 'mitthu':
        return <MitthuParrot emotion={emotion} animate={animate} />;
      default:
        return <GajjuElephant emotion={emotion} animate={animate} />;
    }
  };

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
      {renderMascot()}

      {/* Floating hearts/sparkles for celebrating */}
      {animate && (emotion === 'celebrating' || emotion === 'excited') && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
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
              {i % 2 === 0 ? (
                <span className="text-2xl">⭐</span>
              ) : (
                <span className="text-2xl">❤️</span>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Message Bubble with new mascot
 */
interface NewMascotMessageProps {
  character?: MascotCharacter;
  emotion?: MascotEmotion;
  message: string;
  children?: React.ReactNode;
}

export function NewMascotMessage({
  character = 'gajju',
  emotion = 'happy',
  message,
  children
}: NewMascotMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-purple-200 dark:border-purple-800"
    >
      <NewMascot character={character} emotion={emotion} size="md" />
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
