# Spark - AI-Powered Educational Platform

> **Ignite Learning for Indian Students** - Interactive educational content generation using AI

An educational platform that generates engaging, interactive lessons from simple text prompts using JSON-based structured content. Built with Next.js, TypeScript, Supabase, and Google Gemini AI. Optimized for Indian students and teachers with CBSE/ICSE curriculum support.

## 📋 Project Agenda

This project demonstrates:
- **AI-powered JSON content generation** using Google Gemini 2.5 Flash
- **Flexible content architecture** supporting diverse learning formats
- **95% token optimization** vs traditional code generation approaches
- **Background job processing** with Inngest (no timeout errors)
- **Real-time lesson tracking** with Supabase database
- **Dynamic content rendering** with React components
- **Production observability** with LangSmith tracing
- **Scalable architecture** ready for production use

## ✨ Features

- 🤖 **AI-Generated Interactive Lessons** - Create any type of educational content from simple text prompts
- 🎨 **Flexible Content Blocks** - Mix explanations, tutorials, stories, activities, quizzes, and more
- 📚 **7 Content Formats** - Explanation, Tutorial, Story, Interactive, Assessment, Exploration, Mixed
- ✅ **Automatic Validation** - JSON schema validation with automatic retries
- 🔄 **Real-time Updates** - Watch lessons generate in real-time via Supabase subscriptions
- 🎨 **Inline SVG Illustrations** - AI-generated scalable vector graphics (always enabled, no API calls needed)
- 📊 **LangSmith Tracing** - Full observability of AI calls, token usage, and performance
- 💰 **Cost Optimized** - 95% token reduction vs traditional approaches

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **AI**: Google Gemini 2.5 Flash (JSON generation)
- **Background Jobs**: Inngest (async processing)
- **Observability**: LangSmith for AI call tracing
- **Architecture**: JSON-based structured content with dynamic rendering

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

# Optional - Observability (Recommended)
LANGCHAIN_TRACING_V2=true
LANGSMITH_API_KEY=your-langsmith-key
LANGSMITH_PROJECT=spark-edu
```

### 3. Setup Supabase Database

Run the migrations in the `supabase/migrations/` folder:

```sql
-- 001_initial_schema.sql
-- Creates lessons table with all required fields

-- 002_add_json_support.sql
-- Adds lesson_type and is_json columns for JSON-based lessons
```

Or copy the migrations and run them in your Supabase SQL Editor.

### 4. Run Development Server
```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
app/
├── page.tsx                      # Home page with lesson form
├── lessons/[id]/page.tsx         # Individual lesson view
└── api/
    ├── lessons/                  # Lesson CRUD operations
    └── inngest/                  # Inngest background job endpoint

components/
├── lesson-form.tsx               # Lesson creation form
├── lesson-table.tsx              # Lessons list with status
├── json-lesson-renderer.tsx      # Main JSON renderer router
└── renderers/
    ├── flexible-renderer.tsx     # Flexible content blocks
    ├── quiz-renderer.tsx         # Quiz lessons
    ├── flashcard-renderer.tsx    # Flashcard lessons
    ├── math-renderer.tsx         # Math practice
    ├── reading-renderer.tsx      # Reading lessons
    ├── interactive-renderer.tsx  # Interactive activities
    └── matching-renderer.tsx     # Matching games

lib/
├── ai/                           # AI generation logic
│   ├── generator-json.ts         # JSON lesson generation
│   ├── prompts-creative.ts       # Flexible content prompts
│   ├── prompts-json.ts           # Standard lesson type prompts
│   ├── image-generator.ts        # Image generation
│   ├── config.ts                 # AI configuration
│   └── models/                   # AI model providers
│       ├── factory.ts            # Factory pattern for model selection
│       ├── base.ts               # Base provider interface
│       ├── gemini.ts             # Gemini implementation
│       └── openai.ts             # OpenAI implementation
├── db/
│   └── lessons-server.ts         # Database operations
├── inngest/
│   ├── client.ts                 # Inngest client
│   └── functions.ts              # Background job functions
├── lesson-generation-service.ts  # Unified generation interface
└── execution-mode.ts             # Environment-based execution

