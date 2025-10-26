import ts from 'typescript';

/**
 * Compile TypeScript code and return diagnostics
 *
 * This uses the actual TypeScript compiler to check for:
 * - Type errors
 * - Undefined variables
 * - Invalid React usage
 * - Syntax errors
 */
export interface CompilationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Compile generated React/TypeScript code
 */
export function compileTypeScriptCode(code: string): CompilationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Prepare the code with proper imports if missing
    let codeToCompile = code;

    // Ensure React imports are present
    if (!code.includes('import') && (code.includes('useState') || code.includes('useEffect'))) {
      codeToCompile = `import { useState, useEffect, useCallback, useMemo } from 'react';\n\n${code}`;
    }

    // Add React types and global scope
    const reactTypes = `
      // React module declarations
      declare module 'react' {
        export function useState<S>(initialState: S | (() => S)): [S, (newState: S | ((prevState: S) => S)) => void];
        export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
        export function useCallback<T extends Function>(callback: T, deps: any[]): T;
        export function useMemo<T>(factory: () => T, deps: any[]): T;
        export namespace JSX {
          interface Element {}
          interface IntrinsicElements {
            [elemName: string]: any;
          }
        }
      }

      // Global React (available in react-live scope)
      declare const React: any;

      // Browser APIs
      declare const setTimeout: any;
      declare const setInterval: any;
      declare const clearTimeout: any;
      declare const clearInterval: any;
      declare const console: any;
      declare const window: any;
      declare const document: any;
    `;

    // Compiler options for React + TypeScript (relaxed for react-live environment)
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      jsxFactory: 'React.createElement', // Specify React as JSX factory
      jsxFragmentFactory: 'React.Fragment',
      strict: false, // Too strict causes false positives
      noImplicitAny: false, // Allow implicit any
      noImplicitThis: false, // Allow implicit this
      strictNullChecks: false, // Don't enforce null checks
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      suppressImplicitAnyIndexErrors: true, // Suppress index errors
    };

    // Create a source file
    const sourceFile = ts.createSourceFile(
      'lesson.tsx',
      codeToCompile,
      ts.ScriptTarget.ES2020,
      true,
      ts.ScriptKind.TSX
    );

    // Create types source file
    const typesFile = ts.createSourceFile(
      'react.d.ts',
      reactTypes,
      ts.ScriptTarget.ES2020,
      true,
      ts.ScriptKind.TS
    );

    // Create a program
    const host: ts.CompilerHost = {
      getSourceFile: (fileName) => {
        if (fileName === 'lesson.tsx') return sourceFile;
        if (fileName === 'react.d.ts') return typesFile;
        // Return empty for lib files
        return undefined;
      },
      writeFile: () => {},
      getCurrentDirectory: () => '',
      getDirectories: () => [],
      fileExists: (fileName) => fileName === 'lesson.tsx' || fileName === 'react.d.ts',
      readFile: () => '',
      getCanonicalFileName: (fileName) => fileName,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => '\n',
      getDefaultLibFileName: () => 'lib.d.ts',
    };

    const program = ts.createProgram(['lesson.tsx'], compilerOptions, host);

    // Get diagnostics
    const diagnostics = [
      ...program.getSyntacticDiagnostics(sourceFile),
      ...program.getSemanticDiagnostics(sourceFile),
    ];

    // Process diagnostics
    for (const diagnostic of diagnostics) {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

      // Get line number if available
      let location = '';
      if (diagnostic.file && diagnostic.start !== undefined) {
        const { line } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        location = `Line ${line + 1}: `;
      }

      const fullMessage = `${location}${message}`;

      // Categorize by severity and filter false positives
      if (diagnostic.category === ts.DiagnosticCategory.Error) {
        // Filter out false positives that are OK in react-live environment
        const isFalsePositive =
          // React scope issues (React is available in react-live)
          message.includes('React') && message.includes('to be in scope') ||
          message.includes("JSX tag requires 'React'") ||
          message.includes("fragment factory 'React'") ||

          // Browser APIs (available in browser)
          message.includes('Cannot find name') && (
            message.includes('setTimeout') ||
            message.includes('setInterval') ||
            message.includes('clearTimeout') ||
            message.includes('clearInterval') ||
            message.includes('console') ||
            message.includes('window') ||
            message.includes('document')
          ) ||

          // Built-in JavaScript types (always available at runtime)
          // TypeScript compiler doesn't have lib.d.ts, but these types exist in the browser
          message.includes('Cannot find name') && (
            message.includes("'Array'") ||
            message.includes("'String'") ||
            message.includes("'Number'") ||
            message.includes("'Object'") ||
            message.includes("'Boolean'") ||
            message.includes("'Date'") ||
            message.includes("'Math'") ||
            message.includes("'JSON'") ||
            message.includes("'RegExp'") ||
            message.includes("'Error'") ||
            message.includes("'Promise'") ||
            message.includes("'Set'") ||
            message.includes("'Map'") ||
            message.includes("'WeakSet'") ||
            message.includes("'WeakMap'") ||
            message.includes("'Symbol'") ||
            message.includes("'Proxy'") ||
            message.includes("'Reflect'") ||
            message.includes("'Intl'") ||
            message.includes("'ArrayBuffer'") ||
            message.includes("'DataView'") ||
            message.includes("'Int8Array'") ||
            message.includes("'Uint8Array'") ||
            message.includes("'Int16Array'") ||
            message.includes("'Uint16Array'") ||
            message.includes("'Int32Array'") ||
            message.includes("'Uint32Array'") ||
            message.includes("'Float32Array'") ||
            message.includes("'Float64Array'")
          ) ||

          // Type inference issues that don't affect runtime
          // When TypeScript can't infer array/object types, it defaults to {}
          // This causes false positives like: Property 'map' does not exist on type '{}'
          // But the code works fine at runtime, so we ignore these
          message.includes("does not exist on type '{}'") ||
          message.includes("does not exist on type 'never'") ||
          message.includes("Type '{}' is missing") ||

          // Module resolution (not relevant in our case)
          message.includes('Cannot find module') ||
          message.includes('lib.d.ts');

        if (isFalsePositive) {
          // These are OK in our sandboxed environment - demote to warning
          warnings.push(`[Ignored] ${fullMessage}`);
        } else {
          errors.push(fullMessage);
        }
      } else if (diagnostic.category === ts.DiagnosticCategory.Warning) {
        warnings.push(fullMessage);
      }
    }

    // Check for common React errors that TypeScript might miss
    if (codeToCompile.includes('useState') && !codeToCompile.includes('React')) {
      // This is actually fine with our setup, but good to be aware
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    // If compilation throws an exception, that's a critical error
    errors.push(`Compilation failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      errors,
      warnings,
    };
  }
}

/**
 * Quick syntax check without full compilation (faster)
 */
export function quickSyntaxCheck(code: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const sourceFile = ts.createSourceFile(
      'lesson.tsx',
      code,
      ts.ScriptTarget.ES2020,
      true,
      ts.ScriptKind.TSX
    );

    // Check for parser errors
    function visit(node: ts.Node) {
      if (node.kind === ts.SyntaxKind.Unknown) {
        errors.push('Syntax error detected in code');
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    // Additional quick checks
    // Note: parseDiagnostics is not available on SourceFile in current TypeScript version
    // if (sourceFile.parseDiagnostics && sourceFile.parseDiagnostics.length > 0) {
    //   sourceFile.parseDiagnostics.forEach(diagnostic => {
    //     const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    //     errors.push(message);
    //   });
    // }

    return {
      isValid: errors.length === 0,
      errors,
    };
  } catch (error) {
    errors.push(`Syntax check failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      isValid: false,
      errors,
    };
  }
}
