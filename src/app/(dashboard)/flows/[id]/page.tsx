"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  GripVertical,
  Mic,
  Share2,
  Sparkles,
  Trash2,
  Type,
  Video,
} from "lucide-react";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { QUESTION_TYPES } from "@/lib/constants";
import { DeleteFlowDialog } from "@/components/flows/delete-flow-dialog";
import { QuestionMediaUpload } from "@/components/flows/question-media-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const BUILDER_STEPS = [
  { id: "setup", label: "Setup", description: "Name & details" },
  { id: "questions", label: "Questions", description: "Edit steps" },
  { id: "publish", label: "Publish", description: "Go live" },
];

const typeStyle: Record<
  string,
  { badge: string; icon: string; card: string; dot: string }
> = {
  VIDEO: {
    badge: "bg-sky-500/15 text-sky-800 border-sky-500/25",
    icon: "bg-sky-500/20 text-sky-700",
    card: "border-sky-500/30 bg-sky-500/[0.06]",
    dot: "bg-sky-500",
  },
  AUDIO: {
    badge: "bg-violet-500/15 text-violet-800 border-violet-500/25",
    icon: "bg-violet-500/20 text-violet-700",
    card: "border-violet-500/30 bg-violet-500/[0.06]",
    dot: "bg-violet-500",
  },
  TEXT: {
    badge: "bg-amber-500/15 text-amber-900 border-amber-500/25",
    icon: "bg-amber-500/20 text-amber-800",
    card: "border-amber-500/30 bg-amber-500/[0.06]",
    dot: "bg-amber-500",
  },
};

const addButtonStyle: Record<string, string> = {
  video:
    "border-sky-200/80 bg-sky-50 hover:bg-sky-100 hover:border-sky-300 text-sky-900",
  audio:
    "border-violet-200/80 bg-violet-50 hover:bg-violet-100 hover:border-violet-300 text-violet-900",
  text: "border-amber-200/80 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 text-amber-900",
};

const typeIcons = {
  VIDEO: Video,
  AUDIO: Mic,
  TEXT: Type,
};

const typeMap: Record<string, string> = {
  video: "VIDEO",
  audio: "AUDIO",
  text: "TEXT",
  rating: "RATING",
  file: "FILE",
  multiple_choice: "MULTIPLE_CHOICE",
  date: "DATE",
  email: "EMAIL",
  phone: "PHONE",
  signature: "SIGNATURE",
};

const reverseTypeMap: Record<string, string> = Object.fromEntries(
  Object.entries(typeMap).map(([k, v]) => [v, k]),
);

function getTypeStyle(type: string) {
  return typeStyle[type] ?? typeStyle.TEXT;
}

interface Question {
  id: string;
  title: string;
  type: string;
  order: number;
  timeLimit?: number;
  required: boolean;
  aiFollowUp: boolean;
  placeholder?: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  isThankYou: boolean;
}

interface Flow {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  status: string;
  questions: Question[];
}