types/
├── lesson-content.ts             # Standard lesson types (v1)
└── lesson-content-v2.ts          # Flexible content types (v2)
```

## 🎯 How It Works

1. **User enters lesson outline** (e.g., "Explain how rainbows work" or "Create a quiz about planets")
2. **AI detects format** from keywords (explanation, tutorial, story, quiz, etc.)
3. **AI generates title** using Gemini (~50 tokens)
4. **AI creates structured JSON** for lesson content (~150-200 tokens)
5. **Content is validated** against Zod schemas (automatic retries on errors)
6. **(Optional) AI generates images** for visual content
7. **Lesson is stored** in Supabase as JSON
8. **Dynamic renderer** displays the lesson with appropriate components

## 🎨 Content Types

### Standard Lesson Types (v1)
- **Quiz** - Multiple choice questions with explanations
- **Flashcard** - Study cards with front/back
- **Math** - Math practice problems with hints
- **Reading** - Text content with comprehension questions
- **Interactive** - Step-by-step interactive activities
- **Matching** - Match pairs of related items

### Flexible Content Blocks (v2) ⭐
- **Explanation** - Pure educational content without forced quizzes
- **Tutorial** - Step-by-step how-to guides
- **Story** - Narrative-based learning with characters
- **Interactive** - Hands-on experiments and activities
- **Assessment** - Quizzes and knowledge checks
- **Exploration** - Discovery-based learning
- **Mixed** - Combine any content types

**Content Building Blocks:**
- Text (paragraphs, headings, highlights, quotes)
- Visual (images with captions)
- Question (inline interactive questions)
- Example (demonstrations and examples)
- Activity (hands-on tasks with steps)
- Takeaway (key points summary)
- Story (narrative elements)
- Callout (tips, warnings, fun facts)

## ⚡ Performance & Cost Optimization

### Token Usage - 95% Reduction

| Approach | Tokens/Lesson | Cost/1K @ $0.015/1K | Savings |
|----------|---------------|---------------------|---------|
| Legacy Code Generation | 4,000 | $60.00 | Baseline |
| JSON Standard | 1,060 | $15.90 | 73% |
| JSON Optimized | 188 | $2.82 | 95% |
| **JSON Flexible (Current)** | **~250** | **$3.75** | **94%** |

**Average per lesson:** 200-250 input tokens + 100-200 output tokens = ~400 total
**Cost per lesson:** ~$0.007 (using Gemini 2.5 Flash)
**Annual cost (12K lessons):** ~$85/year (vs $1,200 with code generation)

### Key Optimizations
- JSON-based structured data instead of code generation
- Smart format detection from keywords
- Compact prompts with only relevant schemas
- Optional image generation (disabled by default)
- Automatic retry with error feedback

## 📝 Example Usage

### Simple Explanation
```
"Explain how photosynthesis works"
→ Text blocks + Visuals + Examples + Takeaways
```

### Story-Based Learning
```
"Tell me a story about gravity"
→ Story blocks + Character narrative + Questions
```

### Step-by-Step Tutorial
```
"How to draw a cat"
→ Activity blocks with steps + Materials + Tips
```

### Interactive Activity
```
"Interactive experiment about colors"
→ Activities + Questions + Visuals
```

### Traditional Quiz
```
"Quiz about planets"
→ Questions with multiple choice + Explanations
```

### Mixed Format
```
"Teach me about space with a story and quiz"
→ Story + Text + Visuals + Questions + Takeaways
```

## 🚀 Deployment

### Vercel Deployment

1. **Push code to GitHub**
2. **Import repository in Vercel**
3. **Add environment variables** (all from `.env.local`)
4. **Deploy**

### Background Job Processing with Inngest

Lesson generation takes 5-15 seconds. We use **Inngest** for background processing:

- **No timeout errors:** Handles long-running tasks (up to 5 minutes)
- **Works on free tier:** Including Vercel Hobby plan
- **Automatic retries:** Built-in retry logic on failures
- **Full observability:** Dashboard to monitor all jobs
- **Environment-aware:** Uses sync mode locally, async in production

**Setup:**
1. Sign up at https://www.inngest.com (free tier: 50,000 jobs/month)
2. Get your Event Key from the dashboard
3. Add to environment variables: `INNGEST_EVENT_KEY=your-key`
4. Deploy - Inngest automatically discovers functions via `/api/inngest`

### Quick Diagnostics

Visit `/api/health` to verify configuration:
```
https://your-app.vercel.app/api/health
```

## 🔍 Observability with LangSmith

LangSmith provides detailed tracing of all AI calls:

**What you can track:**
- 📝 Complete prompt/response for every AI call
- 🪙 Exact token usage per request
- ⏱️ Latency metrics
- 🔄 Retry attempts and failures
- 🏷️ Lesson type and format detection
- 🔗 Full call tree (title → content → validation)

**Setup:**
1. Get API key from https://smith.langchain.com
2. Add to `.env.local`:
   ```bash
   LANGCHAIN_TRACING_V2=true
   LANGSMITH_API_KEY=lsv2_pt_...
   LANGSMITH_PROJECT=spark-edu
   ```
3. View traces at https://smith.langchain.com

## 🐛 Troubleshooting

### Lessons Stuck in "Creating" Status

**Most common cause:** Missing `GEMINI_API_KEY`

**Fix:**
1. Visit `https://your-app.vercel.app/api/health`
2. Check `geminiApiKey.present: true`
3. If false, add to Vercel environment variables
4. Redeploy

