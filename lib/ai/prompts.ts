/**
 * Enhanced prompts for AI lesson generation with UI/UX best practices
 */

export function getSystemPrompt(): string {
  return `Generate a complete React/TypeScript lesson component with excellent UI/UX.

CODE RULES:
- Output ONLY TypeScript code (no markdown/explanations)
- export default function Lesson() { ... }
- Imports: import { useState, useEffect } from 'react';
- Styling: Tailwind CSS only
- CRITICAL: Use ONLY buttons (NO text inputs/forms - they cause validation errors)

UI/UX PRINCIPLES (MANDATORY):
1. SPACING IS CRITICAL - Always use consistent padding and margins:
   - Main container: min-h-screen bg-background py-12 px-4
   - Content wrapper: max-w-4xl mx-auto space-y-8
   - Cards: p-6 md:p-8 (responsive padding)
   - Card sections: space-y-6 (vertical spacing within cards)
   - Elements: space-y-3 md:space-y-4 (spacing between related items)
   - Button grids: gap-3 md:gap-4 (grid gaps)

2. INTERACTIVE STATES - Make selection OBVIOUS and CLEAR:
   - Default: bg-card border-2 border-border
   - Hover: hover:bg-accent/20 hover:border-accent hover:shadow-md
   - Selected/Active: bg-accent/90 border-2 border-accent text-accent-foreground shadow-lg font-semibold
   - Disabled: opacity-50 cursor-not-allowed
   - Always add: transition-all duration-200
   - IMPORTANT: Selected state must be CLEARLY different from default state

3. VISUAL HIERARCHY:
   - H1: text-4xl md:text-5xl font-bold tracking-tight mb-4
   - H2: text-2xl md:text-3xl font-semibold mb-3
   - Body: text-base md:text-lg leading-relaxed
   - Muted text: text-muted-foreground text-sm

4. FEEDBACK STATES:
   - Always show feedback when user interacts
   - Success: bg-success/10 border border-success/20 text-success
   - Error: bg-destructive/10 border border-destructive/30 text-destructive
   - Include icons with feedback messages
   - Use flex gap-3 items-start for icon + text layout

DESIGN SYSTEM (always specify both bg AND text):
Base: bg-background text-foreground
Cards: bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-8
Card Sections: space-y-6 (for content within cards)
Headers: bg-gradient-to-br from-accent to-accent/70 text-accent-foreground p-6 rounded-xl
Buttons (Default): bg-card border-2 border-border hover:bg-accent/20 hover:border-accent hover:shadow-md rounded-xl px-6 py-4 transition-all duration-200 text-base md:text-lg
Buttons (Selected): bg-accent/90 border-2 border-accent text-accent-foreground shadow-lg rounded-xl px-6 py-4 font-semibold transition-all duration-200 text-base md:text-lg
Primary Action: bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md px-6 py-3 transition-all duration-200
Success Alert: bg-success/10 border border-success/20 text-success p-6 rounded-xl
Warning Alert: bg-warning/10 border border-warning/20 text-warning p-6 rounded-xl
Error Alert: bg-destructive/10 border border-destructive/30 text-destructive p-6 rounded-xl
TypeScript: Type arrays as Array<{...}>, type state useState<T>([])

VISUALS:
- IF {IMAGE:key} placeholders listed: Use them in <img src="{IMAGE:key}" alt="..." className="w-full max-w-md mx-auto rounded-lg shadow-md" />
- ELSE: Create inline SVG illustrations (NO external URLs)

SVG EXAMPLES (simple, colorful shapes):
Planet: <svg className="w-64 h-64 mx-auto" viewBox="0 0 200 200"><circle cx="100" cy="100" r="30" fill="#FDB813"/><circle cx="100" cy="100" r="70" stroke="#E5E7EB" strokeWidth="2" fill="none"/></svg>
Bar Chart: <svg className="w-full h-48" viewBox="0 0 400 200"><rect x="50" y="120" width="60" height="80" fill="#3B82F6" rx="4"/><rect x="130" y="80" width="60" height="120" fill="#10B981" rx="4"/><rect x="210" y="100" width="60" height="100" fill="#F59E0B" rx="4"/></svg>
Shape: <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100"><rect x="25" y="25" width="50" height="50" fill="#8B5CF6" rx="4"/></svg>

FEEDBACK ICONS (include with all feedback messages):
Success Icon:
<svg className="w-6 h-6 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
</svg>

Error Icon:
<svg className="w-6 h-6 text-destructive flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
</svg>

===========================================
QUIZ PATTERN (follow this structure exactly):
===========================================
export default function Lesson() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const questions = [
    { q: "What is 2 + 2?", opts: ["3", "4", "5", "6"], ans: 1 },
    { q: "What is 3 × 3?", opts: ["6", "9", "12", "15"], ans: 1 }
  ] as Array<{ q: string; opts: string[]; ans: number }>;

  const handleAnswer = (index: number) => {
    setSelected(index);
    setAnswered(true);
    if (index === questions[current].ans) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setDone(true);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Card */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Quiz Title</h1>
          <p className="text-muted-foreground text-sm">Question {current + 1} of {questions.length}</p>
        </div>

        {/* Question Card */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
          {/* Question Header */}
          <div className="bg-gradient-to-br from-accent to-accent/70 rounded-xl p-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-accent-foreground">
              {questions[current].q}
            </h2>
          </div>

          {/* Options - Notice the clear selected state */}
          <div className="space-y-3 md:space-y-4">
            {questions[current].opts.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={answered}
                className={\`w-full px-6 py-4 rounded-xl text-left text-base md:text-lg transition-all duration-200 \${
                  selected === i
                    ? 'bg-accent/90 border-2 border-accent text-accent-foreground shadow-lg font-semibold'
                    : 'bg-card border-2 border-border hover:bg-accent/20 hover:border-accent hover:shadow-md'
                } \${answered ? 'cursor-not-allowed' : ''}\`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Next Button */}
          {answered && (
            <button
              onClick={handleNext}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md px-6 py-3 transition-all duration-200 font-semibold"
            >
              {current < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          )}
        </div>

        {/* Feedback - Show for both correct and incorrect */}
        {answered && (
          <div className={\`p-6 rounded-xl flex gap-3 items-start \${
            selected === questions[current].ans
              ? 'bg-success/10 border border-success/20'
              : 'bg-destructive/10 border border-destructive/30'
          }\`}>
            {selected === questions[current].ans ? (
              <>
                <svg className="w-6 h-6 text-success flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-success text-lg md:text-xl font-semibold">Correct! Well done!</p>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-destructive flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-destructive text-lg md:text-xl font-semibold">Not quite! Try again next time.</p>
              </>
            )}
          </div>
        )}

        {/* Final Score */}
        {done && (
          <div className="bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-8 text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Quiz Complete!</h2>
            <p className="text-2xl text-muted-foreground">
              Your Score: <span className="text-accent font-bold">{score}</span> / {questions.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

===========================================
MATH PATTERN (button grid, NO text inputs):
===========================================
export default function Lesson() {
  const [answer, setAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = 12;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Math Question Card */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
          {/* Question */}
          <div className="bg-gradient-to-br from-accent to-accent/70 rounded-xl p-6">
            <h1 className="text-4xl md:text-5xl font-bold text-accent-foreground">What is 3 × 4?</h1>
          </div>

          {/* Answer Grid - Notice the clear selected state */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {[8, 9, 10, 11, 12, 13, 14, 15, 16].map((n) => (
              <button
                key={n}
                onClick={() => setAnswer(n)}
                className={\`px-6 py-5 rounded-xl text-2xl font-semibold transition-all duration-200 \${
                  answer === n
                    ? 'bg-accent/90 border-2 border-accent text-accent-foreground shadow-lg'
                    : 'bg-card border-2 border-border hover:bg-accent/20 hover:border-accent hover:shadow-md'
                }\`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Check Answer Button */}
          {answer !== null && !checked && (
            <button
              onClick={() => setChecked(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md px-6 py-3 transition-all duration-200 font-semibold"
            >
              Check Answer
            </button>
          )}
        </div>

        {/* Feedback */}
        {checked && (
          <div className={\`p-6 rounded-xl flex gap-3 items-start \${
            answer === correct
              ? 'bg-success/10 border border-success/20'
              : 'bg-destructive/10 border border-destructive/30'
          }\`}>
            {answer === correct ? (
              <>
                <svg className="w-6 h-6 text-success flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <p className="text-success text-lg md:text-xl font-semibold">Perfect!</p>
                  <p className="text-success">3 × 4 = {correct}</p>
                </div>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-destructive flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <p className="text-destructive text-lg md:text-xl font-semibold">Not quite!</p>
                  <p className="text-destructive">Try again: 3 × 4 = ?</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

REMEMBER:
1. ALWAYS use proper spacing: space-y-8 for main sections, space-y-6 for card content, space-y-3/4 for lists
2. ALWAYS make selected buttons CLEARLY visible: bg-accent/90 border-accent shadow-lg font-semibold
3. ALWAYS include both success AND error feedback states
4. ALWAYS add transition-all duration-200 to interactive elements
5. ALWAYS use p-6 md:p-8 for card padding
6. NEVER use text inputs - only buttons`;
}

/**
 * User prompt template (concise - system prompt has all rules)
 */
export function getUserPrompt(outline: string, title: string): string {
  return `Generate lesson component:
Title: ${title}
Outline: ${outline}

Requirements:
- Output ONLY TypeScript code (no markdown, no explanations)
- Use buttons only (NO input fields)
- Follow UI/UX principles from instructions (proper spacing, clear selected states)
- Selected buttons MUST be clearly visible with bg-accent/90 border-accent shadow-lg
- Include proper padding (p-6 md:p-8) and spacing (space-y-6, space-y-8)
- Show both success and error feedback with icons
- If images needed: use {IMAGE:key} placeholders OR create inline SVGs`;
}

/**
 * Code fix prompt template
 */
export function getCodeFixPrompt(errors: string[]): string {
  return `Fix these errors:
${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Output ONLY corrected TypeScript code.
Ensure proper spacing and clear selected states as per UI/UX guidelines.`;
}
