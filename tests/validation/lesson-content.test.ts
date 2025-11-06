/**
 * Tests for Lesson Content Validation
 */

import { describe, it, expect } from 'vitest';
import { validateFlexibleLesson } from '@/types/lesson-content-v2';

describe('Lesson Content Validation', () => {
  describe('validateFlexibleLesson', () => {
    it('should validate a valid flexible lesson', () => {
      const lesson = {
        type: 'flexible',
        title: 'Test Lesson',
        description: 'A test lesson',
        format: 'explanation',
        sections: [
          {
            heading: 'Introduction',
            blocks: [
              {
                type: 'text',
                content: 'This is a test',
                style: 'paragraph',
              },
            ],
          },
        ],
      };

      const result = validateFlexibleLesson(lesson);

      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.type).toBe('flexible');
    });

    it('should reject lesson with missing required fields', () => {
      const lesson = {
        type: 'flexible',
        // Missing title
        format: 'explanation',
        sections: [],
      };

      const result = validateFlexibleLesson(lesson);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate text block with different styles', () => {
      const styles = ['paragraph', 'heading', 'subheading', 'highlight', 'quote'];

      for (const style of styles) {
        const lesson = {
          type: 'flexible',
          title: 'Test',
          format: 'explanation',
          sections: [
            {
              blocks: [
                {
                  type: 'text',
                  content: 'Content',
                  style,
                },
              ],
            },
          ],
        };

        const result = validateFlexibleLesson(lesson);
        expect(result.isValid).toBe(true);
      }
    });

    it('should validate visual block with SVG', () => {
      const lesson = {
        type: 'flexible',
        title: 'Test',
        format: 'explanation',
        sections: [
          {
            blocks: [
              {
                type: 'visual',
                svg: '<svg></svg>',
                description: 'Test SVG',
                caption: 'A test image',
              },
            ],
          },
        ],
      };

      const result = validateFlexibleLesson(lesson);

      expect(result.isValid).toBe(true);
      expect(result.data?.sections[0].blocks[0].type).toBe('visual');
    });

    it('should validate question block with options', () => {
      const lesson = {
        type: 'flexible',
        title: 'Test',
        format: 'assessment',
        sections: [
          {
            blocks: [
              {
                type: 'question',
                question: 'What is 2+2?',
                options: ['3', '4', '5'],
                correctIndex: 1,
                explanation: 'Two plus two equals four',
              },
            ],
          },
        ],
      };

      const result = validateFlexibleLesson(lesson);

      expect(result.isValid).toBe(true);
    });

    it('should validate callout block with variants', () => {
      const variants = ['tip', 'warning', 'fun-fact', 'remember', 'try-it'];

      for (const variant of variants) {
        const lesson = {
          type: 'flexible',
          title: 'Test',
          format: 'explanation',
          sections: [
            {
              blocks: [
                {
                  type: 'callout',
                  variant,
                  content: 'Test content',
                },
              ],
            },
          ],
        };

        const result = validateFlexibleLesson(lesson);
        expect(result.isValid).toBe(true);
      }
    });

    it('should validate lesson with conclusion', () => {
      const lesson = {
        type: 'flexible',
        title: 'Test',
        format: 'tutorial',
        sections: [
          {
            blocks: [
              {
                type: 'text',
                content: 'Content',
              },
            ],
          },
        ],
        conclusion: {
          summary: 'Summary text',
          nextSteps: ['Step 1', 'Step 2'],
        },
      };

      const result = validateFlexibleLesson(lesson);

      expect(result.isValid).toBe(true);
      expect(result.data?.conclusion).toBeDefined();
    });

    it('should reject invalid block type', () => {
      const lesson = {
        type: 'flexible',
        title: 'Test',
        format: 'explanation',
        sections: [
          {
            blocks: [
              {
                type: 'invalid',
                content: 'Content',
              },
            ],
          },
        ],
      };

      const result = validateFlexibleLesson(lesson);

      expect(result.isValid).toBe(false);
    });
  });
});
