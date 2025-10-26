import { compileTypeScriptCode } from './typescript-compiler';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate TypeScript/React code for safety and correctness
 *
 * IMPORTANT: This validation is pattern-based (regex), NOT a full TypeScript compiler.
 * It catches common issues but cannot guarantee:
 * - Type correctness
 * - Logic errors
 * - Runtime behavior
 * - All syntax errors
 *
 * Use in combination with:
 * - Sandboxed execution (react-live)
 * - Error boundaries
 * - User testing
 */
export function validateTypeScriptCode(code: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation checks
  if (!code || code.trim().length === 0) {
    errors.push('Code is empty');
    return { isValid: false, errors, warnings };
  }

  // Check for required export
  if (!code.includes('export default function')) {
    errors.push('Missing default export function');
  }

  // Check for dangerous patterns (security)
  const dangerousPatterns = [
    { pattern: /eval\s*\(/i, message: 'Use of eval() is not allowed' },
    { pattern: /Function\s*\(/i, message: 'Use of Function constructor is not allowed' },
    { pattern: /dangerouslySetInnerHTML/i, message: 'Use of dangerouslySetInnerHTML is not allowed' },
    { pattern: /<script/i, message: 'Script tags are not allowed' },
    { pattern: /window\s*\[/i, message: 'Dynamic window access is not allowed' },
    { pattern: /document\.write/i, message: 'document.write is not allowed' },
    { pattern: /import\s+.*\s+from\s+['"](?!react['"])/g, message: 'Only React imports are allowed' },
  ];

  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(code)) {
      errors.push(message);
    }
  }

  // Check for required React patterns
  if (code.includes('useState') && !code.includes('import')) {
    warnings.push('useState is used but no import statement found');
  }

  // Check for basic syntax errors
  const syntaxChecks = [
    { pattern: /^\s*export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/m, message: 'Invalid function declaration' },
    { pattern: /return\s*\(/m, message: 'Component should have a return statement' },
  ];

  for (const { pattern, message } of syntaxChecks) {
    if (!pattern.test(code)) {
      errors.push(message);
    }
  }

  // Check for balanced braces
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
  }

  // Check for balanced parentheses
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
  }

  // Check for JSX return
  if (!code.includes('<') || !code.includes('>')) {
    errors.push('Component must return JSX elements');
  }

  // Additional safety checks
  if (code.includes('fetch(') || code.includes('XMLHttpRequest')) {
    errors.push('Network requests are not allowed in lessons');
  }

  if (code.includes('localStorage') || code.includes('sessionStorage')) {
    warnings.push('Using localStorage/sessionStorage - ensure this is intentional');
  }

  // Check for allowed Tailwind CSS usage (should use className, not style objects for inline styles)
  if (code.includes('style={{') && code.split('style={{').length > 3) {
    warnings.push('Excessive inline styles detected - prefer Tailwind CSS classes');
  }

  // Check for input fields (discouraged - can cause errors)
  const inputPatterns = [
    { pattern: /<input/i, message: 'Text input fields detected - these can cause errors. Use clickable buttons instead.' },
    { pattern: /<textarea/i, message: 'Textarea fields detected - these can cause errors. Use clickable options instead.' },
    { pattern: /type=['"]text['"]/i, message: 'Text input type detected - use clickable buttons for kid-friendly interactions.' },
    { pattern: /type=['"]number['"]/i, message: 'Number input detected - consider using clickable number buttons instead.' },
  ];

  for (const { pattern, message } of inputPatterns) {
    if (pattern.test(code)) {
      errors.push(message);
    }
  }

  // Check for placeholder images (should use SVG instead)
  const imagePatterns = [
    { pattern: /https?:\/\/via\.placeholder\.com/i, message: 'Placeholder image URLs detected (via.placeholder.com) - use inline SVG illustrations instead.' },
    { pattern: /https?:\/\/picsum\.photos/i, message: 'Placeholder image URLs detected (picsum.photos) - use inline SVG illustrations instead.' },
    { pattern: /https?:\/\/placehold\.it/i, message: 'Placeholder image URLs detected (placehold.it) - use inline SVG illustrations instead.' },
    { pattern: /https?:\/\/placeholder\.com/i, message: 'Placeholder image URLs detected (placeholder.com) - use inline SVG illustrations instead.' },
    { pattern: /https?:\/\/dummyimage\.com/i, message: 'Placeholder image URLs detected (dummyimage.com) - use inline SVG illustrations instead.' },
    { pattern: /<img[^>]+src=['"]https?:\/\/[^'"]*placeholder[^'"]*['"]/i, message: 'External placeholder images detected - create inline SVG illustrations instead.' },
  ];

  for (const { pattern, message } of imagePatterns) {
    if (pattern.test(code)) {
      errors.push(message);
    }
  }

  // Check for common React pitfalls
  const reactPitfalls = [
    {
      pattern: /useEffect\s*\(\s*\([^)]*\)\s*=>\s*\{[^}]*setState[^}]*\}\s*\)/,
      message: 'Potential infinite loop: setState in useEffect without dependency array',
      isWarning: true
    },
    {
      pattern: /onClick\s*=\s*\{[^}]*\([^)]*\)\s*\}/,
      message: 'onClick handler appears to call function immediately - wrap in arrow function',
      isWarning: true
    },
    {
      pattern: /className\s*=\s*[^{"`'][^>]*>/,
      message: 'className value should be a string in quotes, not interpolated',
      isWarning: true
    },
  ];

  for (const { pattern, message, isWarning } of reactPitfalls) {
    if (pattern.test(code)) {
      if (isWarning) {
        warnings.push(message);
      } else {
        errors.push(message);
      }
    }
  }

  // Check for TypeScript-specific issues
  const typeScriptIssues = [
    {
      pattern: /useState\s*<\s*\w+\s*>\s*\(\s*undefined\s*\)/,
      message: 'useState with undefined initial value may cause runtime errors',
      isWarning: true
    },
    {
      pattern: /map\(\s*\([^)]*\)\s*=>\s*<[^>]+>.*\)\s*(?!\.)/,
      message: 'Missing key prop in map() - add key={item.id} or key={index}',
      isWarning: true
    },
  ];

  for (const { pattern, message, isWarning } of typeScriptIssues) {
    if (pattern.test(code)) {
      if (isWarning) {
        warnings.push(message);
      }
    }
  }

  // If basic validation passed, run TypeScript compilation check
  if (errors.length === 0) {
    console.log('✓ Pattern validation passed, running TypeScript compilation...');

    const compilationResult = compileTypeScriptCode(code);

    if (!compilationResult.success) {
      console.log(`✗ TypeScript compilation failed with ${compilationResult.errors.length} errors`);
      errors.push(...compilationResult.errors);
    } else {
      console.log('✓ TypeScript compilation passed');
    }

    // Add compilation warnings
    warnings.push(...compilationResult.warnings);
  } else {
    console.log('✗ Pattern validation failed, skipping TypeScript compilation');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Sanitize generated code before execution
 */
export function sanitizeCode(code: string): string {
  // Remove any potential script injections
  let sanitized = code.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove any import statements that aren't React
  sanitized = sanitized.replace(/import\s+.*?\s+from\s+['"](?!react['"]).*?['"];?\n/g, '');

  // Ensure code starts with proper imports
  if (!sanitized.includes('import')) {
    sanitized = `import { useState, useEffect } from 'react';\n\n${sanitized}`;
  }

  return sanitized;
}

/**
 * Extract component name from code
 */
export function extractComponentName(code: string): string | null {
  const match = code.match(/export\s+default\s+function\s+(\w+)/);
  return match ? match[1] : null;
}
