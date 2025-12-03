'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

/**
 * Step Progress Indicator
 *
 * UX Features:
 * - Clear visual progress through multi-step flow
 * - Animated transitions between steps
 * - Completed steps show checkmark
 * - Current step is highlighted
 * - Responsive design
 */
export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-center gap-8">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted || isCurrent
                      ? 'rgb(168, 85, 247)'
                      : 'rgb(229, 231, 235)',
                  }}
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center
                    shadow-md transition-colors duration-300
                    ${
                      isCompleted || isCurrent
                        ? 'text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="w-5 h-5" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <span className="font-bold text-sm">{step.number}</span>
                  )}

                  {/* Current step pulse ring */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-purple-400"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </motion.div>

                {/* Step Label */}
                <span
                  className={`
                    mt-2 text-xs font-medium text-center whitespace-nowrap
                    ${
                      isCurrent
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className="w-56 h-0.5 -mt-6">
                  <motion.div
                    className="h-full rounded-full"
                    initial={false}
                    animate={{
                      backgroundColor: isCompleted
                        ? 'rgb(168, 85, 247)'
                        : 'rgb(229, 231, 235)',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
