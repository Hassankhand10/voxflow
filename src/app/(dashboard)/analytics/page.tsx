"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalyticsMetrics {
  totalResponses: number;
  completedResponses: number;
  inProgressResponses: number;
  processingResponses: number;
  completionRate: number;
  averageTimeSeconds: number;
  monthlyData: number[];
  monthLabels: string[];
  flows: Array<{
    id: string;
    name: string;
    status: string;
    responseCount: number;
  }>;
}

function formatDuration(seconds: number) {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-metrics"],
    queryFn: () => api<AnalyticsMetrics>(API_ENDPOINTS.analytics.metrics),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const metrics = data ?? {
    totalResponses: 0,
    completedResponses: 0,
    inProgressResponses: 0,
    processingResponses: 0,
    completionRate: 0,
    averageTimeSeconds: 0,
    monthlyData: Array(12).fill(0),
    monthLabels: [],
    flows: [],
  };

  const maxMonthly = Math.max(...metrics.monthlyData, 1);

  const statCards = [
    {
      label: "Total responses",
      value: metrics.totalResponses,
      sub: "All time",
      icon: Inbox,
    },
    {
      label: "Completion rate",
      value: `${metrics.completionRate}%`,
      sub: `${metrics.completedResponses} completed`,
      icon: CheckCircle2,
    },
    {
      label: "Avg. response time",
      value: formatDuration(metrics.averageTimeSeconds),
      sub: "Per submission",
      icon: Clock,
    },
    {
      label: "In progress",
      value: metrics.inProgressResponses + metrics.processingResponses,
      sub: "Not finished yet",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Analytics
        </h1>
        <p className="mt-1 max-w-xl text-muted-foreground">
          Real numbers from your flows and responses — no fake data.
        </p>
      </div>

      {metrics.totalResponses === 0 ? (
        <Card className="glass-card rounded-2xl border-dashed border-border">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <BarChart3 className="size-10 text-muted-foreground/50" />
            <h2 className="font-heading mt-4 text-lg font-semibold">
              No data yet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Share a published flow. When people submit answers, stats will
              show up here automatically.
            </p>
            <Link
              href="/flows"
              className="mt-6 text-sm font-medium text-primary hover:underline"
            >
              Go to flows →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.label}
                  className="glass-card rounded-2xl border-border/50"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {card.label}
                      </p>
                      <Icon className="size-4 text-primary/70" />
                    </div>
                    <p className="font-heading mt-2 text-3xl font-bold">
                      {card.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {card.sub}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="font-heading text-base font-semibold">
                  Responses over time
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Last 12 months
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex h-52 items-end justify-between gap-1.5">
                  {metrics.monthlyData.map((count, i) => (
                    <div
                      key={i}
                      className="flex flex-1 flex-col items-center gap-1"
                    >
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {count || ""}
                      </span>
                      <div
                        className="w-full rounded-t-lg bg-primary/30 transition-colors hover:bg-primary/50"
                        style={{
                          height: `${Math.max((count / maxMonthly) * 100, count > 0 ? 6 : 2)}%`,
                        }}
                      />
                      <span className="text-[9px] text-muted-foreground">
                        {metrics.monthLabels[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="font-heading text-base font-semibold">
                  Completion breakdown
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  How responses end up
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  {
                    label: "Completed",
                    count: metrics.completedResponses,
                    color: "bg-primary",
                  },
                  {
                    label: "Processing",
                    count: metrics.processingResponses,
                    color: "bg-amber-500",
                  },
                  {
                    label: "In progress",
                    count: metrics.inProgressResponses,
                    color: "bg-muted-foreground/40",
                  },
                ].map((row) => {
                  const pct =
                    metrics.totalResponses > 0
                      ? Math.round((row.count / metrics.totalResponses) * 100)
                      : 0;
                  return (
                    <div key={row.label}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>{row.label}</span>
                        <span className="text-muted-foreground">
                          {row.count} ({pct}%)
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="glass-card col-span-full rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="font-heading text-base font-semibold">
                  Per flow
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Which flows get the most responses
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.flows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No flows yet.</p>
                ) : (
                  metrics.flows.map((flow) => {
                    const pct =
                      metrics.totalResponses > 0
                        ? Math.round(
                            (flow.responseCount / metrics.totalResponses) * 100,
                          )
                        : 0;
                    return (
                      <div
                        key={flow.id}
                        className="flex flex-wrap items-center gap-4 rounded-xl bg-muted/30 px-4 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium">{flow.name}</p>
                            <Badge
                              variant={
                                flow.status === "PUBLISHED"
                                  ? "default"
                                  : "secondary"
                              }
                              className="rounded-md text-[10px] capitalize"
                            >
                              {flow.status.toLowerCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {flow.responseCount} response
                            {flow.responseCount === 1 ? "" : "s"}
                          </p>
                        </div>
                        <div className="w-full max-w-xs sm:w-40">
                          <Progress value={pct} className="h-2" />
                        </div>
                        <Link
                          href={`/flows/${flow.id}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Open
                        </Link>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
