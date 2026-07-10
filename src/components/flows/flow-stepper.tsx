"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowStepperProps {
  steps: { id: string; label: string; description?: string }[];
  current: string;
  className?: string;
}

export function FlowStepper({ steps, current, className }: FlowStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === current);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const active = step.id === current;
          return (
            <div key={step.id} className="flex flex-1 items-center gap-2">
              <div className="flex min-w-0 flex-1 flex-col items-center text-center sm:items-start sm:text-left">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                      done && "bg-primary text-primary-foreground",
                      active && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      !done && !active && "bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="size-4" /> : index + 1}
                  </div>
                  <div className="hidden min-w-0 sm:block">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        active ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </p>
                    {step.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden h-px flex-1 sm:block",
                    index < currentIndex ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm font-medium sm:hidden">
        {steps[currentIndex]?.label}
      </p>
    </div>
  );
}
