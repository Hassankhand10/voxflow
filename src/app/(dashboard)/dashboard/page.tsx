"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Inbox,
  Plus,
  Share2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Workflow,
} from "lucide-react";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DashboardData {
  stats: {
    totalFlows: number;
    publishedFlows: number;
    totalResponses: number;
    completedResponses: number;
    inProgressResponses: number;
    processingResponses: number;
    completionRate: number;
    averageTimeSeconds: number;
    thisMonthResponses: number;
    monthTrend: number;
  };
  recentResponses: Array<{
    id: string;
    respondentName: string;
    respondentEmail: string;
    status: string;
    duration: number;
    aiScore: number | null;
    createdAt: string;
    flow: { name: string; slug: string };
  }>;
  recentFlows: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    responseCount: number;
    updatedAt: string;
  }>;
  topFlows: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    responseCount: number;
  }>;
  monthlyData: number[];
  monthLabels: string[];
}

function formatDuration(seconds: number) {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatRelativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<DashboardData>(API_ENDPOINTS.analytics.overview),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const stats = data?.stats;
  const monthlyData = data?.monthlyData ?? Array(12).fill(0);
  const monthLabels = data?.monthLabels ?? [];
  const maxMonthly = Math.max(...monthlyData, 1);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const statCards = [
    {
      label: "Total responses",
      value: stats?.totalResponses ?? 0,
      sub: `${stats?.thisMonthResponses ?? 0} this month`,
      icon: Inbox,
      accent: "from-sky-500/15 to-cyan-500/5",
    },
    {
      label: "Active flows",
      value: stats?.totalFlows ?? 0,
      sub: `${stats?.publishedFlows ?? 0} published`,
      icon: Workflow,
      accent: "from-violet-500/15 to-purple-500/5",
    },
    {
      label: "Completion rate",
      value: `${stats?.completionRate ?? 0}%`,
      sub: `${stats?.completedResponses ?? 0} completed`,
      icon: CheckCircle2,
      accent: "from-emerald-500/15 to-teal-500/5",
    },
    {
      label: "Avg. response",
      value: formatDuration(stats?.averageTimeSeconds ?? 0),
      sub: "Per submission",
      icon: Clock,
      accent: "from-amber-500/15 to-orange-500/5",
    },
  ];

  const pending =
    (stats?.inProgressResponses ?? 0) + (stats?.processingResponses ?? 0);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8">
        <div className="hero-glow absolute inset-0 opacity-60" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-primary">
              {getGreeting()}, {firstName}
            </p>
            <h1 className="font-heading mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Your workspace at a glance
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Track flows, watch incoming video responses, and see how
              candidates are performing — all in one place.
            </p>
            {stats && stats.monthTrend !== 0 && (
              <div
                className={cn(
                  "mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                  stats.monthTrend > 0
                    ? "bg-emerald-500/10 text-emerald-700"
                    : "bg-amber-500/10 text-amber-700",
                )}
              >
                {stats.monthTrend > 0 ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                {stats.monthTrend > 0 ? "+" : ""}
                {stats.monthTrend}% vs last month
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-xl shadow-sm" asChild>
              <Link href="/flows/new">
                <Plus className="size-4" />
                New flow
              </Link>
            </Button>
            <Button variant="outline" className="rounded-xl bg-background/80" asChild>
              <Link href="/analytics">
                <BarChart3 className="size-4" />
                Analytics
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card overflow-hidden rounded-2xl border-border/50">
                <CardContent className="relative p-5">
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-80",
                      stat.accent,
                    )}
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <div className="flex size-8 items-center justify-center rounded-lg bg-background/70">
                        <Icon className="size-4 text-primary" />
                      </div>
                    </div>
                    <p className="font-heading mt-3 text-3xl font-bold">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stat.sub}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="glass-card rounded-2xl border-border/50 xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-heading text-base font-semibold">
                Recent responses
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Latest submissions across all flows
              </p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-lg" asChild>
              <Link href="/responses">
                View all
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {(data?.recentResponses ?? []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-14 text-center">
                <Inbox className="mx-auto size-10 text-muted-foreground/40" />
                <p className="mt-4 font-medium">No responses yet</p>
                <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                  Create a flow, publish it, and share the link with candidates.
                </p>
                <div className="mt-6 flex justify-center gap-2">
                  <Button className="rounded-xl" size="sm" asChild>
                    <Link href="/flows/new">Create flow</Link>
                  </Button>
                  <Button variant="outline" className="rounded-xl" size="sm" asChild>
                    <Link href="/flows">My flows</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {data?.recentResponses.map((response) => (
                  <Link
                    key={response.id}
                    href={`/responses/${response.id}`}
                    className="group flex items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition-all hover:border-border/60 hover:bg-muted/30"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {response.respondentName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{response.respondentName}</p>
                        <Badge
                          variant={
                            response.status === "COMPLETED"
                              ? "default"
                              : "secondary"
                          }
                          className="rounded-md text-[10px] capitalize"
                        >
                          {response.status.toLowerCase().replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {response.flow.name}
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      {response.aiScore !== null && (
                        <p className="flex items-center justify-end gap-1 text-sm font-semibold text-primary">
                          <Sparkles className="size-3" />
                          {response.aiScore}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(response.duration)} ·{" "}
                        {formatRelativeTime(response.createdAt)}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card rounded-2xl border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base font-semibold">
                Response status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  label: "Completed",
                  count: stats?.completedResponses ?? 0,
                  color: "bg-primary",
                },
                {
                  label: "Processing",
                  count: stats?.processingResponses ?? 0,
                  color: "bg-amber-500",
                },
                {
                  label: "In progress",
                  count: stats?.inProgressResponses ?? 0,
                  color: "bg-muted-foreground/50",
                },
              ].map((row) => {
                const total = stats?.totalResponses ?? 0;
                const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
                return (
                  <div key={row.label}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span>{row.label}</span>
                      <span className="text-muted-foreground">{row.count}</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
              {pending > 0 && (
                <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
                  {pending} response{pending === 1 ? "" : "s"} still need attention
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card rounded-2xl border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="font-heading text-base font-semibold">
                Top flows
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 rounded-lg text-xs" asChild>
                <Link href="/flows">All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.topFlows ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No flows yet.</p>
              ) : (
                data?.topFlows.map((flow, i) => (
                  <Link
                    key={flow.id}
                    href={`/flows/${flow.id}`}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/40"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{flow.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {flow.responseCount} responses
                      </p>
                    </div>
                    <Badge
                      variant={flow.status === "PUBLISHED" ? "default" : "secondary"}
                      className="shrink-0 rounded-md text-[10px] capitalize"
                    >
                      {flow.status.toLowerCase()}
                    </Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="font-heading text-base font-semibold">
              Response activity
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Last 12 months · {stats?.thisMonthResponses ?? 0} this month
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end justify-between gap-1.5">
              {monthlyData.map((count, i) => (
                <div
                  key={i}
                  className="group flex flex-1 flex-col items-center gap-1"
                >
                  <span className="text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    {count || ""}
                  </span>
                  <div
                    className={cn(
                      "w-full rounded-t-lg transition-all",
                      i === monthlyData.length - 1
                        ? "bg-primary"
                        : "bg-primary/30 group-hover:bg-primary/50",
                    )}
                    style={{
                      height: `${Math.max((count / maxMonthly) * 100, count > 0 ? 8 : 3)}%`,
                    }}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {monthLabels[i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-heading text-base font-semibold">
                Your flows
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Recently updated
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg" asChild>
              <Link href="/flows/new">
                <Plus className="size-3.5" />
                New
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.recentFlows ?? []).length === 0 ? (
              <div className="rounded-xl border border-dashed py-10 text-center">
                <Workflow className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium">Start your first flow</p>
                <Button className="mt-4 rounded-xl" size="sm" asChild>
                  <Link href="/flows/new">Create now</Link>
                </Button>
              </div>
            ) : (
              data?.recentFlows.map((flow) => (
                <div
                  key={flow.id}
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/flows/${flow.id}`}
                      className="truncate font-medium hover:text-primary"
                    >
                      {flow.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {flow.responseCount} responses · updated{" "}
                      {formatRelativeTime(flow.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {flow.status === "PUBLISHED" && (
                      <Button variant="ghost" size="icon-sm" className="rounded-lg" asChild>
                        <Link href={`/f/${flow.slug}`} target="_blank">
                          <Share2 className="size-3.5" />
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-sm" className="rounded-lg" asChild>
                      <Link href={`/flows/${flow.id}`}>
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
