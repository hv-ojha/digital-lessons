/**
 * Inngest Client Configuration
 *
 * Inngest handles background job processing for lesson generation,
 * allowing us to bypass Vercel's serverless function timeout limits.
 */

import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'spark-edu',
  name: 'Spark',
});