### Cache Issues During Development

**Symptom:** "Export not found" or type errors after updates

**Fix:**
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
bun dev
```

### Database Connection Issues

**Symptom:** "Failed to fetch lessons" error

**Fix:** Check Supabase environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 📦 Feature Flags

### Content Generation

The app uses **JSON-based generation with flexible content blocks** (always enabled). This provides:
- 95% token reduction vs legacy approaches
- Support for any educational format (explanations, tutorials, stories, quizzes, etc.)
- Adapts automatically to any prompt
- No configuration needed!

### Visual Content (SVG)

**Always enabled** - No configuration needed!

The AI automatically generates inline SVG illustrations when appropriate:
- ✅ **Zero cost** - No separate API calls
- ✅ **Instant** - Generated with lesson content
- ✅ **Scalable** - Perfect quality at any size
- ✅ **Lightweight** - Text-based, minimal storage
- ✅ **Educational** - Simple, colorful diagrams

SVGs are perfect for:
- Scientific diagrams (solar system, water cycle, etc.)
- Math illustrations (shapes, graphs, etc.)
- Concept visualizations (networks, processes, etc.)

## 🔑 Get API Keys

- **Gemini:** https://aistudio.google.com/app/apikey
- **Supabase:** https://supabase.com/dashboard → Project Settings → API
- **LangSmith (optional):** https://smith.langchain.com → Settings → API Keys
- **Inngest (production):** https://www.inngest.com/dashboard → Settings → Keys

## 📊 Environment Variables Checklist

### Required (Production)
- ✅ `GEMINI_API_KEY` - AI model API key
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Database URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Database key
- ✅ `INNGEST_EVENT_KEY` - Background job processing

### Recommended
- `LANGCHAIN_TRACING_V2=true` - Enable LangSmith tracing
- `LANGSMITH_API_KEY` - For AI observability
- `LANGSMITH_PROJECT=spark-edu`

### Optional
- `AI_PROVIDER=gemini` - Change AI provider
- `AI_MODEL_NAME=gemini-2.5-flash` - Change model

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

## 📚 Documentation

- **FLEXIBLE_CONTENT.md** - Complete guide to flexible content system
- **TESTING_FLEXIBLE_CONTENT.md** - Testing guide with example prompts
- **EXECUTION_MODE.md** - Environment-based execution details
- **OBSERVABILITY_SETUP.md** - LangSmith integration guide
- **LANGSMITH_VERIFICATION.md** - Verification and troubleshooting

## 📝 Assignment Notes

This project was created as part of the Astral assignment to demonstrate:

1. **AI Integration** - Practical use of LLMs for educational content
2. **Cost Optimization** - 95% token reduction through JSON-based approach
3. **Flexible Architecture** - Support for any educational content format
4. **Production Patterns** - Validation, retries, observability, background jobs
5. **Real-world Challenges** - Handling timeouts, errors, deployment
6. **Scalability** - Ready for production use with efficient resource usage

## ✨ Key Achievements

- ✅ **95% token reduction** from initial implementation
- ✅ **JSON-based generation** for reliability and consistency
- ✅ **Flexible content system** supporting unlimited formats
- ✅ **Environment-aware execution** (sync local, async production)
- ✅ **Full observability** with LangSmith tracing
- ✅ **Background job processing** with Inngest
- ✅ **Production-ready** architecture

## 🔮 Future Improvements

- [ ] Support for more AI providers (Anthropic Claude, etc.)
- [ ] Prompt caching for additional token savings
- [ ] User authentication and lesson ownership
- [ ] Lesson sharing and embedding
- [ ] Analytics dashboard for usage and costs
- [ ] Multi-language support
- [ ] Video and audio content blocks
- [ ] Batch lesson generation

## 📄 License

Created for Astral assignment.

---

**Made for curious learners** 📚 **Built with efficiency in mind** 💰

