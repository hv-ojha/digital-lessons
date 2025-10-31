/**
 * Creative & Flexible Prompts for Diverse Educational Content
 *
 * Supports:
 * - Explanations & tutorials
 * - Interactive stories
 * - Visual learning
 * - Experiments & activities
 * - Quizzes & assessments
 * - Mixed-format lessons
 *
 * Token-optimized: ~100-150 tokens per prompt
 */

/**
 * Detect the best format based on user's outline
 */
export function detectContentFormat(outline: string): string {
  const lower = outline.toLowerCase();

  // Quiz/Assessment indicators
  if (lower.match(/\b(quiz|test|question|assess|check|exam)\b/)) {
    return 'quiz';
  }

  // Math practice indicators
  if (lower.match(/\b(math|calculation|solve|multiply|add|subtract|divide)\b/)) {
    return 'math';
  }

  // Flashcard indicators
  if (lower.match(/\b(flashcard|memorize|remember|vocab|terms)\b/)) {
    return 'flashcard';
  }

  // Tutorial/How-to indicators
  if (lower.match(/\b(how to|tutorial|step|guide|learn how|teach me)\b/)) {
    return 'tutorial';
  }

  // Story/Narrative indicators
  if (lower.match(/\b(story|tell|narrative|adventure|journey|character)\b/)) {
    return 'story';
  }

  // Activity/Experiment indicators
  if (lower.match(/\b(activity|experiment|try|practice|do|make|create|build)\b/)) {
    return 'interactive';
  }

  // Exploration/Discovery indicators
  if (lower.match(/\b(explore|discover|find out|investigate|research)\b/)) {
    return 'exploration';
  }

  // Default to explanation for "what is", "explain", "about", etc.
  if (lower.match(/\b(what|explain|about|understand|why|learn about)\b/)) {
    return 'explanation';
  }

  // Fallback
  return 'mixed';
}

/**
 * Ultra-optimized system prompt for flexible content
 */
export function getCreativeSystemPrompt(): string {
  return `Create engaging educational content as JSON. Adapt to user's needs.

FORMATS:
- explanation: Teach concepts clearly
- tutorial: Step-by-step instructions
- story: Learn through narrative
- interactive: Activities & exercises
- assessment: Quiz & test knowledge
- exploration: Discovery-based learning
- mixed: Combine multiple approaches

BLOCKS (building pieces):
{"type":"text","content":"...","style":"paragraph|heading|highlight"}
{"type":"visual","description":"...","caption":"..."}
{"type":"question","question":"...","options":[...],"correctIndex":0}
{"type":"example","title":"...","content":"..."}
{"type":"activity","instruction":"...","steps":[...]}
{"type":"takeaway","points":[...]}
{"type":"story","narrative":"...","character":"..."}
{"type":"callout","variant":"tip|fun-fact|warning","content":"..."}

STRUCTURE:
{
  "type":"flexible",
  "title":"...",
  "format":"explanation|tutorial|story|...",
  "sections":[
    {"heading":"...","blocks":[...]}
  ]
}

LEGACY (simple cases):
{"type":"quiz",...} - Quick multiple choice
{"type":"math",...} - Math practice only
{"type":"flashcard",...} - Study cards only

RULES:
- Age-appropriate language
- Creative & engaging
- 2-5 sections per lesson
- Mix block types for variety
- Return raw JSON only`;
}

/**
 * Enhanced user prompt with smart format detection
 */
export function getCreativeUserPrompt(outline: string, title: string): string {
  const format = detectContentFormat(outline);

  // For simple quiz/math/flashcard requests, use legacy format
  if (format === 'quiz') {
    return `{"type":"quiz","title":"${title}","questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0}]}

Create quiz for: ${outline}`;
  }

  if (format === 'math') {
    return `{"type":"math","title":"${title}","problems":[{"question":"...","answer":4,"answerOptions":[...]}]}

Create math practice for: ${outline}`;
  }

  if (format === 'flashcard') {
    return `{"type":"flashcard","title":"${title}","cards":[{"front":"...","back":"..."}]}

Create flashcards for: ${outline}`;
  }

  // For everything else, use flexible format
  const formatExamples: Record<string, string> = {
    explanation: `Example: Explain photosynthesis
{
  "type":"flexible",
  "format":"explanation",
  "sections":[
    {
      "heading":"What is Photosynthesis?",
      "blocks":[
        {"type":"text","content":"Plants make food from sunlight...","style":"paragraph"},
        {"type":"visual","description":"Diagram of plant leaf","caption":"How plants use sunlight"},
        {"type":"callout","variant":"fun-fact","content":"Trees produce oxygen for us to breathe!"}
      ]
    }
  ]
}`,
    tutorial: `Example: How to draw a cat
{
  "type":"flexible",
  "format":"tutorial",
  "sections":[
    {
      "heading":"Drawing a Cat",
      "blocks":[
        {"type":"text","content":"Let's learn to draw step by step","style":"heading"},
        {"type":"activity","instruction":"Follow these steps","steps":["Draw circle for head","Add triangles for ears","Draw two dots for eyes"]},
        {"type":"callout","variant":"tip","content":"Practice makes perfect!"}
      ]
    }
  ]
}`,
    story: `Example: Learn about gravity through story
{
  "type":"flexible",
  "format":"story",
  "sections":[
    {
      "blocks":[
        {"type":"story","narrative":"Sam dropped her apple and it fell to the ground...","character":"Sam"},
        {"type":"text","content":"This is gravity - a force that pulls things down","style":"highlight"},
        {"type":"question","question":"What would happen if Sam threw the apple up?","options":["It floats","It falls back down","It flies away"],"correctIndex":1}
      ]
    }
  ]
}`,
    interactive: `Example: Learn colors through activities
{
  "type":"flexible",
  "format":"interactive",
  "sections":[
    {
      "heading":"Exploring Colors",
      "blocks":[
        {"type":"text","content":"Let's discover colors around us!","style":"heading"},
        {"type":"activity","instruction":"Find 3 red things in your room","materials":["Your eyes","Your room"]},
        {"type":"question","question":"What color do you get mixing red and blue?","options":["Green","Purple","Orange"],"correctIndex":1},
        {"type":"takeaway","points":["Red + Blue = Purple","Colors are everywhere"]}
      ]
    }
  ]
}`,
  };

  const example = formatExamples[format] || formatExamples.explanation;

  return `Title: ${title}
Request: ${outline}
Format: ${format}

${example}

Create lesson now:`;
}

/**
 * Minimal retry prompt
 */
export function getCreativeRetryPrompt(outline: string, title: string, error: string): string {
  const format = detectContentFormat(outline);

  return `Error: ${error}

Fix and retry:
Title: ${title}
Request: ${outline}
Format: ${format}

Valid JSON:`;
}

/**
 * Get token estimates
 */
export function getCreativeTokenEstimate() {
  const systemPrompt = getCreativeSystemPrompt();
  const avgUserPrompt = 400; // Average with example

  return {
    system: Math.ceil(systemPrompt.length / 4),
    user: Math.ceil(avgUserPrompt / 4),
    total: Math.ceil((systemPrompt.length + avgUserPrompt) / 4),
  };
}
