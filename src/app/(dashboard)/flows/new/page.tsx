"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Mic,
  Plus,
  Sparkles,
  Trash2,
  Type,
  Video,
} from "lucide-react";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { FlowStepper } from "@/components/flows/flow-stepper";
import { QuestionMediaUpload } from "@/components/flows/question-media-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "basics", label: "Basics", description: "Name & purpose" },
  { id: "questions", label: "Questions", description: "Video, audio, or text" },
  { id: "review", label: "Review", description: "Check & create" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

type WizardQuestion = {
  id: string;
  title: string;
  type: "VIDEO" | "AUDIO" | "TEXT";
  timeLimit?: number;
  required: boolean;
  aiFollowUp: boolean;
  placeholder?: string;
  mediaUrl?: string;
  mediaType?: string;
};

const TYPE_OPTIONS = [
  {
    type: "VIDEO" as const,
    label: "Video answer",
    description: "Respondent records a video",
    icon: Video,
  },
  {
    type: "AUDIO" as const,
    label: "Audio answer",
    description: "Respondent records voice only",
    icon: Mic,
  },
  {
    type: "TEXT" as const,
    label: "Text answer",
    description: "Respondent types their reply",
    icon: Type,
  },
];

function defaultQuestion(order: number): WizardQuestion {
  return {
    id: `q-${Date.now()}-${order}`,
    title: order === 0 ? "Tell us about yourself" : "New question",
    type: "VIDEO",
    timeLimit: 120,
    required: true,
    aiFollowUp: true,
  };
}

export default function NewFlowPage() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>("basics");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<WizardQuestion[]>([
    defaultQuestion(0),
  ]);
  const [creating, setCreating] = useState(false);

  const updateQuestion = (id: string, patch: Partial<WizardQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, defaultQuestion(prev.length)]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.length > 1 ? prev.filter((q) => q.id !== id) : prev,
    );
  };

  const canContinueBasics = name.trim().length > 0;
  const canContinueQuestions = questions.every((q) => q.title.trim().length > 0);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        questions: [
          ...questions.map((q, i) => ({
            title: q.title.trim(),
            type: q.type,
            order: i,
            timeLimit:
              q.type === "VIDEO" || q.type === "AUDIO" ? q.timeLimit ?? 120 : undefined,
            required: q.required,
            aiFollowUp: q.aiFollowUp && q.type !== "TEXT",
            placeholder: q.placeholder,
            mediaUrl: q.mediaUrl,
            mediaType: q.mediaType,
          })),
          {
            title: "Thank you!",
            type: "TEXT" as const,
            order: questions.length,
            required: false,
            aiFollowUp: false,
            isThankYou: true,
          },
        ],
      };

      const flow = await api<{ id: string }>(API_ENDPOINTS.flows.create, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push(`/flows/${flow.id}`);
    } catch {
      alert("Could not create flow. Make sure the API is running.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      <div>
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 rounded-xl" asChild>
          <Link href="/flows">
            <ArrowLeft className="size-4" />
            Back to flows
          </Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Create a new flow
        </h1>
        <p className="mt-1 text-muted-foreground">
          Step-by-step setup — add video prompts, choose answer types, enable AI
          follow-ups.
        </p>
      </div>

      <FlowStepper steps={[...STEPS]} current={step} />

      {step === "basics" && (
        <div className="glass-card space-y-6 rounded-2xl p-6 sm:p-8">
          <div className="space-y-2">
            <Label htmlFor="flow-name">Flow name *</Label>
            <Input
              id="flow-name"
              placeholder="e.g. Senior React Developer Interview"
              className="h-11 rounded-xl"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flow-desc">Description</Label>
            <Textarea
              id="flow-desc"
              placeholder="What is this flow for? Candidates will see this on the intro screen."
              className="min-h-24 rounded-xl resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button
              className="rounded-xl"
              disabled={!canContinueBasics}
              onClick={() => setStep("questions")}
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "questions" && (
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="glass-card rounded-2xl p-6 sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-heading font-semibold">
                  Question {index + 1}
                </h2>
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeQuestion(question.id)}
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                )}
              </div>

              <div className="mb-5 grid gap-2 sm:grid-cols-3">
                {TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = question.type === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() =>
                        updateQuestion(question.id, {
                          type: opt.type,
                          aiFollowUp: opt.type !== "TEXT",
                          timeLimit:
                            opt.type === "TEXT" ? undefined : question.timeLimit ?? 120,
                        })
                      }
                      className={cn(
                        "rounded-xl border p-4 text-left transition-all",
                        selected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/30 hover:bg-muted/30",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-5",
                          selected ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <p className="mt-2 text-sm font-medium">{opt.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Label>Question text</Label>
                <Textarea
                  value={question.title}
                  onChange={(e) =>
                    updateQuestion(question.id, { title: e.target.value })
                  }
                  placeholder="What do you want to ask?"
                  className="min-h-20 rounded-xl resize-none"
                />
              </div>

              {(question.type === "VIDEO" || question.type === "AUDIO") && (
                <div className="mt-5">
                  <QuestionMediaUpload
                    mediaUrl={question.mediaUrl}
                    mediaType={question.mediaType}
                    acceptVideo={question.type === "VIDEO"}
                    acceptAudio={question.type === "AUDIO"}
                    onChange={(media) =>
                      updateQuestion(question.id, {
                        mediaUrl: media?.mediaUrl,
                        mediaType: media?.mediaType,
                      })
                    }
                  />
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={question.required}
                    onCheckedChange={(v) =>
                      updateQuestion(question.id, { required: v })
                    }
                  />
                  <Label>Required</Label>
                </div>
                {question.type !== "TEXT" && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={question.aiFollowUp}
                      onCheckedChange={(v) =>
                        updateQuestion(question.id, { aiFollowUp: v })
                      }
                    />
                    <Label className="flex items-center gap-1">
                      AI follow-up <Sparkles className="size-3.5 text-primary" />
                    </Label>
                  </div>
                )}
                {(question.type === "VIDEO" || question.type === "AUDIO") && (
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">
                      Time limit (sec)
                    </Label>
                    <Input
                      type="number"
                      className="h-9 w-20 rounded-lg"
                      value={question.timeLimit ?? 120}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          timeLimit: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl border-dashed py-6"
            onClick={addQuestion}
          >
            <Plus className="size-4" />
            Add another question
          </Button>

          <div className="flex justify-between">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setStep("basics")}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              className="rounded-xl"
              disabled={!canContinueQuestions}
              onClick={() => setStep("review")}
            >
              Review
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <h2 className="font-heading text-lg font-semibold">Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Flow name</dt>
                <dd className="font-medium">{name}</dd>
              </div>
              {description && (
                <div>
                  <dt className="text-muted-foreground">Description</dt>
                  <dd>{description}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Questions</dt>
                <dd className="mt-2 space-y-2">
                  {questions.map((q, i) => (
                    <div
                      key={q.id}
                      className="flex items-start gap-3 rounded-xl bg-muted/40 p-3"
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{q.title}</p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {q.type.toLowerCase()} answer
                          {q.mediaUrl ? " · with prompt clip" : ""}
                          {q.aiFollowUp ? " · AI follow-up" : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setStep("questions")}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              className="rounded-xl"
              onClick={() => void handleCreate()}
              disabled={creating}
            >
              {creating ? "Creating..." : "Create flow"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
