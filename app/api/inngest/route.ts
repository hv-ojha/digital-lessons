/**
 * Inngest API Route
 *
 * This endpoint serves the Inngest functions to the Inngest platform.
 * Inngest uses this endpoint to:
 * 1. Discover available functions
 * 2. Execute functions when events are triggered
 * 3. Handle retries and error handling
 *
 * URL: /api/inngest
 */

import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { inngestFunctions } from '@/lib/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});
