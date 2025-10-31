'use client';

import { FlexibleLesson, ContentBlock } from '@/types/lesson-content-v2';
import { LessonHeader } from './lesson-header';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FlexibleRendererProps {
  lesson: FlexibleLesson;
}

export function FlexibleRenderer({ lesson }: FlexibleRendererProps) {
  const [questionAnswers, setQuestionAnswers] = useState<Map<number, number>>(new Map());
  const [showResults, setShowResults] = useState(false);

  const handleQuestionAnswer = (blockIndex: number, optionIndex: number) => {
    const newAnswers = new Map(questionAnswers);
    newAnswers.set(blockIndex, optionIndex);
    setQuestionAnswers(newAnswers);
  };

  const renderBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'text':
        const textStyles = {
          paragraph: 'text-base md:text-lg leading-relaxed text-foreground prose prose-slate dark:prose-invert max-w-none',
          heading: 'text-3xl md:text-4xl font-bold text-foreground mb-4',
          subheading: 'text-2xl md:text-3xl font-semibold text-foreground mb-3',
          highlight: 'text-lg md:text-xl font-medium text-accent bg-accent/10 p-4 rounded-lg prose prose-slate dark:prose-invert max-w-none',
          quote: 'text-lg md:text-xl italic text-muted-foreground border-l-4 border-accent pl-6 py-2 prose prose-slate dark:prose-invert max-w-none',
        };
        return (
          <div key={index} className={textStyles[block.style || 'paragraph']}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {block.content}
            </ReactMarkdown>
          </div>
        );

      case 'visual':
        return (
          <div key={index} className="flex flex-col items-center gap-3">
            {block.image ? (
              <img
                src={block.image.src}
                alt={block.image.alt}
                className="w-full max-w-md rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full max-w-md h-64 bg-accent/10 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground text-center p-6">{block.description}</p>
              </div>
            )}
            {block.caption && (
              <p className="text-sm text-muted-foreground text-center">{block.caption}</p>
            )}
          </div>
        );

      case 'question':
        const userAnswer = questionAnswers.get(index);
        const isCorrect = block.correctIndex !== undefined && userAnswer === block.correctIndex;

        return (
          <div key={index} className="bg-card border border-border/50 rounded-xl p-6 space-y-4">
            <p className="text-lg font-semibold text-foreground">{block.question}</p>

            {block.options && (
              <div className="space-y-2">
                {block.options.map((option, optIdx) => {
                  const isSelected = userAnswer === optIdx;
                  const showCorrect = showResults && optIdx === block.correctIndex;
                  const showIncorrect = showResults && isSelected && !isCorrect;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleQuestionAnswer(index, optIdx)}
                      disabled={showResults}
                      className={`w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        showCorrect
                          ? 'bg-success/20 border-2 border-success text-success'
                          : showIncorrect
                          ? 'bg-destructive/20 border-2 border-destructive text-destructive'
                          : isSelected
                          ? 'bg-accent/20 border-2 border-accent'
                          : 'bg-card border-2 border-border hover:border-accent/50'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {showResults && block.explanation && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <p className="text-sm text-foreground">{block.explanation}</p>
              </div>
            )}
          </div>
        );

      case 'example':
        return (
          <div key={index} className="bg-accent/5 border border-accent/20 rounded-xl p-6 space-y-3">
            {block.title && (
              <p className="text-lg font-semibold text-accent">{block.title}</p>
            )}
            <div className="text-foreground prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {block.content}
              </ReactMarkdown>
            </div>
            {block.highlight && (
              <p className="text-sm font-medium text-accent bg-accent/10 p-3 rounded-lg">
                💡 {block.highlight}
              </p>
            )}
          </div>
        );

      case 'activity':
        return (
          <div key={index} className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-4">
            <p className="text-lg font-semibold text-primary">🎯 Activity</p>
            <div className="text-foreground prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {block.instruction}
              </ReactMarkdown>
            </div>

            {block.steps && block.steps.length > 0 && (
              <ol className="list-decimal list-inside space-y-2 ml-2">
                {block.steps.map((step, idx) => (
                  <li key={idx} className="text-foreground">{step}</li>
                ))}
              </ol>
            )}

            {block.materials && block.materials.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Materials needed:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  {block.materials.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {block.tip && (
              <p className="text-sm text-primary/80 italic">Tip: {block.tip}</p>
            )}
          </div>
        );

      case 'takeaway':
        return (
          <div key={index} className="bg-success/5 border border-success/20 rounded-xl p-6 space-y-3">
            <p className="text-lg font-semibold text-success">✨ Key Takeaways</p>
            <ul className="space-y-2">
              {block.points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-success flex-shrink-0">✓</span>
                  <span className="text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'story':
        return (
          <div key={index} className="bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20 rounded-xl p-6 space-y-4">
            {block.character && (
              <p className="text-sm font-medium text-accent">📖 {block.character}'s Story</p>
            )}
            <p className="text-base md:text-lg leading-relaxed text-foreground italic">
              {block.narrative}
            </p>
            {block.image && (
              <img
                src={block.image.src}
                alt={block.image.alt}
                className="w-full max-w-sm rounded-lg shadow-md mx-auto"
              />
            )}
          </div>
        );

      case 'callout':
        const calloutStyles = {
          tip: { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', icon: '💡' },
          warning: { bg: 'bg-warning/10', border: 'border-warning/30', text: 'text-warning', icon: '⚠️' },
          'fun-fact': { bg: 'bg-accent/10', border: 'border-accent/30', text: 'text-accent', icon: '🎉' },
          remember: { bg: 'bg-success/10', border: 'border-success/30', text: 'text-success', icon: '📌' },
          'try-it': { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', icon: '🚀' },
        };
        const style = calloutStyles[block.variant];

        return (
          <div key={index} className={`${style.bg} border ${style.border} rounded-xl p-4 space-y-2`}>
            <div className="flex items-center gap-2">
              <span>{style.icon}</span>
              {block.title && (
                <p className={`font-semibold ${style.text}`}>{block.title}</p>
              )}
            </div>
            <p className="text-foreground">{block.content}</p>
          </div>
        );

      default:
        return null;
    }
  };

  // Count total questions
  const totalQuestions = lesson.sections.reduce((count, section) =>
    count + section.blocks.filter(b => b.type === 'question' && b.options).length, 0
  );

  const canShowResults = questionAnswers.size > 0;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
        />

        {/* Content Sections */}
        {lesson.sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
            {section.heading && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md px-8 py-4 transition-all duration-200 font-semibold text-lg"
            >
              Check Answers ({questionAnswers.size} / {totalQuestions})
            </button>
          </div>
        )}

        {/* Conclusion */}
        {lesson.conclusion && (
          <div className="bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-8 space-y-4">
            {lesson.conclusion.summary && (
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Summary</h3>
                <p className="text-lg text-foreground">{lesson.conclusion.summary}</p>
              </div>
            )}

            {lesson.conclusion.nextSteps && lesson.conclusion.nextSteps.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-3">What's Next?</h3>
                <ul className="space-y-2">
                  {lesson.conclusion.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-accent flex-shrink-0">→</span>
                      <span className="text-foreground">{step}</span>
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
