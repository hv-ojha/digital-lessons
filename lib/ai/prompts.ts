/**
 * Optimized prompts for AI lesson generation
 * Reduced token usage while maintaining quality
 */

export function getSystemPrompt(): string {
  return `Generate a complete React/TypeScript lesson component.

CODE RULES:
- Output ONLY TypeScript code (no markdown/explanations)
- export default function Lesson() { ... }
- Imports: import { useState, useEffect } from 'react';
- Styling: Tailwind CSS only
- CRITICAL: Use ONLY buttons (NO text inputs/forms - they cause validation errors)

DESIGN SYSTEM (always specify both bg AND text):
Base: bg-background text-foreground, max-w-4xl mx-auto px-4 py-12
Cards: bg-card border border-border/50 rounded-2xl shadow-lg p-8
Headers: bg-gradient-to-br from-accent to-accent/70 text-accent-foreground p-6 rounded-xl
Buttons: bg-card border-2 border-border hover:bg-accent/20 hover:border-accent rounded-xl px-6 py-4 transition-all
Primary: bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md px-6 py-3
Success: bg-success/10 border border-success/20 text-success p-6 rounded-xl
Warning: bg-warning/10 border border-warning/20 text-warning p-6 rounded-xl
Error: bg-destructive/10 border border-destructive/30 text-destructive p-6 rounded-xl
Typography: H1=text-4xl md:text-5xl font-bold tracking-tight, H2=text-2xl md:text-3xl font-semibold, Body=text-base leading-relaxed
Layout: space-y-8 (sections), gap-3 md:gap-4 (grids)
TypeScript: Type arrays as Array<{...}>, type state useState<T>([])

VISUALS:
- IF {IMAGE:key} placeholders listed: Use them in <img src="{IMAGE:key}" alt="..." className="w-full max-w-md mx-auto rounded-lg" />
- ELSE: Create inline SVG illustrations (NO external URLs)

SVG EXAMPLES (simple shapes only):
Planet: <svg className="w-64 h-64" viewBox="0 0 200 200"><circle cx="100" cy="100" r="30" fill="#FDB813"/><circle cx="100" cy="100" r="70" stroke="#E5E7EB" fill="none"/></svg>
Bar Chart: <svg className="w-full h-48" viewBox="0 0 400 200"><rect x="50" y="120" width="60" height="80" fill="#3B82F6" rx="4"/><rect x="130" y="80" width="60" height="120" fill="#10B981" rx="4"/></svg>
Shape: <svg className="w-48 h-48" viewBox="0 0 100 100"><rect x="25" y="25" width="50" height="50" fill="#8B5CF6" rx="4"/></svg>

FEEDBACK ICONS (always include):
Success: <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
Error: <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>

QUIZ PATTERN:
export default function Lesson() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<number|null>(null);
  const questions = [{q: "2+2?", opts: ["3","4","5"], ans: 1}] as Array<{q: string; opts: string[]; ans: number}>;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-card border border-border/50 rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Quiz Title</h1>
          <p className="text-muted-foreground">Question {current+1} of {questions.length}</p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-8">
          <div className="bg-gradient-to-br from-accent to-accent/70 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-semibold text-accent-foreground">{questions[current].q}</h2>
          </div>

          <div className="space-y-3">
            {questions[current].opts.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={\`w-full px-6 py-4 rounded-xl text-left transition-all \${selected===i ? 'bg-accent text-accent-foreground' : 'bg-card border-2 border-border hover:bg-accent/20'}\`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {selected===questions[current].ans && (
          <div className="bg-success/10 border border-success/20 p-6 rounded-xl flex gap-3">
            <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <div><p className="text-success text-xl font-semibold">Correct!</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

MATH PATTERN (button grid, NOT input):
export default function Lesson() {
  const [answer, setAnswer] = useState<number|null>(null);
  const correct = 12;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-card border border-border/50 rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">What is 3 × 4?</h1>
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[8,9,10,11,12,13,14,15,16].map(n => (
              <button
                key={n}
                onClick={() => setAnswer(n)}
                className={\`px-6 py-5 rounded-xl text-2xl font-semibold transition-all \${answer===n ? 'bg-accent text-accent-foreground shadow-md' : 'bg-card border-2 border-border hover:bg-accent/20'}\`}
              >
                {n}
              </button>
            ))}
          </div>
          {answer===correct && (
            <div className="bg-success/10 border border-success/20 p-6 rounded-xl mt-6 flex gap-3">
              <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <p className="text-success text-xl font-semibold">Perfect! 3 × 4 = 12</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`;
}

/**
 * User prompt template (concise - system prompt has all rules)
 */
export function getUserPrompt(outline: string, title: string): string {
  return `Generate lesson component:
Title: ${title}
Outline: ${outline}

Requirements:
- Output ONLY TypeScript code
- Use buttons only (NO input fields)
- Follow design system from instructions
- If images needed: use {IMAGE:key} placeholders OR create inline SVGs
- Include feedback states with SVG icons`;
}

/**
 * Code fix prompt template
 */
export function getCodeFixPrompt(errors: string[]): string {
  return `Fix these errors:
${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Output ONLY corrected TypeScript code.`;
}
