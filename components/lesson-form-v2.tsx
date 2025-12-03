'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Lightbulb, ArrowRight, ArrowLeft } from 'lucide-react';
import { RendererTypeGrid, RENDERER_TYPES } from '@/components/ui/renderer-type-grid';
import { StepIndicator } from '@/components/ui/step-indicator';
import { motion, AnimatePresence } from 'framer-motion';

interface LessonFormV2Props {
  onLessonCreated: () => void;
  onSubmit?: () => void;
}

const STEPS = [
  { number: 1, label: 'Choose Format' },
  { number: 2, label: 'Describe Content' },
];

/**
 * Enhanced Lesson Form Component V2
 *
 * Features:
 * - Multi-step flow with type selection
 * - AI-first approach with manual override
 * - Context-aware examples based on selected type
 * - Smooth step transitions
 * - Improved user guidance
 */
export function LessonFormV2({ onLessonCreated, onSubmit }: LessonFormV2Props) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState('ai-decide');
  const [outline, setOutline] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get examples based on selected type
  const currentExamples = useMemo(() => {
    const type = RENDERER_TYPES.find(t => t.id === selectedType);
    return type?.examples || RENDERER_TYPES[0].examples || [];
  }, [selectedType]);

  // Get selected type info for display
  const selectedTypeInfo = useMemo(() => {
    return RENDERER_TYPES.find(t => t.id === selectedType);
  }, [selectedType]);

  // Handle type selection and auto-advance to step 2
  const handleTypeSelect = useCallback((typeId: string) => {
    setSelectedType(typeId);
  }, []);

  // Navigate to next step
  const handleNextStep = useCallback(() => {
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  }, [currentStep]);

  // Navigate to previous step
  const handlePrevStep = useCallback(() => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  }, [currentStep]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (outline.trim().length < 5) {
      setError('Please enter at least 5 characters for your lesson outline');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          outline,
          lessonType: selectedType === 'ai-decide' ? null : selectedType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create lesson');
      }

      // Close modal immediately after submission
      if (onSubmit) {
        onSubmit();
      }

      // Reset form
      setOutline('');
      setSelectedType('ai-decide');
      setCurrentStep(1);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create lesson:', error);
      }
      setError(error instanceof Error ? error.message : 'Failed to create lesson');
    } finally {
      setIsSubmitting(false);
    }
  }, [outline, selectedType, onSubmit]);

  // Handle example click
  const handleExampleClick = useCallback((example: string) => {
    setOutline(example);
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Create New Lesson
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose a format or let AI decide what works best
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicator - Centered */}
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-lg">
          <StepIndicator currentStep={currentStep} steps={STEPS} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Type Selection */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  What type of lesson would you like?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select a format, or choose "AI Decides" to let our smart system pick the best option for your topic
                </p>
              </div>

              <RendererTypeGrid
                selectedType={selectedType}
                onTypeSelect={handleTypeSelect}
              />

              {/* Next Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={handleNextStep}
                  variant="playful"
                  size="lg"
                >
                  Next: Describe Your Lesson
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Content Description */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Selected Type Display */}
              {selectedTypeInfo && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedTypeInfo.gradient} shadow-md`}>
                      {selectedTypeInfo.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Selected Format
                      </p>
                      <p className="font-bold text-gray-900 dark:text-gray-100">
                        {selectedTypeInfo.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="ml-auto text-sm text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="outline"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Lightbulb className="w-4 h-4 text-purple-500" />
                  What would you like to learn?
                </label>
                <div className="relative">
                  <textarea
                    id="outline"
                    value={outline}
                    onChange={(e) => setOutline(e.target.value)}
                    placeholder={
                      selectedType === 'ai-decide'
                        ? "Example: A comprehensive guide to the water cycle with detailed explanations and diagrams"
                        : `Example: ${currentExamples[0] || 'Describe your lesson topic here...'}`
                    }
                    className="w-full px-4 py-3 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[140px] resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    disabled={isSubmitting}
                    maxLength={500}
                    autoFocus
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded">
                    {outline.length}/500
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handlePrevStep}
                  variant="outline"
                  size="lg"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>

                <Button
                  type="submit"
                  disabled={outline.trim().length < 5 || isSubmitting}
                  variant="playful"
                  size="lg"
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Lesson...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Create Lesson
                    </>
                  )}
                </Button>
              </div>

              {/* Examples Section */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-purple-500" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Try these examples for {selectedTypeInfo?.title}:
                  </h3>
                </div>
                <div className="space-y-2">
                  {currentExamples.map((example, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleExampleClick(example)}
                      className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors group"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        {example}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 text-center">
                  Click any example to use it • Lesson will be generated in the background
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
