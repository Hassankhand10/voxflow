"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Inbox, Search } from "lucide-react";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface ResponseItem {
  id: string;
  respondentName: string;
  respondentEmail: string;
  status: string;
  duration: number;
  aiTags: string[];
  aiScore: number | null;
  createdAt: string;
  flow: { name: string };
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ResponsesPage() {
  const [query, setQuery] = useState("");
  const { data: responses = [], isLoading } = useQuery({
    queryKey: ["responses"],
    queryFn: () => api<ResponseItem[]>(API_ENDPOINTS.responses.list),
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return responses;
    return responses.filter(
      (r) =>
        r.respondentName.toLowerCase().includes(q) ||
        r.respondentEmail.toLowerCase().includes(q) ||
        r.flow.name.toLowerCase().includes(q) ||
        r.aiTags?.some((t) => t.toLowerCase().includes(q)),
    );
  }, [responses, query]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Responses
        </h1>
        <p className="mt-1 text-muted-foreground">
          {responses.length} total · click any row to view videos and AI
          summary
        </p>
      </div>

      {responses.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, flow, or tag..."
            className="h-10 rounded-xl pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((response) => (
          <Link key={response.id} href={`/responses/${response.id}`}>
            <Card className="glass-card rounded-2xl border-border/50 transition-all hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {response.respondentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
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
                      className="rounded-lg text-xs capitalize"
                    >
                      {response.status.toLowerCase().replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {response.flow.name} · {response.respondentEmail}
                  </p>
                  {response.aiTags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {response.aiTags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  {response.aiScore !== null && (
                    <p className="font-heading text-lg font-bold text-primary">
                      {response.aiScore}
                      <span className="text-xs font-normal text-muted-foreground">
                        /100
                      </span>
                    </p>
                  )}
                  <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {formatDuration(response.duration)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {responses.length === 0 && (
          <Card className="glass-card rounded-2xl border-dashed">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <Inbox className="size-10 text-muted-foreground/50" />
              <p className="mt-4 font-medium">No responses yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Publish a flow and share the public link. Submissions appear
                here.
              </p>
              <Button className="mt-5 rounded-xl" asChild>
                <Link href="/flows">Go to flows</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {responses.length > 0 && filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No results for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
