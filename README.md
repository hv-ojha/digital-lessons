# Digital Lessons - AI-Powered Educational Platform

> **Assignment for Astral** - Interactive educational content generation using AI

An educational platform that generates engaging, interactive lessons from simple text prompts. Built with Next.js, TypeScript, Supabase, and Google Gemini AI.

## 📋 Project Agenda

This project demonstrates:
- **AI-powered content generation** using Google Gemini 2.5 Flash
- **Pluggable AI architecture** with factory pattern (easy to switch models)
- **Background job processing** with Inngest (no timeout errors, works on free tier)
- **Real-time lesson tracking** with Supabase database
- **Type-safe code generation** with validation and automatic retries
- **Production observability** with LangSmith tracing + Inngest dashboard
- **Token optimization** (65% reduction from initial implementation)
- **Scalable architecture** for production use

## ✨ Features

- 🤖 **AI-Generated Interactive Lessons** - Create engaging educational content from simple text prompts
- 🎨 **Auto-Generated UI** - Lessons include quizzes, explanations, and visual content
- ✅ **Code Validation** - Automatic TypeScript validation with retry mechanism
- 🔄 **Real-time Updates** - Watch lessons generate in real-time via Supabase subscriptions
- 🖼️ **Optional Image Generation** - AI-generated images using Gemini 2.5 Flash Image (disabled by default for cost savings)
- 📊 **LangSmith Tracing** - Full observability of AI calls, token usage, and model performance
- 🔌 **Pluggable AI Models** - Easy switching between Gemini, OpenAI, or Anthropic

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **AI**: Google Gemini 2.5 Flash (text & image generation)
- **Observability**: LangSmith for AI call tracing
- **Architecture**: Factory pattern for pluggable AI providers

## 🚀 Quick Start

### 1. Install Dependencies
```bash
bun install
```

### 2. Setup Environment Variables

Create `.env.local`:
```bash
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Required - AI Model
GEMINI_API_KEY=your-gemini-api-key

# Optional - AI Configuration
AI_PROVIDER=gemini                    # Options: gemini, openai, anthropic
AI_MODEL_NAME=gemini-2.5-flash       # Default model

# Optional - Feature Flags
ENABLE_IMAGE_GENERATION=false         # Set to true to enable AI image generation

# Optional - Observability (Recommended for debugging)
LANGCHAIN_TRACING_V2=true
LANGSMITH_API_KEY=your-langsmith-key
LANGSMITH_PROJECT=digital-lessons
```

### 3. Setup Supabase Database

Run this SQL in your Supabase SQL Editor:
```sql
-- Create lessons table
create table lessons (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  outline text not null,
  content text,
  status text not null default 'generating',
  error text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table lessons enable row level security;

-- Create policy for public access (adjust for your auth needs)
create policy "Allow public access" on lessons
  for all using (true);

-- Create index for performance
create index lessons_status_idx on lessons(status);
create index lessons_created_at_idx on lessons(created_at desc);
```

### 4. Run Development Server
```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
app/
├── page.tsx                  # Home page with lesson form
├── lessons/[id]/page.tsx     # Individual lesson view
└── api/
    ├── health/               # Diagnostic endpoint
    ├── lessons/              # Lesson CRUD operations
    └── lessons/[id]/retry/   # Retry failed lessons

components/
├── lesson-form.tsx           # Lesson creation form
├── lesson-table.tsx          # Lessons list with status
└── lesson-renderer.tsx       # Safe code execution & rendering

lib/
├── ai/                       # AI generation logic
│   ├── generator.ts          # Main lesson generation (with LangSmith tracing)
│   ├── image-generator.ts    # Image generation (Gemini 2.5 Flash Image)
│   ├── prompts.ts            # Optimized AI prompts (~65% token reduction)
│   ├── validation.ts         # TypeScript code validation
│   ├── config.ts             # AI configuration
│   └── models/               # Pluggable model providers
│       ├── factory.ts        # Factory pattern for model selection
│       ├── base.ts           # Base provider interface
│       ├── gemini.ts         # Gemini implementation
│       └── openai.ts         # OpenAI implementation
├── db/lessons.ts             # Database operations
└── supabase/                 # Supabase clients (server & browser)
```

