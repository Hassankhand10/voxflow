import { cn } from "@/lib/utils";
import { AUTHOR_NAME } from "@/lib/constants";

interface MadeByHassanProps {
  className?: string;
  variant?: "default" | "badge" | "subtle";
}

export function MadeByHassan({
  className,
  variant = "default",
}: MadeByHassanProps) {
  if (variant === "badge") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary",
          className,
        )}
      >
        Made by <span className="font-semibold">{AUTHOR_NAME}</span>
      </span>
    );
  }

  if (variant === "subtle") {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Made by{" "}
        <span className="font-medium text-foreground">{AUTHOR_NAME}</span>
      </p>
    );
  }

  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      Made by{" "}
      <span className="font-semibold text-foreground">{AUTHOR_NAME}</span>
    </p>
  );
}
