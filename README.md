# Voxflow

Built by **Hassan Khan**.

Collect video answers without scheduling meetings. Create a flow, share a link, and people record responses on their own time. AI can ask a follow-up after each answer and summarize responses in the dashboard.

## Problem

Hiring, sales, and feedback often get stuck on calendar back-and-forth. Voxflow replaces that with a single link — respondents record video, audio, or text answers in the browser, and you review everything from the dashboard.

## Features

- **Flow builder** — video, audio, and text questions
- **Public link** — anyone can respond at `/f/your-slug`
- **Recording** — record from camera/mic or upload a file
- **AI** — optional follow-up questions and response summaries
- **Dashboard** — responses, analytics, and notes

## Tech

| Part | Stack |
|------|-------|
| Frontend | Next.js, TypeScript, Tailwind |
| Backend | NestJS, Prisma |
| Database | PostgreSQL |
| Queue | Redis (AI processing) |

## Setup

You need Docker, Node.js 20+, and npm.

```bash
git clone https://github.com/Hassankhand10/voxflow.git
cd voxflow

docker compose up -d

cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
cd ..

cp .env.example .env.local
npm install
npm run dev
```

- App: http://localhost:3000  
- API: http://localhost:4000/api  

**Demo login:** `demo@voxflow.app` / `password123`  
**Sample public flow:** http://localhost:3000/f/senior-react-dev

## OpenAI (optional)

Add `OPENAI_API_KEY` in `backend/.env` for real follow-up questions and summaries. Without a key, the app still works using built-in fallback logic.

## Commands

```bash
npm run dev          # frontend + API
npm run docker:up    # postgres + redis
npm run db:seed      # reset demo data
```

## Project structure

```
voxflow/
├── src/           Next.js app
├── backend/       NestJS API
└── docker-compose.yml
```
