# Voxflow

**Hassan Khan**

Video answers bina meeting schedule kiye collect karo. Flow banao, link share karo, log apni marzi se record karke jawab dein. Har answer ke baad AI follow-up pooch sakta hai aur dashboard mein summary milti hai.

## Problem

Hiring, sales, ya feedback ke liye bar bar calls schedule karna slow hota hai. Voxflow ek link deta hai — respondent browser se video/audio/text answer record karta hai, aap dashboard se sab dekhte ho.

## Kya karta hai

- Flow builder — video, audio, text questions
- Public link — `/f/your-slug` par koi bhi respond kar sakta hai
- Recording — browser camera/mic se record ya file upload
- AI — optional follow-up questions aur response summary
- Dashboard — responses, analytics, notes

## Tech

| Part | Stack |
|------|-------|
| Frontend | Next.js, TypeScript, Tailwind |
| Backend | NestJS, Prisma |
| Database | PostgreSQL |
| Queue | Redis (AI processing) |

## Setup

Docker, Node 20+, aur npm chahiye.

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

**Demo:** `demo@voxflow.app` / `password123`  
**Sample flow:** http://localhost:3000/f/senior-react-dev

## OpenAI (optional)

`backend/.env` mein `OPENAI_API_KEY` add karo. Bina key ke bhi app chalegi — follow-up aur summary ke liye fallback logic hai.

## Useful commands

```bash
npm run dev          # frontend + API
npm run docker:up    # postgres + redis
npm run db:seed      # demo data reset
```

## Structure

```
voxflow/
├── src/           Next.js app
├── backend/       NestJS API
└── docker-compose.yml
```