## 🎯 How It Works

1. **User enters lesson outline** (e.g., "A 10 question quiz on planets")
2. **AI generates catchy title** using Gemini (~100 tokens)
3. **AI creates TypeScript/React code** for interactive lesson (~1,300-3,000 tokens)
4. **Code is validated** for safety and correctness
5. **Auto-retry on errors** (up to 3 attempts with specific error feedback)
6. **(Optional) AI generates images** for visual content (if enabled)
7. **Lesson is stored** in Supabase and rendered safely

## ⚡ Performance Optimizations

### Token Usage Reduction (~65%)

Optimized prompts significantly reduce token consumption:

| Component | Before | After | Savings |
|-----------|--------|-------|---------|
| System Prompt | ~3,500 tokens | ~1,200 tokens | 66% |
| User Prompt | ~400 tokens | ~100 tokens | 75% |
| **Total per request** | ~3,900 tokens | ~1,300 tokens | **67%** |

**Average per lesson:** 2,000-3,000 total tokens (including retries)
**Cost per lesson:** ~$0.003-0.005 (using Gemini 2.5 Flash)

### Key Optimizations
- Removed verbose explanations from prompts
- Condensed design system rules
- Pattern-based validation instead of compilation
- Disabled image generation by default (saves time & cost)

## 🔌 Switching AI Models

Thanks to the factory pattern, switching AI providers is simple:

```bash
# Use OpenAI instead of Gemini
AI_PROVIDER=openai
AI_MODEL_NAME=gpt-4-turbo
OPENAI_API_KEY=sk-...

# Or use Anthropic
AI_PROVIDER=anthropic
AI_MODEL_NAME=claude-3-5-sonnet-20241022
ANTHROPIC_API_KEY=sk-ant-...
```

All AI calls automatically route through the selected provider with LangSmith tracing maintained.

## 🔍 Observability with LangSmith

LangSmith provides detailed tracing of all AI calls:

**What you can track:**
- 📝 Complete prompt/response for every AI call
- 🪙 Exact token usage per request
- ⏱️ Latency metrics
- 🔄 Retry attempts and failures
- 🏷️ Model metadata (provider, model name, temperature)
- 🔗 Full call tree (title → code → validation)

**Setup:**
1. Get API key from https://smith.langchain.com
2. Add to `.env.local`:
   ```bash
   LANGCHAIN_TRACING_V2=true
   LANGSMITH_API_KEY=lsv2_pt_...
   LANGSMITH_PROJECT=digital-lessons
   ```
3. View traces at https://smith.langchain.com

## 🚀 Deployment

### Vercel Deployment

1. **Push code to GitHub**
2. **Import repository in Vercel**
3. **Add environment variables** (all from `.env.local`)
4. **Deploy**

### 🎉 Background Job Processing with Inngest

**Lesson generation takes 15-30 seconds.** To handle this, we use **Inngest** for background job processing:

- **No timeout errors:** Inngest handles long-running tasks (up to 5 minutes)
- **Works on ANY Vercel plan:** Including free Hobby plan
- **Automatic retries:** Built-in retry logic on failures
- **Full observability:** Dashboard to monitor all jobs
- **Keeps LangSmith:** All AI tracing still works perfectly

**How it works:**
1. User creates lesson → API returns immediately (< 1 second)
2. Inngest processes generation in background (15-30 seconds)
3. Frontend receives real-time updates via Supabase subscriptions

**Setup:**
1. Sign up at https://www.inngest.com (free tier: 50,000 jobs/month)
2. Get your Event Key from the dashboard
3. Add to environment variables: `INNGEST_EVENT_KEY=your-key`
4. Deploy - Inngest automatically discovers your functions via `/api/inngest`

