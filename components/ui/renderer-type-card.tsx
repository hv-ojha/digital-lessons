'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ReactNode } from 'react';

interface RendererTypeCardProps {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  gradient: string;
  isSelected: boolean;
  isRecommended?: boolean;
  onClick: () => void;
}

/**
 * Individual Renderer Type Selection Card
 *
 * UX Features:
 * - Visual hierarchy with icon and description
 * - Clear selected state with checkmark
 * - Hover animations for interactivity
 * - Recommended badge for AI option
 * - Accessible with keyboard navigation
 */
export function RendererTypeCard({
  id,
  title,
  description,
  icon,
  gradient,
  isSelected,
  isRecommended = false,
  onClick,
}: RendererTypeCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-6 rounded-2xl border-2 transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
        ${
          isSelected
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md'
        }
      `}
      aria-pressed={isSelected}
      aria-label={`${title} - ${description}${isRecommended ? ' (Recommended)' : ''}`}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
        >
          Recommended
        </motion.div>
      )}

      {/* Selected Checkmark */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-md"
        >
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </motion.div>
      )}

      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center ${gradient} shadow-md`}
        >
          {icon}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </motion.button>
  );
}
