'use client';

import { FlexibleLesson, ContentBlock } from '@/types/lesson-content-v2';
import { LessonHeader } from './lesson-header';
import { useState, useCallback, memo } from 'react';
import { SimpleEducationalBackground } from '@/components/ui/educational-background';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

interface FlexibleRendererProps {
  lesson: FlexibleLesson;
}

/**
 * Safely sanitize SVG content to prevent XSS attacks
 * Simple regex-based sanitization for client-side rendering
 */
const sanitizeSVG = (svg: string): string => {
  // Remove script tags and event handlers
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
};

/**
 * Memoized Text Block Component
 */
const TextBlock = memo(({ block, index }: { block: ContentBlock & { type: 'text' }; index: number }) => {
  const textStyles = {
    paragraph: 'text-base md:text-lg leading-relaxed text-gray-800 dark:text-gray-300 prose prose-slate max-w-none bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700',
    heading: 'text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4',
    subheading: 'text-2xl md:text-3xl font-semibold text-purple-700 dark:text-purple-400 mb-3 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-200 dark:border-purple-800',
    highlight: 'text-lg md:text-xl font-medium text-yellow-900 dark:text-yellow-100 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border-2 border-yellow-300 dark:border-yellow-700 prose prose-slate max-w-none shadow-md',
    quote: 'text-lg md:text-xl italic text-purple-800 dark:text-purple-300 border-l-4 border-purple-500 dark:border-purple-400 pl-6 py-4 bg-purple-50 dark:bg-purple-900/20 rounded-r-xl prose prose-slate max-w-none',
  };

  return (
    <div className={textStyles[block.style || 'paragraph']}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {block.content}
      </ReactMarkdown>
    </div>
  );
});
TextBlock.displayName = 'TextBlock';

/**
 * Memoized Visual Block Component
 */
const VisualBlock = memo(({ block, index }: { block: ContentBlock & { type: 'visual' }; index: number }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      {block.svg ? (
        <div
          className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          dangerouslySetInnerHTML={{ __html: sanitizeSVG(block.svg) }}
        />
      ) : block.image ? (
        <div className="w-full max-w-md rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
          <Image
            src={block.image.src}
            alt={block.image.alt}
            width={500}
            height={400}
            className="w-full h-auto"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full max-w-md h-64 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center border-2 border-purple-300 dark:border-purple-700">
          <p className="text-purple-800 dark:text-purple-300 text-center p-6">{block.description}</p>
        </div>
      )}
      {block.caption && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{block.caption}</p>
      )}
    </div>
  );
});
VisualBlock.displayName = 'VisualBlock';

/**
 * Memoized Question Block Component
 */
interface QuestionBlockProps {
  block: ContentBlock & { type: 'question' };
  index: number;
  userAnswer: number | undefined;
  showResults: boolean;
  onAnswer: (blockIndex: number, optionIndex: number) => void;
}

