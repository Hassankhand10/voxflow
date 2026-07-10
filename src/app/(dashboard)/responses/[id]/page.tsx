"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ResponseDetail {
  id: string;
  respondentName: string;
  respondentEmail: string;
  duration: number;
  submittedAt: string | null;
  status: string;
  transcript: string | null;
  aiSummary: string | null;
  aiTags: string[];
  aiScore: number | null;
  notes: string | null;
  flow: { name: string };
  answers: Array<{
    id: string;
    textValue: string | null;
    fileUrl: string | null;
    fileType: string | null;
    duration: number | null;
    aiFollowUpText: string | null;
    aiFollowUpAnswer: string | null;
    question: { title: string; type: string };
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { name: string };
  }>;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ResponseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [comment, setComment] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["response", id],
    queryFn: () => api<ResponseDetail>(API_ENDPOINTS.responses.byId(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.notes) setNotes(data.notes);
  }, [data?.notes]);

  const saveNotes = useMutation({
    mutationFn: () =>
      api(API_ENDPOINTS.responses.byId(id), {
        method: "PATCH",
        body: JSON.stringify({ notes }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["response", id] }),
  });

  const addComment = useMutation({
    mutationFn: () =>
      api(API_ENDPOINTS.responses.comments(id), {
        method: "POST",
        body: JSON.stringify({ content: comment }),
      }),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["response", id] });
    },
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const initials = data.respondentName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary/20 text-lg text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-2xl font-bold">
              {data.respondentName}
            </h1>
            <p className="text-muted-foreground">{data.flow.name}</p>
          </div>
        </div>
        {data.aiScore !== null && (
          <Badge className="rounded-lg">AI Score: {data.aiScore}</Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {data.answers.length > 0 && (
            <Card className="glass-card rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="font-heading text-base font-semibold">
                  Responses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {data.answers.map((answer) => (
                  <div key={answer.id} className="space-y-3">
                    <p className="text-sm font-medium">{answer.question.title}</p>
                    {answer.fileUrl && (
                      <div className="overflow-hidden rounded-xl border border-border/50 bg-muted/30">
                        {answer.fileType?.startsWith("audio") ? (
                          <audio
                            src={answer.fileUrl}
                            controls
                            className="w-full p-3"
                          />
                        ) : (
                          <video
                            src={answer.fileUrl}
                            controls
                            playsInline
                            className="aspect-video w-full bg-black"
                          />
                        )}
                      </div>
                    )}
                    {answer.textValue && (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {answer.textValue}
                      </p>
                    )}
                    {answer.aiFollowUpText && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                        <p className="text-xs font-medium text-primary">
                          AI Follow-up
                        </p>
                        <p className="mt-1 text-sm">{answer.aiFollowUpText}</p>
                        {answer.aiFollowUpAnswer && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {answer.aiFollowUpAnswer}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {data.transcript && (
            <Card className="glass-card rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="font-heading text-base font-semibold">
                  Transcript
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {data.transcript}
                </p>
              </CardContent>
            </Card>
          )}

          {data.aiSummary && (
            <Card className="glass-card rounded-2xl border-border/50">
              <CardHeader className="flex flex-row items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <CardTitle className="font-heading text-base font-semibold">
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.aiSummary.split("\n").map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {point.replace(/^[•\-]\s*/, "")}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="glass-card rounded-2xl border-border/50">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <span>{data.respondentEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="size-4 text-muted-foreground" />
                <span>{formatDuration(data.duration)}</span>
              </div>
              {data.submittedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>
                    {new Date(data.submittedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {data.aiTags.length > 0 && (
            <Card className="glass-card rounded-2xl border-border/50">
              <CardHeader className="flex flex-row items-center gap-2">
                <Tag className="size-4 text-primary" />
                <CardTitle className="font-heading text-base font-semibold">
                  AI Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.aiTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="rounded-lg bg-primary/10 text-primary"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {data.aiScore !== null && (
            <Card className="glass-card rounded-2xl border-border/50">
              <CardHeader className="flex flex-row items-center gap-2">
                <Star className="size-4 text-primary" />
                <CardTitle className="font-heading text-base font-semibold">
                  AI Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="font-heading text-5xl font-bold text-primary">
                    {data.aiScore}
                  </span>
                  <span className="mb-2 text-sm text-muted-foreground">
                    / 100
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${data.aiScore}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="glass-card rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle className="font-heading text-base font-semibold">
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes || data.notes || ""}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-24 rounded-xl resize-none"
              />
              <Button
                size="sm"
                className="mt-3 rounded-xl"
                onClick={() => saveNotes.mutate()}
              >
                Save Notes
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-2xl border-border/50">
            <CardHeader className="flex flex-row items-center gap-2">
              <MessageSquare className="size-4" />
              <CardTitle className="font-heading text-base font-semibold">
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">
                      {c.user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{c.user.name}</p>
                    <p className="text-sm text-muted-foreground">{c.content}</p>
                  </div>
                </div>
              ))}
              <Separator />
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-16 rounded-xl resize-none"
              />
              <Button
                size="sm"
                className="rounded-xl"
                onClick={() => addComment.mutate()}
                disabled={!comment.trim()}
              >
                Post Comment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