### Quick Diagnostics

Visit `/api/health` on your deployed app to verify configuration:
```
https://your-app.vercel.app/api/health
```

This shows:
- ✅ Environment variables status
- ✅ API keys configuration
- ✅ Feature flags
- ❌ Missing configuration issues

## 🐛 Troubleshooting

### Lessons Stuck in "Creating" Status

**Most common cause:** Missing `GEMINI_API_KEY`

**Fix:**
1. Visit `https://your-app.vercel.app/api/health`
2. Check `geminiApiKey.present: true`
3. If false, add to Vercel environment variables
4. Redeploy

### Background Job Not Processing

**Symptom:** Lessons stuck in "Creating" status, no errors in logs

**Cause:** Inngest not configured or not discovering functions

**Fix:**
1. Verify `INNGEST_EVENT_KEY` is set in Vercel environment variables
2. Check Inngest dashboard at https://www.inngest.com/dashboard
3. Verify `/api/inngest` endpoint is accessible
4. Check Inngest logs for any function discovery errors

### Database Connection Issues

**Symptom:** "Failed to fetch lessons" error

**Fix:** Check Supabase environment variables are set:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Look for `[LESSON <id>]` messages
3. Check for errors or missing environment variables

## 📦 Feature Flags

### Image Generation

By default, AI image generation is **disabled** to save time and API costs.

**To enable:**
```bash
# In .env.local
ENABLE_IMAGE_GENERATION=true
```

**Benefits of disabling (default):**
- ⚡ Faster lesson generation (15s vs 30s)
- 💰 Lower API costs
- 🚀 Simpler lessons without images

**When to enable:**
- Need visual diagrams in lessons
- Teaching visual subjects (geography, biology, etc.)
- Want illustrations for kids

## 🔑 Get API Keys

- **Gemini:** https://aistudio.google.com/app/apikey
- **Supabase:** https://supabase.com/dashboard → Project Settings → API
- **LangSmith (optional):** https://smith.langchain.com → Settings → API Keys

## 📊 Environment Variables Checklist

### Required (Production)
- ✅ `GEMINI_API_KEY` - AI model API key
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Database URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Database key
- ✅ `INNGEST_EVENT_KEY` - Background job processing (leave empty for local dev)

### Optional (Recommended)
- `LANGCHAIN_TRACING_V2=true` - Enable LangSmith tracing
- `LANGSMITH_API_KEY` - For AI observability
- `LANGSMITH_PROJECT=digital-lessons`

### Optional (Advanced)
- `AI_PROVIDER=gemini` - Change AI provider
- `AI_MODEL_NAME=gemini-2.5-flash` - Change model
- `ENABLE_IMAGE_GENERATION=false` - Toggle image gen
- `OPENAI_API_KEY` - If using OpenAI
- `ANTHROPIC_API_KEY` - If using Anthropic

## 🧪 Development

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build

# Type check
bun run type-check

# Lint
bun run lint
```

## 📝 Assignment Notes

This project was created as part of the Astral assignment to demonstrate:

1. **AI Integration** - Practical use of LLMs for content generation
2. **Production Patterns** - Factory pattern, validation, retries, observability
3. **Cost Optimization** - 65% token reduction through prompt engineering
4. **Real-world Challenges** - Handling timeouts, validation errors, deployment issues
5. **Scalability** - Architecture ready for background jobs and multiple AI providers

## 🔮 Future Improvements

- [x] Background job processing with Inngest (implemented!)
- [ ] Support for more AI providers (Anthropic Claude, etc.)
- [ ] Prompt caching for 90% token savings (requires Vertex AI)
- [ ] User authentication and lesson ownership
- [ ] Lesson sharing and embedding
- [ ] Analytics dashboard for token usage
- [ ] Batch lesson generation
- [ ] Lesson templates and presets

## 📄 License

Created for Astral assignment.

---

**Made for curious learners** 📚
