# Observability Module

This module provides structured logging with correlation IDs for the Spark application.

## Overview

The observability module uses a simple, lightweight approach:

- **Structured JSON logging** to stdout/stderr
- **Correlation IDs** for request tracing across services
- **Enhanced LangSmith metadata** for AI call debugging
- **Inngest job tracking** with detailed step logging

All logs are output as JSON, making them compatible with any log aggregation service (Vercel Logs, Datadog, CloudWatch, etc.).

## Files

- **[logger.ts](./logger.ts)** - Structured logging utility with correlation ID support

## Quick Start

### 1. Configure Log Level (Optional)

```bash
# In your .env file
LOG_LEVEL=info  # debug, info, warn, error
```

### 2. Use in Your Code

```typescript
import { generateCorrelationId, aiLogger, inngestLogger } from '@/lib/observability/logger';

// Generate correlation ID for request tracing
const correlationId = generateCorrelationId();

// Log AI call
aiLogger.callStarted({
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  operation: 'title_generation',
  correlationId,
});

aiLogger.callCompleted({
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  operation: 'title_generation',
  correlationId,
  duration: 1234,
  result: 'Amazing Lesson Title',
});
```

## Logger API

### AI Call Logging

```typescript
import { aiLogger } from '@/lib/observability/logger';

// Log when AI call starts
aiLogger.callStarted({
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  operation: 'title_generation',
  correlationId,
  prompt: 'Generate a title...',
});

// Log when AI call completes
aiLogger.callCompleted({
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  operation: 'title_generation',
  correlationId,
  duration: 1234,
  result: 'Amazing Lesson Title',
});

// Log when AI call fails
aiLogger.callFailed({
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  operation: 'title_generation',
  correlationId,
  duration: 1234,
  error: new Error('API rate limit exceeded'),
  retryCount: 1,
  willRetry: true,
});

// Log retry attempt
aiLogger.retryAttempt({
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  operation: 'content_generation',
  correlationId,
  retryCount: 1,
  maxRetries: 2,
  reason: 'JSON parsing failed',
});

// Log validation failure
aiLogger.validationFailed({
  operation: 'content_generation',
  correlationId,
  validationErrors: ['Missing required field: title'],
  rawResponse: '{\"invalid\": \"json\"...',
});
```

### Inngest Job Logging

```typescript
import { inngestLogger } from '@/lib/observability/logger';

// Log job start
inngestLogger.jobStarted({
  jobId: '01HX...',
  jobName: 'generate-lesson',
  eventName: 'lesson/generate.requested',
  correlationId,
  lessonId,
  eventData: { outline, lessonId },
});

// Log job completion
inngestLogger.jobCompleted({
  jobId: '01HX...',
  jobName: 'generate-lesson',
  correlationId,
  lessonId,
  duration: 45678,
  result: { success: true, contentLength: 5000 },
});

// Log job failure
inngestLogger.jobFailed({
  jobId: '01HX...',
  jobName: 'generate-lesson',
  correlationId,
  lessonId,
  duration: 12345,
  error: new Error('Database connection failed'),
  retryCount: 1,
  willRetry: true,
});

// Log step execution
inngestLogger.stepStarted({
  jobId: '01HX...',
  jobName: 'generate-lesson',
  stepName: 'generate-ai-content',
  stepNumber: 1,
  correlationId,
  lessonId,
});

inngestLogger.stepCompleted({
  jobId: '01HX...',
  jobName: 'generate-lesson',
  stepName: 'generate-ai-content',
  stepNumber: 1,
  correlationId,
  lessonId,
  duration: 12345,
});

inngestLogger.stepFailed({
  jobId: '01HX...',
  jobName: 'generate-lesson',
  stepName: 'update-database',
  stepNumber: 2,
  correlationId,
  lessonId,
  error: new Error('Timeout'),
});
```

### Lesson Generation Logging

```typescript
import { lessonLogger } from '@/lib/observability/logger';

// Log generation start
lessonLogger.generationStarted({
  lessonId,
  correlationId,
  outline: 'Teach about...',
  mode: 'async', // or 'sync'
});

// Log generation complete
lessonLogger.generationCompleted({
  lessonId,
  correlationId,
  duration: 45678,
  lessonType: 'flexible',
  contentLength: 5000,
  tokens: 1250,
});

// Log generation failure
lessonLogger.generationFailed({
  lessonId,
  correlationId,
  duration: 12345,
  error: new Error('AI call failed'),
  phase: 'ai_generation',
});

// Log title generated
lessonLogger.titleGenerated({
  lessonId,
  correlationId,
  title: 'Amazing Lesson',
  duration: 1234,
});

// Log content generated
lessonLogger.contentGenerated({
  lessonId,
  correlationId,
  duration: 34567,
  contentLength: 5000,
  lessonType: 'flexible',
});
```

### Error Logging

