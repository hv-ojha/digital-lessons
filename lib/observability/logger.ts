/**
 * Structured Logging Utility
 *
 * Provides comprehensive logging for AI calls, Inngest jobs, and failures
 * with support for correlation IDs and structured data.
 *
 * Logs are output as JSON to stdout/stderr for easy consumption by
 * logging services like Vercel Logs, Datadog, etc.
 */

// Correlation ID generator
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Log context type
export interface LogContext {
  correlationId?: string;
  userId?: string;
  lessonId?: string;
  [key: string]: any;
}

// Log levels
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

// Base logger function
function log(level: LogLevel, type: string, message: string, context: any = {}) {
  const logLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
  const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

  if (levels.indexOf(level) < levels.indexOf(logLevel)) {
    return; // Skip logs below configured level
  }

  const logEntry = {
    level,
    time: new Date().toISOString(),
    type,
    msg: message,
    ...context,
  };

  // Output to appropriate stream
  if (level === 'ERROR') {
    console.error(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * AI Call Logging
 */
export const aiLogger = {
  callStarted: (context: LogContext & {
    provider: string;
    model: string;
    operation: string;
    prompt?: string;
  }) => {
    log('INFO', 'ai_call_started', `🤖 AI Call Started: ${context.operation}`, {
      ...context,
      prompt: context.prompt ? `${context.prompt.substring(0, 100)}...` : undefined,
    });
  },

  callCompleted: (context: LogContext & {
    provider: string;
    model: string;
    operation: string;
    duration: number;
    tokens?: number;
    result?: any;
  }) => {
    log('INFO', 'ai_call_completed', `✅ AI Call Completed: ${context.operation} (${context.duration}ms)`, {
      ...context,
      result: context.result ? JSON.stringify(context.result).substring(0, 200) : undefined,
    });
  },

  callFailed: (context: LogContext & {
    provider: string;
    model: string;
    operation: string;
    duration?: number;
    error: Error | string;
    retryCount?: number;
    willRetry?: boolean;
  }) => {
    const errorMessage = context.error instanceof Error ? context.error.message : context.error;
    const errorStack = context.error instanceof Error ? context.error.stack : undefined;

    log('ERROR', 'ai_call_failed', `❌ AI Call Failed: ${context.operation} - ${errorMessage}`, {
      ...context,
      error: errorMessage,
      errorStack,
      retryCount: context.retryCount || 0,
      willRetry: context.willRetry || false,
    });
  },

  retryAttempt: (context: LogContext & {
    provider: string;
    model: string;
    operation: string;
    retryCount: number;
    maxRetries: number;
    reason: string;
  }) => {
    log('WARN', 'ai_call_retry', `🔄 AI Call Retry ${context.retryCount}/${context.maxRetries}: ${context.operation} - ${context.reason}`, context);
  },

  validationFailed: (context: LogContext & {
    operation: string;
    validationErrors: any[];
    rawResponse?: string;
  }) => {
    log('WARN', 'ai_validation_failed', `⚠️  AI Response Validation Failed: ${context.operation}`, {
      ...context,
      rawResponse: context.rawResponse ? context.rawResponse.substring(0, 500) : undefined,
    });
  },
};

/**
 * Inngest Job Logging
 */
export const inngestLogger = {
  jobStarted: (context: LogContext & {
    jobId: string;
    jobName: string;
    eventName: string;
    eventData?: any;
  }) => {
    log('INFO', 'inngest_job_started', `🚀 Inngest Job Started: ${context.jobName} (${context.jobId})`, context);
  },

  jobCompleted: (context: LogContext & {
    jobId: string;
    jobName: string;
    duration: number;
    result?: any;
  }) => {
    log('INFO', 'inngest_job_completed', `✅ Inngest Job Completed: ${context.jobName} (${context.duration}ms)`, context);
  },

  jobFailed: (context: LogContext & {
    jobId: string;
    jobName: string;
    duration?: number;
    error: Error | string;
    retryCount?: number;
    willRetry?: boolean;
    eventData?: any;
  }) => {
    const errorMessage = context.error instanceof Error ? context.error.message : context.error;
    const errorStack = context.error instanceof Error ? context.error.stack : undefined;

    log('ERROR', 'inngest_job_failed', `❌ Inngest Job Failed: ${context.jobName} - ${errorMessage}`, {
      ...context,
      error: errorMessage,
      errorStack,
      retryCount: context.retryCount || 0,
      willRetry: context.willRetry || false,
    });
  },

  stepStarted: (context: LogContext & {
    jobId: string;
    jobName: string;
    stepName: string;
    stepNumber: number;
  }) => {
    log('DEBUG', 'inngest_step_started', `📍 Step ${context.stepNumber}: ${context.stepName}`, context);
  },

  stepCompleted: (context: LogContext & {
    jobId: string;
    jobName: string;
    stepName: string;
    stepNumber: number;
    duration: number;
  }) => {
    log('DEBUG', 'inngest_step_completed', `✓ Step ${context.stepNumber} Completed: ${context.stepName} (${context.duration}ms)`, context);
  },

  stepFailed: (context: LogContext & {
    jobId: string;
    jobName: string;
    stepName: string;
    stepNumber: number;
    error: Error | string;
  }) => {
    const errorMessage = context.error instanceof Error ? context.error.message : context.error;
    const errorStack = context.error instanceof Error ? context.error.stack : undefined;

    log('ERROR', 'inngest_step_failed', `✗ Step ${context.stepNumber} Failed: ${context.stepName} - ${errorMessage}`, {
      ...context,
      error: errorMessage,
      errorStack,
    });
  },
};

/**
 * Lesson Generation Logging
 */
export const lessonLogger = {
  generationStarted: (context: LogContext & {
    lessonId: string;
    outline: string;
    mode: 'sync' | 'async';
  }) => {
    log('INFO', 'lesson_generation_started', `📚 Lesson Generation Started: ${context.lessonId} (${context.mode})`, {
      ...context,
      outlineLength: context.outline.length,
      outlinePreview: context.outline.substring(0, 100),
    });
  },

  generationCompleted: (context: LogContext & {
    lessonId: string;
    duration: number;
    lessonType: string;
    contentLength?: number;
    tokens?: number;
  }) => {
    log('INFO', 'lesson_generation_completed', `✅ Lesson Generated: ${context.lessonId} (${context.lessonType}, ${context.duration}ms)`, context);
  },

  generationFailed: (context: LogContext & {
    lessonId: string;
    duration?: number;
    error: Error | string;
    phase?: string;
  }) => {
    const errorMessage = context.error instanceof Error ? context.error.message : context.error;
    const errorStack = context.error instanceof Error ? context.error.stack : undefined;

    log('ERROR', 'lesson_generation_failed', `❌ Lesson Generation Failed: ${context.lessonId} - ${errorMessage}`, {
      ...context,
      error: errorMessage,
      errorStack,
    });
  },

  titleGenerated: (context: LogContext & {
    lessonId: string;
    title: string;
    duration: number;
  }) => {
    log('DEBUG', 'lesson_title_generated', `📝 Title Generated: "${context.title}" (${context.duration}ms)`, context);
  },

  contentGenerated: (context: LogContext & {
    lessonId: string;
    duration: number;
    contentLength: number;
    lessonType: string;
  }) => {
    log('DEBUG', 'lesson_content_generated', `📄 Content Generated: ${context.lessonType} (${context.contentLength} chars, ${context.duration}ms)`, context);
  },
};

/**
 * General Error Logging
 */
export const errorLogger = {
  apiError: (context: LogContext & {
    endpoint: string;
    method: string;
    statusCode?: number;
    error: Error | string;
  }) => {
    const errorMessage = context.error instanceof Error ? context.error.message : context.error;
    const errorStack = context.error instanceof Error ? context.error.stack : undefined;

    log('ERROR', 'api_error', `🔴 API Error: ${context.method} ${context.endpoint} - ${errorMessage}`, {
      ...context,
      error: errorMessage,
      errorStack,
    });
  },

  databaseError: (context: LogContext & {
    operation: string;
    table?: string;
    error: Error | string;
  }) => {
    const errorMessage = context.error instanceof Error ? context.error.message : context.error;
    const errorStack = context.error instanceof Error ? context.error.stack : undefined;

    log('ERROR', 'database_error', `💾 Database Error: ${context.operation} - ${errorMessage}`, {
      ...context,
      error: errorMessage,
      errorStack,
    });
  },

  unexpectedError: (context: LogContext & {
    location: string;
    error: Error | string;
  }) => {
    const errorMessage = context.error instanceof Error ? context.error.message : context.error;
    const errorStack = context.error instanceof Error ? context.error.stack : undefined;

    log('ERROR', 'unexpected_error', `🔥 Unexpected Error in ${context.location}: ${errorMessage}`, {
      ...context,
      error: errorMessage,
      errorStack,
    });
  },
};

/**
 * Performance Logging
 */
export const perfLogger = {
  measure: (context: LogContext & {
    operation: string;
    duration: number;
    metadata?: any;
  }) => {
    log('DEBUG', 'performance_measure', `⏱️  ${context.operation}: ${context.duration}ms`, context);
  },

  slowOperation: (context: LogContext & {
    operation: string;
    duration: number;
    threshold: number;
  }) => {
    log('WARN', 'slow_operation', `⚠️  Slow Operation: ${context.operation} took ${context.duration}ms (threshold: ${context.threshold}ms)`, context);
  },
};
