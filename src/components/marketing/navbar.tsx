"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { MadeByHassan } from "@/components/shared/made-by-hassan";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <MadeByHassan variant="subtle" className="hidden sm:block" />
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="#built"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            What&apos;s Built
          </Link>
          <Link
            href="#how"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            How it Works
          </Link>
          <Link
            href="#stack"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Tech Stack
          </Link>
        </div>
        <Button size="sm" className="rounded-lg shadow-sm" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </nav>
    </header>
  );
}
