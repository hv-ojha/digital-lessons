/**
 * Execution Mode Detection
 *
 * Determines whether to run lesson generation synchronously (local dev)
 * or asynchronously via Inngest (production).
 *
 * Benefits:
 * - Local: Faster development, immediate feedback, no Inngest setup needed
 * - Production: Handles long-running tasks, avoids serverless timeouts
 */

/**
 * Check if we should use Inngest for async execution
 *
 * Uses Inngest when:
 * - Running in production (VERCEL_ENV === 'production')
 * - OR explicitly enabled via USE_INNGEST=true
 *
 * Runs synchronously when:
 * - Running locally (NODE_ENV === 'development' and no VERCEL_ENV)
 * - OR explicitly disabled via USE_INNGEST=false
 */
export function shouldUseInngest(): boolean {
  // Explicit override
  if (process.env.USE_INNGEST !== undefined) {
    return process.env.USE_INNGEST === 'true';
  }

  // Use Inngest in production environments
  if (process.env.VERCEL_ENV === 'production') {
    return true;
  }

  // Use Inngest in preview/staging environments (optional)
  if (process.env.VERCEL_ENV === 'preview') {
    return true; // Change to false if you want sync execution in preview
  }

  // Local development - run synchronously by default
  if (process.env.NODE_ENV === 'development') {
    return false;
  }

  // Default to async for safety
  return true;
}

/**
 * Get execution mode as string (for logging)
 */
export function getExecutionMode(): string {
  return shouldUseInngest() ? 'async (Inngest)' : 'sync (direct)';
}

/**
 * Get environment name
 */
export function getEnvironment(): string {
  return process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown';
}

/**
 * Log execution mode configuration
 */
export function logExecutionMode(): void {
  console.log('\n🔧 [EXECUTION MODE] Configuration:');
  console.log(`   Environment: ${getEnvironment()}`);
  console.log(`   Mode: ${getExecutionMode()}`);
  console.log(`   USE_INNGEST: ${process.env.USE_INNGEST || 'auto'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`   VERCEL_ENV: ${process.env.VERCEL_ENV || 'not set'}\n`);
}
