# Digital Lessons - AI-Powered Educational Platform

An interactive educational platform that generates engaging lessons using AI. Built with Next.js, TypeScript, Supabase, and Google Gemini.

## Features

- AI-generated interactive lessons from simple text prompts
- Real-time lesson generation with status updates
- Safe code execution for educational content
- Support for quizzes, explanations, and visual content
- Image generation for visual lessons

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.5 Flash (text & image generation)
- **Monitoring**: LangSmith tracing

## Quick Start

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Setup environment variables**

   Create `.env.local`:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key

   # AI Model
   AI_PROVIDER=gemini
   AI_MODEL_NAME=gemini-2.5-flash
   GEMINI_API_KEY=your-gemini-api-key

   # Feature Flags
   ENABLE_IMAGE_GENERATION=false  # Set to true to enable AI image generation

   # LangSmith (optional)
   LANGCHAIN_TRACING_V2=true
   LANGSMITH_API_KEY=your-langsmith-key
   LANGSMITH_PROJECT=digital-lessons
   ```

3. **Setup Supabase database**

   Run the SQL migration in Supabase dashboard:
   ```sql
   -- Located in: supabase/migrations/001_create_lessons_table.sql
   ```

4. **Run development server**
   ```bash
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── page.tsx                  # Home page
├── lessons/[id]/page.tsx     # Lesson view
└── api/lessons/              # API routes

components/
├── lesson-form.tsx           # Lesson creation form
├── lesson-table.tsx          # Lessons list
└── lesson-renderer.tsx       # Safe code renderer

lib/
├── ai/                       # AI generation logic
│   ├── generator.ts          # Lesson generation
│   ├── image-generator.ts    # Image generation
│   ├── prompts.ts            # AI prompts
│   └── models/               # Model providers
├── db/lessons.ts             # Database operations
└── supabase/                 # Supabase clients
```

## How It Works

1. User enters lesson outline (e.g., "A 10 question quiz on planets")
2. AI generates a catchy title
3. AI creates TypeScript/React code for the lesson
4. (Optional) AI generates images for visual content (if enabled)
5. Code is validated for safety
6. Lesson is stored in database and rendered

## Performance Optimizations

### Optimized AI Prompts

The system uses highly optimized prompts that reduce token consumption by ~65%:
- System prompt: ~1,200 tokens (was ~3,500)
- User prompt: ~100 tokens (was ~400)
- **Result:** Significantly lower API costs and faster responses

### Token Usage Per Lesson

Approximate token consumption:
- **Title generation**: ~100 tokens
- **Lesson code generation**: ~1,300-1,500 tokens (first attempt)
- **Retries** (if needed): ~1,400-1,600 tokens each
- **Total average**: ~2,000-3,000 tokens per lesson

## Feature Flags

### Image Generation

By default, AI image generation is **disabled** to save time and API costs.

**To enable:**
```bash
# In .env.local
ENABLE_IMAGE_GENERATION=true
```

**Benefits of disabling (default):**
- ⚡ Faster lesson generation
- 💰 Lower API costs
- 🚀 Simpler lessons without images

**When to enable:**
- Want visual diagrams in lessons
- Teaching visual subjects (geography, biology, etc.)
- Need illustrations for kids

## API Keys

Get your API keys:
- **Gemini**: https://aistudio.google.com/app/apikey
- **Supabase**: https://supabase.com/dashboard
- **LangSmith** (optional): https://smith.langchain.com

## Deployment

Deploy to Vercel:

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables (see .env.example)
4. Deploy

### Important: Serverless Function Configuration

**Lesson generation takes 15-30 seconds.** The app is configured with:

- **`vercel.json`**: Sets 60-second timeout for lesson generation routes
- **Synchronous generation**: API waits for AI generation to complete before responding
- **Vercel Pro plan recommended**: Hobby plan has 10-second limit (too short for AI generation)

If you're on Hobby plan and hitting timeouts, consider:
- Upgrading to Pro plan ($20/month, 60-second timeout)
- Or optimizing prompts further to reduce generation time

### Troubleshooting Deployment Issues

If your deployed app is not working:

1. **Enable LangSmith tracing** (RECOMMENDED):
   - Add to Vercel environment variables:
     ```
     LANGCHAIN_TRACING_V2=true
     LANGSMITH_API_KEY=your-langsmith-key
     LANGSMITH_PROJECT=digital-lessons
     ```
   - Get API key from: https://smith.langchain.com
   - View all AI calls and errors in real-time
   - See [LANGSMITH_DEBUGGING_GUIDE.md](./LANGSMITH_DEBUGGING_GUIDE.md)

2. **Check health endpoint:** Visit `https://your-app.vercel.app/api/health`
3. **View detailed logs:** Vercel Dashboard → Your Project → Logs
4. **Read troubleshooting guide:** See [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md)

Common issues:
- ❌ Missing `GEMINI_API_KEY` environment variable
- ❌ Missing Supabase environment variables
- ❌ Serverless function timeout (upgrade to Vercel Pro if needed)

## License

Created as part of Astral assignment.

---

Made for curious learners 📚
