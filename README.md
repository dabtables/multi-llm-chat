# Multi-LLM Arena & Chatbot

A high-performance **Next.js 14 + Supabase** application powered by **OpenRouter**. It enables users to dispatch a single prompt to **multiple LLMs simultaneously**, displaying parallel side-by-side responses with real-time benchmarks: **input tokens, output tokens, latency, and generation cost**.

---

## ✨ Features

1. **PIN Code Login**:
   - Access is gated by a secure numeric PIN configured in `.env` (`APP_PIN`).
   - Issues a secure, tamper-proof, HTTP-only JWT session cookie (`jose`).
   - Clean glassmorphism PIN keypad with keyboard support and error shake animation.

2. **Parallel Multi-LLM Execution via OpenRouter**:
   - Connects to OpenRouter's API (`/api/v1/chat/completions`).
   - Select multiple models (e.g., Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Flash, Llama 3.3 70B, DeepSeek V3).
   - Parallel prompt dispatching with `Promise.all`.

3. **Per-Message Token, Cost & Latency Metrics**:
   - Every model response includes a small **Metrics** icon (`BarChart2`).
   - Clicking the icon opens a detailed breakdown:
     - **Prompt (Input) Tokens**
     - **Completion (Output) Tokens**
     - **Total Tokens**
     - **Response Latency (ms)**
     - **Billed Cost ($ USD)**
     - **OpenRouter Generation ID**
     - **Supabase Persistence Status**

4. **Multi-Model UI & Flexible Layouts**:
   - **Grid View**: Side-by-side responsive multi-column comparison.
   - **Tabs View**: Tabbed flicking between models.
   - **Stacked View**: Clean vertically stacked cards.
   - Markdown rendering with code highlighting, copy button, and error fallbacks.

5. **Supabase Database Persistence**:
   - All conversations, messages, and model response metrics (`prompt_tokens`, `completion_tokens`, `total_tokens`, `cost`, `latency_ms`, `status`) are saved to Supabase.
   - Slide-over Chat History drawer to review past sessions.
   - Graceful local-mode fallback if Supabase credentials are not configured yet.

6. **Clean Aesthetics with Soft Gradients**:
   - Modern glassmorphism panels, soft ambient mesh gradients (subtle violet, rose, emerald, sky).
   - High-contrast typography and smooth animations.

7. **Vercel-Ready Deployment**:
   - Next.js App Router with TypeScript and zero external binary dependencies.
   - Ready for one-click deployment on Vercel.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
# 1. PIN Authentication (default is 2468)
APP_PIN=2468
PIN_SESSION_SECRET=super_secret_session_jwt_key_32_characters_long_min

# 2. OpenRouter API Key (https://openrouter.ai/keys)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=Multi-LLM Chat

# 3. Supabase Credentials (https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 3. Run Supabase Database Migration
Open your Supabase project dashboard -> **SQL Editor** -> **New query**, and paste the contents of:
[`supabase/schema.sql`](supabase/schema.sql)

This creates:
- `conversations` table
- `messages` table
- `model_responses` table (with token metrics, cost, latency, and status)
- Indexes & Row Level Security (RLS) policies

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
Enter PIN `2468` to unlock.

---

## ☁️ Deploying to Vercel

1. Push your code to a GitHub / GitLab repository.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the repository.
3. In **Environment Variables**, add:
   - `APP_PIN`
   - `PIN_SESSION_SECRET`
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_SITE_URL` (your production URL, e.g. `https://my-llm-chat.vercel.app`)
   - `OPENROUTER_SITE_NAME`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**. Vercel will build and host the app automatically!
