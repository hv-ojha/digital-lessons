'use client';

import { FlexibleLesson, ContentBlock } from '@/types/lesson-content-v2';
import { LessonHeader } from './lesson-header';
import { useState, useCallback, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
// TODO: Install with: npm install isomorphic-dompurify
// import DOMPurify from 'isomorphic-dompurify';

interface FlexibleRendererProps {
  lesson: FlexibleLesson;
}

/**
 * Safely sanitize SVG content to prevent XSS attacks
 * TODO: Once DOMPurify is installed, uncomment the sanitization
 */
const sanitizeSVG = (svg: string): string => {
  // Basic sanitization - remove script tags and event handlers
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');

  // TODO: Replace with proper DOMPurify once installed:
  // return DOMPurify.sanitize(svg, {
  //   USE_PROFILES: { svg: true, svgFilters: true },
  //   FORBID_TAGS: ['script'],
  //   FORBID_ATTR: ['onerror', 'onload']
  // });
};

/**
 * Memoized Text Block Component
 */
const TextBlock = memo(({ block, index }: { block: ContentBlock & { type: 'text' }; index: number }) => {
  const textStyles = {
    paragraph: 'text-base md:text-lg leading-relaxed text-gray-800 font-body prose prose-slate max-w-none bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-4 rounded-xl',
    heading: 'font-display text-3xl md:text-4xl font-bold gradient-text-magic mb-4',
    subheading: 'font-display text-2xl md:text-3xl font-semibold text-purple-700 mb-3 bg-gradient-to-r from-purple-100/50 to-pink-100/50 p-3 rounded-xl',
    highlight: 'text-lg md:text-xl font-medium text-purple-900 bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-2xl border-2 border-yellow-300 prose prose-slate max-w-none shadow-md',
    quote: 'text-lg md:text-xl italic text-purple-800 border-l-4 border-purple-500 pl-6 py-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-r-xl prose prose-slate max-w-none shadow-sm',
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
    <div className="flex flex-col items-center gap-3 animate-fade-in">
      {block.svg ? (
        <div
          className="w-full max-w-md rounded-2xl shadow-playful bg-white p-4"
          dangerouslySetInnerHTML={{ __html: sanitizeSVG(block.svg) }}
        />
      ) : block.image ? (
        <div className="w-full max-w-md rounded-2xl shadow-playful overflow-hidden">
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
        <div className="w-full max-w-md h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center border-2 border-purple-300">
          <p className="text-purple-800 text-center p-6 font-body">{block.description}</p>
        </div>
      )}
      {block.caption && (
        <p className="text-sm text-gray-600 text-center font-body">{block.caption}</p>
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
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-2xl p-6 space-y-4 shadow-playful">
      <p className="text-lg font-bold text-purple-800 font-display">{block.question}</p>

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
                className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 font-body transform hover:scale-105 ${
                  showCorrect
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white border-2 border-green-600 scale-110 shadow-playful-lg'
                    : showIncorrect
                    ? 'bg-gradient-to-br from-red-400 to-red-500 text-white border-2 border-red-600 animate-wiggle'
                    : isSelected
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-2 border-purple-600 shadow-lg scale-105'
                    : 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-gray-300 text-gray-800 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 hover:border-blue-400 hover:shadow-md'
                } ${showResults ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {showResults && block.explanation && (
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-xl p-4 animate-bounce-in">
          <p className="text-sm text-blue-900 font-body font-semibold">{block.explanation}</p>
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
    <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-2xl p-6 space-y-3 shadow-playful">
      {block.title && (
        <p className="text-lg font-bold text-green-800 font-display">{block.title}</p>
      )}
      <div className="text-gray-800 font-body prose prose-slate max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {block.content}
        </ReactMarkdown>
      </div>
      {block.highlight && (
        <p className="text-sm font-medium text-green-900 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-300">
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
    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300 rounded-2xl p-6 space-y-4 shadow-playful">
      <p className="text-lg font-bold text-orange-800 font-display">🎯 Activity</p>
      <div className="text-gray-800 font-body prose prose-slate max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {block.instruction}
        </ReactMarkdown>
      </div>

      {block.steps && block.steps.length > 0 && (
        <ol className="list-decimal list-inside space-y-2 ml-2">
          {block.steps.map((step, idx) => (
            <li key={idx} className="text-gray-800 font-body">{step}</li>
          ))}
        </ol>
      )}

      {block.materials && block.materials.length > 0 && (
        <div>
          <p className="text-sm font-bold text-orange-700 mb-2 font-display">Materials needed:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {block.materials.map((item, idx) => (
              <li key={idx} className="text-sm text-gray-700 font-body">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {block.tip && (
        <p className="text-sm text-orange-700 italic font-body">Tip: {block.tip}</p>
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
    <div className="bg-gradient-to-r from-green-100 to-teal-100 border-2 border-green-300 rounded-2xl p-6 space-y-3 shadow-playful">
      <p className="text-lg font-bold text-green-800 font-display">✨ Key Takeaways</p>
      <ul className="space-y-2">
        {block.points.map((point, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="text-green-700 flex-shrink-0 text-xl">✓</span>
            <span className="text-gray-800 font-body">{point}</span>
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
    <div className="bg-gradient-to-br from-pink-100 to-purple-100 border-2 border-pink-300 rounded-2xl p-6 space-y-4 shadow-playful">
      {block.character && (
        <p className="text-sm font-bold text-pink-800 font-display">📖 {block.character}'s Story</p>
      )}
      <p className="text-base md:text-lg leading-relaxed text-gray-800 italic font-body">
        {block.narrative}
      </p>
      {block.image && (
        <div className="w-full max-w-sm rounded-2xl shadow-playful overflow-hidden mx-auto">
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
    tip: { bg: 'bg-gradient-to-r from-blue-100 to-cyan-100', border: 'border-blue-300', text: 'text-blue-800', icon: '💡' },
    warning: { bg: 'bg-gradient-to-r from-red-100 to-orange-100', border: 'border-red-300', text: 'text-red-800', icon: '⚠️' },
    'fun-fact': { bg: 'bg-gradient-to-r from-yellow-100 to-orange-100', border: 'border-yellow-300', text: 'text-yellow-800', icon: '🎉' },
    remember: { bg: 'bg-gradient-to-r from-green-100 to-emerald-100', border: 'border-green-300', text: 'text-green-800', icon: '📌' },
    'try-it': { bg: 'bg-gradient-to-r from-purple-100 to-pink-100', border: 'border-purple-300', text: 'text-purple-800', icon: '🚀' },
  };
  const style = calloutStyles[block.variant];

  return (
    <div className={`${style.bg} border-2 ${style.border} rounded-2xl p-4 space-y-2 shadow-playful`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{style.icon}</span>
        {block.title && (
          <p className={`font-bold ${style.text} font-display`}>{block.title}</p>
        )}
      </div>
      <p className="text-gray-800 font-body">{block.content}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
        />

        {/* Content Sections */}
        {lesson.sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-3xl shadow-playful-lg p-6 md:p-8 space-y-6 animate-slide-in-up border-2 border-purple-200/50" style={{ animationDelay: `${sectionIdx * 0.1}s` }}>
            {section.heading && (
              <h2 className="font-display text-3xl md:text-4xl font-bold gradient-text-magic">
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
          <div className="text-center animate-bounce-in">
            <button
              onClick={() => setShowResults(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl shadow-playful px-8 py-4 transition-all duration-200 font-bold text-lg hover:scale-105 hover:shadow-playful-lg"
            >
              Check Answers ({questionAnswers.size} / {totalQuestions})
            </button>
          </div>
        )}

        {/* Conclusion */}
        {lesson.conclusion && (
          <div className="bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-3xl shadow-playful-lg p-6 md:p-8 space-y-4 animate-bounce-in border-2 border-green-200/50">
            {lesson.conclusion.summary && (
              <div>
                <h3 className="font-display text-2xl font-bold gradient-text-success mb-3">Summary</h3>
                <p className="text-lg text-gray-800 font-body leading-relaxed">{lesson.conclusion.summary}</p>
              </div>
            )}

            {lesson.conclusion.nextSteps && lesson.conclusion.nextSteps.length > 0 && (
              <div>
                <h3 className="font-display text-2xl font-bold gradient-text-magic mb-3">What's Next?</h3>
                <ul className="space-y-2">
                  {lesson.conclusion.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-purple-600 flex-shrink-0 text-xl">→</span>
                      <span className="text-gray-800 font-body">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
