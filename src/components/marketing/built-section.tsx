"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Database,
  Layers,
  MessageSquare,
  Sparkles,
  Video,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MadeByHassan } from "@/components/shared/made-by-hassan";
import { AUTHOR_NAME } from "@/lib/constants";

const BUILT_PAGES = [
  {
    title: "Dashboard",
    description: "Stats, recent responses, and analytics overview.",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Flow Builder",
    description: "Build flows with video questions and AI toggles.",
    href: "/flows",
    icon: Workflow,
  },
  {
    title: "Public Response",
    description: "Candidates record answers via a shareable public link.",
    href: "/f/senior-react-dev",
    icon: Video,
  },
  {
    title: "AI Insights",
    description: "Auto transcript, summary, tags, and score per response.",
    href: "/responses",
    icon: Sparkles,
  },
  {
    title: "Team Workspace",
    description: "Members, roles, comments, and notes on responses.",
    href: "/settings",
    icon: MessageSquare,
  },
  {
    title: "Analytics",
    description: "Completion rates, drop-offs, and response trends.",
    href: "/analytics",
    icon: Layers,
  },
];

export function BuiltSection() {
  return (
    <section id="built" className="border-t border-border bg-muted/40 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-bold tracking-tight">
            What&apos;s included
          </h2>
          <p className="mt-3 text-muted-foreground">
            A complete full-stack application with real auth, database, API, and
            interactive UI — designed and built by {AUTHOR_NAME}. Click any
            card to explore.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BUILT_PAGES.map((page, i) => (
            <motion.div
              key={page.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={page.href}
                className="surface-card group flex h-full flex-col p-5 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <page.icon className="size-5" />
                </div>
                <h3 className="font-semibold">{page.title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted-foreground">
                  {page.description}
                </p>
                <span className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                  Explore
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STACK = [
  "Next.js 16",
  "TypeScript",
  "Tailwind CSS",
  "NestJS",
  "PostgreSQL",
  "Prisma",
  "Redis",
  "BullMQ",
];

export function TechStack() {
  return (
    <section id="stack" className="py-16">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <div className="mb-2 flex items-center justify-center gap-2 text-primary">
          <Database className="size-4" />
          <span className="text-sm font-medium">Tech Stack</span>
        </div>
        <h2 className="font-heading text-2xl font-bold">
          Built by {AUTHOR_NAME} with modern tools
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground shadow-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    step: "01",
    title: "Create a flow",
    description:
      "Add questions in the editor — video, audio, text, and optional prompt clips.",
  },
  {
    step: "02",
    title: "Share the link",
    description:
      "Send a public URL to candidates or customers. They respond on their own time.",
  },
  {
    step: "03",
    title: "AI analyzes answers",
    description:
      "Get transcripts, summaries, tags, and adaptive follow-up questions automatically.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-border py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">
            How Voxflow works
          </h2>
          <p className="mt-3 text-muted-foreground">
            The core idea behind the product — in three steps.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
                {item.step}
              </div>
              <h3 className="mt-5 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="surface-card overflow-hidden p-8 text-center sm:p-12">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Log in to the dashboard or try the public interview flow.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="rounded-xl" asChild>
              <Link href="/login">
                Open Dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl" asChild>
              <Link href="/f/senior-react-dev">Public Flow</Link>
            </Button>
          </div>
          <MadeByHassan className="mt-8" />
        </div>
      </div>
    </section>
  );
}
