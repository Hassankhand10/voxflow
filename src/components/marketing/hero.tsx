"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MadeByHassan } from "@/components/shared/made-by-hassan";
import { APP_NAME } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20">
      <div className="hero-glow absolute inset-0" />
      <div className="dot-pattern absolute inset-0 opacity-60" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MadeByHassan variant="badge" className="mb-5" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
          >
            Async video interviews,{" "}
            <span className="gradient-text">powered by AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-lg leading-relaxed text-muted-foreground"
          >
            <strong className="font-medium text-foreground">{APP_NAME}</strong> is
            a VideoAsk-style platform where companies collect video responses
            without scheduling meetings — with an AI that asks smart follow-up
            questions after each answer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button size="lg" className="h-11 rounded-xl px-6 shadow-sm" asChild>
              <Link href="/login">
                Open Dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-11 rounded-xl px-6" asChild>
              <Link href="/f/senior-react-dev">
                <Play className="size-4" />
                Try Public Flow
              </Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-6 text-sm text-muted-foreground"
          >
            Test account:{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-foreground">
              demo@voxflow.app
            </code>{" "}
            /{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-foreground">
              password123
            </code>
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="surface-card overflow-hidden"
        >
          <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
            <div className="size-2.5 rounded-full bg-red-400/80" />
            <div className="size-2.5 rounded-full bg-amber-400/80" />
            <div className="size-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-2 text-xs text-muted-foreground">
              voxflow.app/flows/builder
            </span>
          </div>

          <div className="grid grid-cols-5 divide-x divide-border">
            <div className="col-span-1 space-y-2 bg-muted/30 p-3">
              {["Dashboard", "Flows", "Responses"].map((item, i) => (
                <div
                  key={item}
                  className={`rounded-lg px-2 py-1.5 text-[10px] font-medium ${
                    i === 1
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="col-span-3 space-y-3 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Flow Builder
              </p>
              <div className="space-y-2">
                {[
                  "Tell us about your React experience",
                  "Describe your hardest project",
                  "Thank you!",
                ].map((q, i) => (
                  <div
                    key={q}
                    className={`rounded-xl border px-3 py-2.5 text-xs ${
                      i === 0
                        ? "border-primary/30 bg-primary/5 font-medium"
                        : "border-border bg-card"
                    }`}
                  >
                    {i < 2 && (
                      <span className="mr-1.5 text-[10px] text-primary">
                        Video
                      </span>
                    )}
                    {q}
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-1 bg-muted/30 p-3">
              <p className="text-[10px] font-medium text-muted-foreground">
                Settings
              </p>
              <div className="mt-2 space-y-2">
                <div className="h-2 w-full rounded-full bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground">
                    AI Follow-up
                  </span>
                  <div className="h-3 w-6 rounded-full bg-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border bg-primary/5 px-4 py-3">
            <p className="text-xs text-primary">
              AI: &ldquo;What was the biggest technical challenge in that
              project?&rdquo;
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
