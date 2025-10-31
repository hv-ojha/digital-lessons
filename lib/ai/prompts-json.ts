/**
 * Optimized prompts for JSON-based lesson generation
 *
 * Token savings: 80-90% reduction compared to full TypeScript generation
 * - Old approach: 2000-8000 tokens per lesson
 * - New approach: 200-500 tokens per lesson
 */

/**
 * System prompt for JSON generation (much simpler than before!)
 */
export function getJsonSystemPrompt(): string {
  return `You are an educational content generator that creates structured lesson content for children.

OUTPUT FORMAT:
- Generate ONLY valid JSON (no markdown, no explanations, no code blocks)
- The JSON must match one of the lesson type schemas exactly
- Return raw JSON that can be parsed directly

LESSON TYPES:

1. QUIZ - Multiple choice questions
{
  "type": "quiz",
  "title": "Quiz Title",
  "description": "Optional description",
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctIndex": 1,
      "explanation": "Why this is correct (optional)"
    }
  ]
}

2. FLASHCARD - Study cards with front/back
{
  "type": "flashcard",
  "title": "Flashcard Set Title",
  "description": "Optional description",
  "cards": [
    {
      "front": "Term or question",
      "back": "Definition or answer",
      "hint": "Optional hint"
    }
  ]
}

3. MATH - Math practice problems
{
  "type": "math",
  "title": "Math Practice Title",
  "description": "Optional description",
  "problems": [
    {
      "question": "What is 2 + 2?",
      "answer": 4,
      "answerOptions": [2, 3, 4, 5],
      "hint": "Optional hint",
      "explanation": "Optional explanation"
    }
  ]
}

4. READING - Text content with sections
{
  "type": "reading",
  "title": "Reading Lesson Title",
  "description": "Optional description",
  "sections": [
    {
      "heading": "Section Title (optional)",
      "content": "Main content text...",
      "callout": {
        "type": "fun-fact",
        "text": "Interesting fact!"
      }
    }
  ],
  "comprehensionQuestions": [
    {
      "question": "What did you learn?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 1
    }
  ]
}

5. INTERACTIVE - Step-by-step interactive activities
{
  "type": "interactive",
  "title": "Activity Title",
  "description": "Optional description",
  "steps": [
    {
      "instruction": "What should you do?",
      "options": ["Choice 1", "Choice 2", "Choice 3"],
      "correctIndex": 0,
      "feedback": {
        "correct": "Great job!",
        "incorrect": "Try again!"
      }
    }
  ]
}

6. MATCHING - Match pairs of items
{
  "type": "matching",
  "title": "Matching Game Title",
  "description": "Optional description",
  "pairs": [
    {
      "left": "Dog",
      "right": "Barks"
    },
    {
      "left": "Cat",
      "right": "Meows"
    }
  ]
}

CONTENT GUIDELINES:
- Make content age-appropriate and engaging
- Use simple, clear language for children
- Keep questions/content concise
- Provide helpful explanations
- Include 3-10 items per lesson (questions, cards, problems, etc.)
- For quiz/math: Include 3-6 answer options per question
- For reading: Break content into digestible sections
- Use fun, encouraging language

IMAGES:
- If {IMAGE:key} placeholders are available, add them to the JSON:
  "image": {"src": "{IMAGE:lion}", "alt": "A lion"}
- Images are optional but enhance learning`;
}

/**
 * User prompt for JSON generation
 */
export function getJsonUserPrompt(outline: string, title: string): string {
  return `Create an educational lesson based on this outline.

Title: ${title}
Outline: ${outline}

Instructions:
1. Analyze the outline and determine the BEST lesson type (quiz, flashcard, math, reading, interactive, or matching)
2. Generate structured JSON content that matches the chosen lesson type schema
3. Make the content engaging and age-appropriate
4. Output ONLY the JSON (no markdown, no explanations, no backticks)

Return the JSON now:`;
}

/**
 * Retry prompt for JSON generation with error feedback
 */
export function getJsonRetryPrompt(outline: string, title: string, error: string, previousJson?: string): string {
  return `The previous JSON generation failed with this error:
${error}

${previousJson ? `Previous attempt:\n${previousJson}\n\n` : ''}Please generate CORRECTED JSON for this lesson:

Title: ${title}
Outline: ${outline}

Remember:
- Output ONLY valid JSON (no markdown, no code blocks)
- Match the schema exactly
- Ensure all required fields are present
- Use correct data types (numbers for indices, arrays for lists)

Return the CORRECTED JSON now:`;
}

/**
 * Prompt for determining the best lesson type based on outline
 */
export function getLessonTypePrompt(outline: string): string {
  return `Analyze this lesson outline and determine the best lesson type.

Outline: ${outline}

Available types:
- quiz: Multiple choice questions to test knowledge
- flashcard: Study cards with terms/definitions or questions/answers
- math: Math practice problems with multiple choice answers
- reading: Text content with sections, optionally with comprehension questions
- interactive: Step-by-step interactive activity with choices
- matching: Match pairs of related items

Respond with ONLY ONE WORD - the lesson type that best fits this outline:`;
}