const QuestionBlock = memo(({ block, index, userAnswer, showResults, onAnswer }: QuestionBlockProps) => {
  const isCorrect = block.correctIndex !== undefined && userAnswer === block.correctIndex;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl p-6 space-y-4 shadow-sm">
      <p className="text-lg font-bold text-purple-800 dark:text-purple-300">{block.question}</p>

      {block.options && (
        <div className="space-y-3">
          {block.options.map((option, optIdx) => {
            const isSelected = userAnswer === optIdx;
            const showCorrect = showResults && optIdx === block.correctIndex;
            const showIncorrect = showResults && isSelected && !isCorrect;

            return (
              <button
                key={optIdx}
                onClick={() => onAnswer(index, optIdx)}
                disabled={showResults}
                className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 transform hover:scale-105 ${
                  showCorrect
                    ? 'bg-green-500 dark:bg-green-600 text-white border-2 border-green-600 dark:border-green-500 scale-105 shadow-md'
                    : showIncorrect
                    ? 'bg-red-500 dark:bg-red-600 text-white border-2 border-red-600 dark:border-red-500'
                    : isSelected
                    ? 'bg-purple-500 dark:bg-purple-600 text-white border-2 border-purple-600 dark:border-purple-500 shadow-md scale-105'
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm'
                } ${showResults ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {showResults && block.explanation && (
        <div className="bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-4">
          <p className="text-sm text-blue-900 dark:text-blue-200 font-semibold">{block.explanation}</p>
        </div>
      )}
    </div>
  );
});
QuestionBlock.displayName = 'QuestionBlock';

/**
 * Memoized Example Block Component
 */
const ExampleBlock = memo(({ block, index }: { block: ContentBlock & { type: 'example' }; index: number }) => {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl p-6 space-y-3 shadow-sm">
      {block.title && (
        <p className="text-lg font-bold text-green-800 dark:text-green-300">{block.title}</p>
      )}
      <div className="text-gray-800 dark:text-gray-300 prose prose-slate max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {block.content}
        </ReactMarkdown>
      </div>
      {block.highlight && (
        <p className="text-sm font-medium text-green-900 dark:text-green-200 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg border border-green-300 dark:border-green-700">
          💡 {block.highlight}
        </p>
      )}
    </div>
  );
});
ExampleBlock.displayName = 'ExampleBlock';

/**
 * Memoized Activity Block Component
 */
const ActivityBlock = memo(({ block, index }: { block: ContentBlock & { type: 'activity' }; index: number }) => {
  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-2xl p-6 space-y-4 shadow-sm">
      <p className="text-lg font-bold text-orange-800 dark:text-orange-300">🎯 Activity</p>
      <div className="text-gray-800 dark:text-gray-300 prose prose-slate max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {block.instruction}
        </ReactMarkdown>
      </div>

      {block.steps && block.steps.length > 0 && (
        <ol className="list-decimal list-inside space-y-2 ml-2">
          {block.steps.map((step, idx) => (
            <li key={idx} className="text-gray-800 dark:text-gray-300">{step}</li>
          ))}
        </ol>
      )}

      {block.materials && block.materials.length > 0 && (
        <div>
          <p className="text-sm font-bold text-orange-700 dark:text-orange-300 mb-2">Materials needed:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {block.materials.map((item, idx) => (
              <li key={idx} className="text-sm text-gray-700 dark:text-gray-400">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {block.tip && (
        <p className="text-sm text-orange-700 dark:text-orange-300 italic">Tip: {block.tip}</p>
      )}
    </div>
  );
});
ActivityBlock.displayName = 'ActivityBlock';

/**
 * Memoized Takeaway Block Component
 */
const TakeawayBlock = memo(({ block, index }: { block: ContentBlock & { type: 'takeaway' }; index: number }) => {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl p-6 space-y-3 shadow-sm">
      <p className="text-lg font-bold text-green-800 dark:text-green-300">✨ Key Takeaways</p>
      <ul className="space-y-2">
        {block.points.map((point, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="text-green-700 dark:text-green-400 flex-shrink-0 text-xl">✓</span>
            <span className="text-gray-800 dark:text-gray-300">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});
TakeawayBlock.displayName = 'TakeawayBlock';

/**
 * Memoized Story Block Component
 */
const StoryBlock = memo(({ block, index }: { block: ContentBlock & { type: 'story' }; index: number }) => {
  return (
    <div className="bg-pink-50 dark:bg-pink-900/20 border-2 border-pink-300 dark:border-pink-700 rounded-2xl p-6 space-y-4 shadow-sm">
      {block.character && (
        <p className="text-sm font-bold text-pink-800 dark:text-pink-300">📖 {block.character}'s Story</p>
      )}
      <p className="text-base md:text-lg leading-relaxed text-gray-800 dark:text-gray-300 italic">
        {block.narrative}
      </p>
      {block.image && (
        <div className="w-full max-w-sm rounded-2xl overflow-hidden mx-auto border border-gray-200 dark:border-gray-700 shadow-sm">
          <Image
            src={block.image.src}
            alt={block.image.alt}
            width={400}
            height={300}
            className="w-full h-auto"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
});
StoryBlock.displayName = 'StoryBlock';

/**
 * Memoized Callout Block Component
 */
const CalloutBlock = memo(({ block, index }: { block: ContentBlock & { type: 'callout' }; index: number }) => {
  const calloutStyles = {
    tip: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-800 dark:text-blue-300', icon: '💡' },
    warning: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-300 dark:border-red-700', text: 'text-red-800 dark:text-red-300', icon: '⚠️' },
    'fun-fact': { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-300 dark:border-yellow-700', text: 'text-yellow-800 dark:text-yellow-300', icon: '🎉' },
    remember: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-300 dark:border-green-700', text: 'text-green-800 dark:text-green-300', icon: '📌' },
    'try-it': { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-800 dark:text-purple-300', icon: '🚀' },
  };
  const style = calloutStyles[block.variant];

  return (
    <div className={`${style.bg} border-2 ${style.border} rounded-2xl p-4 space-y-2 shadow-sm`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{style.icon}</span>
        {block.title && (
          <p className={`font-bold ${style.text}`}>{block.title}</p>
        )}
      </div>
      <p className="text-gray-800 dark:text-gray-300">{block.content}</p>
    </div>
  );
});
CalloutBlock.displayName = 'CalloutBlock';

export function FlexibleRenderer({ lesson }: FlexibleRendererProps) {
  const [questionAnswers, setQuestionAnswers] = useState<Map<number, number>>(new Map());
  const [showResults, setShowResults] = useState(false);

  // Memoized callback to prevent re-creating on every render
  const handleQuestionAnswer = useCallback((blockIndex: number, optionIndex: number) => {
    setQuestionAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(blockIndex, optionIndex);
      return newAnswers;
    });
  }, []);

  // Memoized render function that returns the appropriate memoized component
  const renderBlock = useCallback((block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'text':
        return <TextBlock key={index} block={block} index={index} />;

      case 'visual':
        return <VisualBlock key={index} block={block} index={index} />;

      case 'question':
        return (
          <QuestionBlock
            key={index}
            block={block}
            index={index}
            userAnswer={questionAnswers.get(index)}
            showResults={showResults}
            onAnswer={handleQuestionAnswer}
          />
        );

      case 'example':
        return <ExampleBlock key={index} block={block} index={index} />;

      case 'activity':
        return <ActivityBlock key={index} block={block} index={index} />;

      case 'takeaway':
        return <TakeawayBlock key={index} block={block} index={index} />;

      case 'story':
        return <StoryBlock key={index} block={block} index={index} />;

      case 'callout':
        return <CalloutBlock key={index} block={block} index={index} />;

      default:
        return null;
    }
  }, [questionAnswers, showResults, handleQuestionAnswer]);

  // Count total questions
  const totalQuestions = lesson.sections.reduce((count, section) =>
    count + section.blocks.filter(b => b.type === 'question' && b.options).length, 0
  );

  const canShowResults = questionAnswers.size > 0;

  return (
    <>
      <SimpleEducationalBackground />
      <div className="min-h-screen relative py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
        />

        {/* Content Sections */}
        {lesson.sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 md:p-8 space-y-6 border border-gray-200 dark:border-gray-700">
            {section.heading && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                {section.heading}
              </h2>
            )}

            <div className="space-y-6">
              {section.blocks.map((block, blockIdx) =>
                renderBlock(block, sectionIdx * 1000 + blockIdx)
              )}
            </div>
          </div>
        ))}

        {/* Show Results Button */}
        {totalQuestions > 0 && !showResults && canShowResults && (
          <div className="text-center">
            <button
              onClick={() => setShowResults(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl shadow-md px-8 py-4 transition-all duration-200 font-bold text-lg hover:scale-105 hover:shadow-lg"
            >
              Check Answers ({questionAnswers.size} / {totalQuestions})
            </button>
          </div>
        )}

        {/* Conclusion */}
        {lesson.conclusion && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-3xl shadow-sm p-6 md:p-8 space-y-4 border border-green-200 dark:border-green-700">
            {lesson.conclusion.summary && (
              <div>
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-3">Summary</h3>
                <p className="text-lg text-gray-800 dark:text-gray-300 leading-relaxed">{lesson.conclusion.summary}</p>
              </div>
            )}

            {lesson.conclusion.nextSteps && lesson.conclusion.nextSteps.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-300 mb-3">What's Next?</h3>
                <ul className="space-y-2">
                  {lesson.conclusion.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-purple-600 dark:text-purple-400 flex-shrink-0 text-xl">→</span>
                      <span className="text-gray-800 dark:text-gray-300">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
}