```typescript
import { errorLogger } from '@/lib/observability/logger';

// Log API error
errorLogger.apiError({
  endpoint: '/api/lessons',
  method: 'POST',
  statusCode: 500,
  error: new Error('Internal server error'),
  correlationId,
});

// Log database error
errorLogger.databaseError({
  operation: 'insert',
  table: 'lessons',
  error: new Error('Connection timeout'),
  correlationId,
  lessonId,
});

// Log unexpected error
errorLogger.unexpectedError({
  location: 'generateLessonJson',
  error: new Error('Unexpected error'),
  correlationId,
});
```

### Performance Logging

```typescript
import { perfLogger } from '@/lib/observability/logger';

// Measure operation
perfLogger.measure({
  operation: 'generateLesson',
  duration: 45678,
  correlationId,
  metadata: { tokens: 1250, lessonType: 'flexible' },
});

// Log slow operation
perfLogger.slowOperation({
  operation: 'databaseQuery',
  duration: 5000,
  threshold: 1000,
  correlationId,
});
```

## Correlation IDs

Every operation should have a unique correlation ID for tracing:

```typescript
import { generateCorrelationId } from '@/lib/observability/logger';

const correlationId = generateCorrelationId();
// Returns: "1701234567890-abc123def456"
```

Use the same correlation ID throughout the request lifecycle:
- API request
- Inngest job
- AI calls
- Database operations
- Logs
- LangSmith traces

## Log Levels

Control verbosity with the `LOG_LEVEL` environment variable:

- `debug`: All logs including verbose debugging
- `info`: Standard operational logs (default)
- `warn`: Warnings and errors
- `error`: Only errors

```bash
# Development
LOG_LEVEL=debug

# Production
LOG_LEVEL=info
```

## Log Output Format

All logs are output as JSON:

```json
{
  "level": "INFO",
  "time": "2024-01-15T10:30:45.123Z",
  "type": "ai_call_started",
  "provider": "gemini",
  "model": "gemini-2.5-flash",
  "operation": "title_generation",
  "correlationId": "1701234567890-abc123",
  "msg": "🤖 AI Call Started: title_generation"
}
```

## Integration Points

### Already Integrated

✅ [lib/ai/generator-json.ts](../ai/generator-json.ts)
- Title generation
- Content generation
- Validation tracking
- Retry monitoring

✅ [lib/inngest/functions.ts](../inngest/functions.ts)
- Job execution tracking
- Step-by-step logging
- Error handling

## Viewing Logs

### Local Development

Logs are output to the console in JSON format. You can pipe them through tools like `jq` for pretty formatting:

```bash
npm run dev 2>&1 | grep -v "^{" || npm run dev 2>&1 | jq .
```

### Production (Vercel)

1. Go to your Vercel project dashboard
2. Click on **Logs** tab
3. Filter by log level, time range, or search for correlation IDs
4. All structured JSON fields are searchable

Example search:
```
correlationId:"1701234567890-abc123"
type:"ai_call_failed"
```

### Other Platforms

The JSON log format is compatible with all major log aggregation services:

- **Datadog**: Automatically parses JSON logs
- **AWS CloudWatch**: Use CloudWatch Insights to query JSON logs
- **Google Cloud Logging**: JSON logs are indexed automatically
- **Splunk**: JSON logs are parsed and fields are extractable

## LangSmith Integration

All LangSmith traces include correlation IDs in metadata, allowing you to:

1. Find a failed request in your logs
2. Get the correlation ID
3. Search LangSmith for traces with that correlation ID
4. View the full AI call trace with prompts and responses

Example metadata in LangSmith:
```json
{
  "correlationId": "1701234567890-abc123",
  "provider": "gemini",
  "model": "gemini-2.5-flash",
  "operation": "title_generation",
  "environment": "production"
}
```

## Best Practices

1. **Always use correlation IDs** for request tracing
2. **Log at appropriate levels** (debug for verbose, info for normal)
3. **Include context** in all logs (lessonId, userId, etc.)
4. **Use structured logging** (objects, not string concatenation)
5. **Handle errors properly** (log with full error details)
6. **Track retries** with willRetry flag
7. **Don't log sensitive data** (API keys, user passwords, etc.)

## Example: Full Request Trace

```typescript
import { generateCorrelationId, aiLogger, inngestLogger, lessonLogger } from '@/lib/observability/logger';

async function myFunction() {
  const correlationId = generateCorrelationId();
  const startTime = Date.now();

  lessonLogger.generationStarted({
    lessonId: 'lesson-123',
    correlationId,
    outline: 'Teach about...',
    mode: 'async',
  });

  aiLogger.callStarted({
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    operation: 'title_generation',
    correlationId,
  });

  try {
    // Your code here
    const duration = Date.now() - startTime;

    aiLogger.callCompleted({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      operation: 'title_generation',
      correlationId,
      duration,
      result: 'Amazing Title',
    });

    lessonLogger.generationCompleted({
      lessonId: 'lesson-123',
      correlationId,
      duration,
      lessonType: 'flexible',
      contentLength: 5000,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    aiLogger.callFailed({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      operation: 'title_generation',
      correlationId,
      duration,
      error: error as Error,
    });

    lessonLogger.generationFailed({
      lessonId: 'lesson-123',
      correlationId,
      duration,
      error: error as Error,
    });
  }
}
```

This will produce a searchable log trail that you can trace through any log aggregation service using the correlation ID.
