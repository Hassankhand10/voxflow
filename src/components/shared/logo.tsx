import Link from "next/link";
import { Waves } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 group", className)}>
      <div className="flex size-8 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/25 transition-all group-hover:bg-primary/25 group-hover:ring-primary/40">
        <Waves className="size-4 text-primary" strokeWidth={2.5} />
      </div>
      {showText && (
        <span className="font-heading text-lg font-semibold tracking-tight">
          {APP_NAME}
        </span>
      )}
    </Link>
  );
}
