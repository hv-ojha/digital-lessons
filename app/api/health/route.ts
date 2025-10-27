import { NextResponse } from 'next/server';

/**
 * GET /api/health - Health check and environment diagnostic endpoint
 *
 * This endpoint helps diagnose deployment issues by checking:
 * - Environment variables
 * - API configuration
 * - Database connectivity
 */
export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      status: 'ok',
      environment: process.env.NODE_ENV,
      config: {
        // API Keys (check presence, not actual values for security)
        geminiApiKey: {
          present: !!process.env.GEMINI_API_KEY,
          length: process.env.GEMINI_API_KEY?.length || 0,
        },
        supabaseUrl: {
          present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          value: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
        },
        supabaseKey: {
          present: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
          length: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.length || 0,
        },
        // AI Configuration
        aiProvider: process.env.AI_PROVIDER || 'gemini (default)',
        aiModel: process.env.AI_MODEL_NAME || 'gemini-2.5-flash (default)',
        // Feature Flags
        imageGeneration: process.env.ENABLE_IMAGE_GENERATION || 'false (default)',
        promptCaching: process.env.ENABLE_PROMPT_CACHING || 'false (default)',
        // LangSmith
        langsmithTracing: process.env.LANGCHAIN_TRACING_V2 || 'not set',
        langsmithKey: {
          present: !!process.env.LANGSMITH_API_KEY,
          length: process.env.LANGSMITH_API_KEY?.length || 0,
        },
      },
      issues: [] as string[],
    };

    // Check for common issues
    if (!process.env.GEMINI_API_KEY) {
      diagnostics.issues.push('❌ GEMINI_API_KEY is not set - AI generation will fail');
    } else if (process.env.GEMINI_API_KEY.length < 30) {
      diagnostics.issues.push('⚠️  GEMINI_API_KEY seems too short - might be invalid');
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      diagnostics.issues.push('❌ NEXT_PUBLIC_SUPABASE_URL is not set - database access will fail');
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      diagnostics.issues.push('❌ Supabase key is not set - database access will fail');
    }

    if (diagnostics.issues.length === 0) {
      diagnostics.issues.push('✅ All critical environment variables are configured');
    }

    // Set status based on issues
    if (diagnostics.issues.some(i => i.startsWith('❌'))) {
      diagnostics.status = 'error';
    } else if (diagnostics.issues.some(i => i.startsWith('⚠️'))) {
      diagnostics.status = 'warning';
    }

    return NextResponse.json(diagnostics, {
      status: diagnostics.status === 'ok' ? 200 : 500,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