export default function FlowBuilderPage() {
  const params = useParams();
  const flowId = params.id as string;
  const queryClient = useQueryClient();

  const [builderStep, setBuilderStep] = useState("questions");
  const [flowName, setFlowName] = useState("Untitled Flow");
  const [flowDescription, setFlowDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: flow, isLoading } = useQuery({
    queryKey: ["flow", flowId],
    queryFn: () => api<Flow>(API_ENDPOINTS.flows.byId(flowId)),
    enabled: !!flowId,
  });

  useEffect(() => {
    if (flow) {
      setFlowName(flow.name);
      setFlowDescription(flow.description ?? "");
      setQuestions(flow.questions);
      if (!selectedId && flow.questions[0]) {
        setSelectedId(flow.questions[0].id);
      }
    }
  }, [flow, selectedId]);

  const selected = questions.find((q) => q.id === selectedId);
  const editableQuestions = questions.filter((q) => !q.isThankYou);

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    );
    setSaved(false);
  };

  const addQuestion = (type: string) => {
    const newQ: Question = {
      id: `new-${Date.now()}`,
      title: "New question",
      type: typeMap[type] || "VIDEO",
      order: questions.length,
      required: true,
      aiFollowUp: type === "video" || type === "audio",
      timeLimit: type === "video" || type === "audio" ? 120 : undefined,
      isThankYou: false,
    };
    const thankYouIdx = questions.findIndex((q) => q.isThankYou);
    const newQuestions = [...questions];
    if (thankYouIdx >= 0) newQuestions.splice(thankYouIdx, 0, newQ);
    else newQuestions.push(newQ);
    setQuestions(newQuestions);
    setSelectedId(newQ.id);
    setBuilderStep("questions");
    setSaved(false);
  };

  const removeQuestion = (id: string) => {
    const q = questions.find((x) => x.id === id);
    if (!q || q.isThankYou) return;
    const filtered = questions.filter((x) => x.id !== id);
    setQuestions(filtered);
    if (selectedId === id) {
      setSelectedId(filtered.find((x) => !x.isThankYou)?.id ?? null);
    }
    setSaved(false);
  };

  const buildPayload = () => ({
    name: flowName,
    description: flowDescription || undefined,
    questions: questions.map((q, i) => ({
      title: q.title,
      type: q.type,
      order: i,
      timeLimit: q.timeLimit,
      required: q.required,
      aiFollowUp: q.aiFollowUp,
      placeholder: q.placeholder,
      mediaUrl: q.mediaUrl || undefined,
      mediaType: q.mediaType || undefined,
      isThankYou: q.isThankYou,
    })),
  });

  const handleSave = async (publish = false) => {
    setSaving(true);
    setSaveError(null);
    try {
      await api(API_ENDPOINTS.flows.byId(flowId), {
        method: "PATCH",
        body: JSON.stringify(buildPayload()),
      });
      if (publish) {
        await api(API_ENDPOINTS.flows.publication(flowId), { method: "POST" });
        setBuilderStep("publish");
      }
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["flow", flowId] });
      queryClient.invalidateQueries({ queryKey: ["flows"] });
    } catch {
      setSaveError("Could not save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col -m-6 overflow-hidden rounded-2xl border border-border/60 shadow-sm">
      <div className="shrink-0 border-b border-border/60 bg-card px-6 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-lg border-border/80 bg-background"
              asChild
            >
              <Link href="/flows">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <Input
                value={flowName}
                onChange={(e) => {
                  setFlowName(e.target.value);
                  setSaved(false);
                }}
                className="font-heading h-9 max-w-sm border-transparent bg-transparent text-lg font-semibold focus-visible:border-primary/30 focus-visible:bg-primary/5 rounded-xl"
              />
              <div className="mt-1 flex items-center gap-2 px-1">
                <Badge
                  variant={flow?.status === "PUBLISHED" ? "default" : "secondary"}
                  className={cn(
                    "rounded-md text-[10px] capitalize",
                    flow?.status === "PUBLISHED" &&
                      "bg-emerald-600 hover:bg-emerald-600",
                  )}
                >
                  {flow?.status?.toLowerCase() ?? "draft"}
                </Badge>
                {saved && (
                  <span className="text-xs font-medium text-emerald-600">
                    ✓ Saved
                  </span>
                )}
                {saveError && (
                  <span className="text-xs font-medium text-destructive">
                    {saveError}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border/80 bg-background"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              Save draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100"
              asChild
            >
              <Link href={`/flows/${flowId}/share`}>
                <Share2 className="size-4" />
                Share
              </Link>
            </Button>
            <Button
              size="sm"
              className="rounded-xl bg-primary shadow-sm shadow-primary/25"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              Publish
            </Button>
            <DeleteFlowDialog
              flowId={flowId}
              flowName={flowName}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-red-200 bg-red-50 text-destructive hover:bg-red-100"
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              }
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {BUILDER_STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setBuilderStep(s.id)}
              className={cn(
                "rounded-xl border px-4 py-2 text-left transition-all",
                builderStep === s.id
                  ? "border-primary/40 bg-primary/10 shadow-sm"
                  : "border-transparent bg-muted/50 hover:bg-muted",
              )}
            >
              <p
                className={cn(
                  "text-sm font-medium",
                  builderStep === s.id ? "text-primary" : "text-foreground",
                )}
              >
                {s.label}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {s.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {builderStep === "setup" && (
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-sky-50/40 p-8">
          <div className="mx-auto max-w-xl">
            <div className="rounded-2xl border border-sky-200/60 bg-card p-6 shadow-sm space-y-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <Type className="size-5" />
              </div>
              <h2 className="font-heading text-lg font-semibold">Flow details</h2>
              <p className="text-sm text-muted-foreground">
                This description appears when someone opens your public link.
              </p>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={flowDescription}
                  onChange={(e) => {
                    setFlowDescription(e.target.value);
                    setSaved(false);
                  }}
                  placeholder="Shown to respondents on the intro screen"
                  className="min-h-28 rounded-xl border-sky-100 bg-sky-50/30 resize-none focus-visible:ring-sky-500/30"
                />
              </div>
              <Button
                className="rounded-xl"
                onClick={() => {
                  void handleSave(false);
                  setBuilderStep("questions");
                }}
              >
                Continue to questions
              </Button>
            </div>
          </div>
        </div>
      )}

      {builderStep === "publish" && (
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-emerald-50/50 to-teal-50/30 p-8">
          <div className="mx-auto max-w-xl">
            <div className="rounded-2xl border border-emerald-200/60 bg-card p-8 text-center shadow-sm">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Share2 className="size-7" />
              </div>
              <h2 className="font-heading mt-4 text-xl font-semibold">
                {flow?.status === "PUBLISHED"
                  ? "Your flow is live"
                  : "Ready to publish?"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {editableQuestions.length} questions · share the link to collect
                responses
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  className="rounded-xl bg-emerald-600 shadow-sm hover:bg-emerald-700"
                  onClick={() => handleSave(true)}
                  disabled={saving || flow?.status === "PUBLISHED"}
                >
                  {flow?.status === "PUBLISHED" ? "Published" : "Publish now"}
                </Button>
                <Button variant="outline" className="rounded-xl" asChild>
                  <Link href={`/flows/${flowId}/share`}>
                    <Share2 className="size-4" />
                    Get share link
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {builderStep === "questions" && (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="w-60 shrink-0 overflow-y-auto border-r border-violet-200/50 bg-gradient-to-b from-violet-50/90 to-violet-50/40 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-violet-800/70">
              Add question
            </p>
            <p className="mb-4 mt-1 text-xs text-violet-900/50">
              Pick an answer type
            </p>
            <div className="space-y-2">
              {QUESTION_TYPES.map((qt) => {
                const Icon =
                  typeIcons[typeMap[qt.type] as keyof typeof typeIcons] || Video;
                return (
                  <button
                    key={qt.type}
                    type="button"
                    onClick={() => addQuestion(qt.type)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-all shadow-sm",
                      addButtonStyle[qt.type],
                    )}
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-white/70">
                      <Icon className="size-4" />
                    </span>
                    {qt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex-1 overflow-y-auto bg-gradient-to-br from-slate-100/80 via-background to-sky-50/30 p-6 sm:p-8">
            <div className="dot-pattern pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative mx-auto max-w-lg">
              <div className="mb-5 rounded-xl border border-border/50 bg-card/80 px-4 py-3 backdrop-blur-sm">
                <p className="text-sm font-medium">Flow steps</p>
                <p className="text-xs text-muted-foreground">
                  {editableQuestions.length} questions · click a step to edit
                </p>
              </div>
              <div className="space-y-0">
                {questions.map((question, index) => {
                  const Icon =
                    typeIcons[question.type as keyof typeof typeIcons] || Video;
                  const style = getTypeStyle(question.type);
                  const isSelected = selectedId === question.id;
                  const isThankYou = question.isThankYou;

                  return (
                    <div key={question.id}>
                      <div
                        className={cn(
                          "group relative w-full overflow-hidden rounded-2xl border-2 bg-card p-5 shadow-sm transition-all",
                          isThankYou
                            ? "border-emerald-200/60 bg-emerald-50/30"
                            : isSelected
                              ? cn(style.card, "ring-2 ring-offset-2 ring-offset-background shadow-md", style.card.includes("sky") ? "ring-sky-400/50" : style.card.includes("violet") ? "ring-violet-400/50" : "ring-amber-400/50")
                              : "border-border/60 hover:border-border hover:shadow-md",
                        )}
                      >
                        {!isThankYou && (
                          <div
                            className={cn(
                              "absolute left-0 top-0 h-full w-1",
                              style.dot,
                            )}
                          />
                        )}
                        <div className="flex items-start gap-3 pl-2">
                          <GripVertical className="mt-1 size-4 shrink-0 text-muted-foreground/30" />
                          <button
                            type="button"
                            onClick={() => setSelectedId(question.id)}
                            className="flex-1 text-left"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              {!isThankYou && (
                                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                  Step {index + 1}
                                </span>
                              )}
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-semibold capitalize",
                                  isThankYou
                                    ? "border-emerald-300/50 bg-emerald-100 text-emerald-800"
                                    : style.badge,
                                )}
                              >
                                <Icon className="size-3" />
                                {isThankYou
                                  ? "End screen"
                                  : (
                                      reverseTypeMap[question.type] ||
                                      question.type
                                    ).replace("_", " ")}
                              </span>
                              {question.mediaUrl && (
                                <Badge className="rounded-md border-0 bg-sky-600/10 text-[10px] text-sky-800">
                                  Prompt clip
                                </Badge>
                              )}
                              {question.aiFollowUp && (
                                <span className="inline-flex items-center gap-0.5 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                  <Sparkles className="size-3" />
                                  AI
                                </span>
                              )}
                            </div>
                            <p className="mt-2.5 font-medium leading-snug">
                              {isThankYou ? "Thank you screen" : question.title}
                            </p>
                          </button>
                          {!isThankYou && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="shrink-0 text-destructive opacity-60 hover:bg-red-50 hover:opacity-100"
                              onClick={() => removeQuestion(question.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {index < questions.length - 1 && (
                        <div className="flex justify-center py-2">
                          <div className="h-6 w-0.5 rounded-full bg-gradient-to-b from-border to-primary/30" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-[22rem] shrink-0 overflow-y-auto border-l border-teal-200/50 bg-gradient-to-b from-teal-50/60 to-card">
            {selected && !selected.isThankYou ? (
              <div className="space-y-5 p-6">
                <div className="rounded-xl border border-teal-200/50 bg-teal-50/50 px-4 py-3">
                  <h3 className="font-heading font-semibold text-teal-950">
                    Edit question
                  </h3>
                  <p className="mt-0.5 text-xs text-teal-900/60">
                    Settings for step{" "}
                    {questions.findIndex((q) => q.id === selected.id) + 1}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Question text</Label>
                  <Textarea
                    value={selected.title}
                    onChange={(e) =>
                      updateQuestion(selected.id, { title: e.target.value })
                    }
                    className="min-h-20 rounded-xl border-teal-100 bg-white/80 resize-none focus-visible:ring-teal-500/30"
                  />
                </div>

                {(selected.type === "VIDEO" || selected.type === "AUDIO") && (
                  <QuestionMediaUpload
                    mediaUrl={selected.mediaUrl}
                    mediaType={selected.mediaType}
                    acceptVideo={selected.type === "VIDEO"}
                    acceptAudio={selected.type === "AUDIO"}
                    onChange={(media) =>
                      updateQuestion(selected.id, {
                        mediaUrl: media?.mediaUrl ?? null,
                        mediaType: media?.mediaType ?? null,
                      })
                    }
                  />
                )}

                <div className="space-y-3 rounded-xl border border-teal-100 bg-white/60 p-4">
                  <div className="flex items-center justify-between">
                    <Label>Required</Label>
                    <Switch
                      checked={selected.required}
                      onCheckedChange={(v) =>
                        updateQuestion(selected.id, { required: v })
                      }
                    />
                  </div>
                  {(selected.type === "VIDEO" || selected.type === "AUDIO") && (
                    <>
                      <Separator className="bg-teal-100" />
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-1.5">
                          AI follow-up
                          <Sparkles className="size-3.5 text-primary" />
                        </Label>
                        <Switch
                          checked={selected.aiFollowUp}
                          onCheckedChange={(v) =>
                            updateQuestion(selected.id, { aiFollowUp: v })
                          }
                        />
                      </div>
                      <div className="space-y-2 pt-1">
                        <Label className="text-xs">Time limit (seconds)</Label>
                        <Input
                          type="number"
                          value={selected.timeLimit ?? 120}
                          onChange={(e) =>
                            updateQuestion(selected.id, {
                              timeLimit: Number(e.target.value),
                            })
                          }
                          className="rounded-xl border-teal-100 bg-white"
                        />
                      </div>
                    </>
                  )}
                </div>

                {selected.type === "TEXT" && (
                  <div className="space-y-2">
                    <Label>Placeholder</Label>
                    <Input
                      value={selected.placeholder ?? ""}
                      onChange={(e) =>
                        updateQuestion(selected.id, {
                          placeholder: e.target.value,
                        })
                      }
                      className="rounded-xl border-amber-100 bg-amber-50/30"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                  <Type className="size-6" />
                </div>
                <p className="mt-4 text-sm font-medium text-teal-950">
                  {selected?.isThankYou
                    ? "Thank you screen"
                    : "Select a step"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selected?.isThankYou
                    ? "Shown after the respondent finishes"
                    : "Click any question in the center to edit it here"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
