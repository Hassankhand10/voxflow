"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MoreHorizontal,
  Plus,
  Share2,
  Trash2,
  Video,
} from "lucide-react";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { DeleteFlowDialog } from "@/components/flows/delete-flow-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Flow {
  id: string;
  name: string;
  status: string;
  slug: string;
  updatedAt: string;
  responseCount: number;
  questions: unknown[];
}

export default function FlowsPage() {
  const [deleteTarget, setDeleteTarget] = useState<Flow | null>(null);
  const { data: flows = [], isLoading } = useQuery({
    queryKey: ["flows"],
    queryFn: () => api<Flow[]>(API_ENDPOINTS.flows.list),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Flows
          </h1>
          <p className="mt-1 max-w-lg text-muted-foreground">
            Create step-by-step interview flows. Each question can be video,
            audio, or text — with optional prompt clips and AI follow-ups.
          </p>
        </div>
        <Button className="rounded-xl shadow-sm" asChild>
          <Link href="/flows/new">
            <Plus className="size-4" />
            New Flow
          </Link>
        </Button>
      </div>

      <Card className="glass-card max-w-md rounded-2xl border-dashed border-primary/30">
        <CardContent className="flex flex-col justify-center p-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Video className="size-5 text-primary" />
          </div>
          <h3 className="font-heading mt-4 font-semibold">How flows work</h3>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-medium text-primary">1.</span>
              Name your flow & add questions
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">2.</span>
              Upload a video prompt (optional)
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">3.</span>
              Publish & share the public link
            </li>
          </ol>
          <Button className="mt-5 rounded-xl" variant="outline" asChild>
            <Link href="/flows/new">
              Start wizard
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {flows.length === 0 ? (
        <Card className="glass-card rounded-2xl border-border/50">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <Plus className="size-7 text-primary" />
            </div>
            <h3 className="font-heading mt-4 text-lg font-semibold">
              No flows yet
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Create your first flow in 3 easy steps — video, audio, or text
              questions with AI follow-ups.
            </p>
            <Button className="mt-6 rounded-xl" asChild>
              <Link href="/flows/new">Create your first flow</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {flows.map((flow, i) => (
            <motion.div
              key={flow.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card group rounded-2xl border-border/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/flows/${flow.id}`} className="min-w-0 flex-1">
                      <h3 className="font-heading truncate font-semibold transition-colors group-hover:text-primary">
                        {flow.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Updated{" "}
                        {new Date(flow.updatedAt).toLocaleDateString()}
                      </p>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="shrink-0 rounded-lg"
                          />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            (window.location.href = `/flows/${flow.id}`)
                          }
                        >
                          Edit flow
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            (window.location.href = `/flows/${flow.id}/share`)
                          }
                        >
                          Share link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(flow)}
                        >
                          <Trash2 className="size-4" />
                          Delete flow
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Badge
                      variant={
                        flow.status === "PUBLISHED" ? "default" : "secondary"
                      }
                      className="rounded-lg text-xs capitalize"
                    >
                      {flow.status.toLowerCase()}
                    </Badge>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
                    <div>
                      <p className="text-lg font-semibold">
                        {flow.responseCount ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Responses</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {flow.questions?.length ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Steps</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg" asChild>
                      <Link href={`/flows/${flow.id}/share`}>
                        <Share2 className="size-3.5" />
                        Share
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      {deleteTarget && (
        <DeleteFlowDialog
          flowId={deleteTarget.id}
          flowName={deleteTarget.name}
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
