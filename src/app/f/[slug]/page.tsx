"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import {
  MediaRecorderPanel,
  type MediaRecording,
} from "@/components/shared/media-recorder";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

type Step = "intro" | "question" | "processing" | "done";

interface PublicFlow {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  requireEmail: boolean;
  allowRetakes: boolean;
  questions: Array<{
    id: string;
    title: string;
    type: string;
    timeLimit?: number;
    placeholder?: string;
    required?: boolean;
    aiFollowUp: boolean;
    isThankYou?: boolean;
    mediaUrl?: string | null;
    mediaType?: string | null;
  }>;
}

interface AnswerPayload {
  questionId: string;
  textValue?: string;
  fileUrl?: string;
  fileType?: string;
  duration?: number;
  aiFollowUpText?: string;
  aiFollowUpAnswer?: string;
}

export default function PublicFlowPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [step, setStep] = useState<Step>("intro");
  const [responseId, setResponseId] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [mediaAnswer, setMediaAnswer] = useState<MediaRecording | null>(null);
  const [answers, setAnswers] = useState<AnswerPayload[]>([]);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [aiFollowUp, setAiFollowUp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: flow, isLoading } = useQuery({
    queryKey: ["public-flow", slug],
    queryFn: () => api<PublicFlow>(API_ENDPOINTS.public.flowBySlug(slug)),
  });

  const activeQuestions = flow?.questions.filter((q) => !q.isThankYou) ?? [];
  const question = activeQuestions[currentQ];
  const requireEmail = flow?.requireEmail ?? true;
  const allowRetakes = flow?.allowRetakes ?? true;

  const isMediaQuestion =
    question?.type === "VIDEO" || question?.type === "AUDIO";

  const hasAnswer = aiFollowUp
    ? answerText.trim().length > 0
    : isMediaQuestion
      ? question?.required !== false
        ? mediaAnswer !== null
        : mediaAnswer !== null || answerText.trim().length > 0
      : answerText.trim().length > 0;

  const progressPct =
    activeQuestions.length > 0
      ? Math.round((currentQ / activeQuestions.length) * 100)
      : 0;

  const getAnswerSummary = () => {
    if (answerText.trim()) return answerText.trim();
    if (mediaAnswer) {
      return `[Video response recorded — ${mediaAnswer.duration}s]`;
    }
    return "";
  };

  const buildCurrentAnswer = (): AnswerPayload | null => {
    if (!question) return null;

    return {
      questionId: question.id,
      textValue: answerText.trim() || undefined,
      fileUrl: mediaAnswer?.fileUrl,
      fileType: mediaAnswer?.fileType,
      duration: mediaAnswer?.duration,
    };
  };

  const advanceOrSubmit = async (finalAnswers: AnswerPayload[]) => {
    if (currentQ < activeQuestions.length - 1) {
      setCurrentQ((q) => q + 1);
      setAnswerText("");
      setMediaAnswer(null);
      return;
    }

    setStep("processing");
    setSubmitting(true);

    try {
      const totalDuration = finalAnswers.reduce(
        (sum, a) => sum + (a.duration ?? 0),
        0,
      );

      await api(API_ENDPOINTS.public.completeResponseSession(responseId!), {
        method: "POST",
        body: JSON.stringify({
          answers: finalAnswers,
          duration: Math.max(totalDuration, finalAnswers.length * 10),
        }),
      });

      let index = 0;
      const interval = setInterval(() => {
        index++;
        setProcessingIndex(index);
        if (index >= 3) {
          clearInterval(interval);
          setTimeout(() => setStep("done"), 800);
        }
      }, 1200);
    } catch {
      setStep("question");
      setFormError("Failed to submit your response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const startFlow = async () => {
    if (!name.trim() || !flow) return;
    if (requireEmail && !email.trim()) return;
    setLoading(true);
    setFormError(null);
    try {
      const res = await api<{ id: string }>(
        API_ENDPOINTS.public.createResponseSession(slug),
        {
          method: "POST",
          body: JSON.stringify({
            respondentName: name.trim(),
            respondentEmail: requireEmail
              ? email.trim()
              : email.trim() || "anonymous@voxflow.local",
          }),
        },
      );
      setResponseId(res.id);
      setStep("question");
    } catch {
      setFormError("Could not start the flow. Make sure the API is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!question || !responseId || !hasAnswer) return;
    setFormError(null);

    if (aiFollowUp) {
      const updatedAnswers = [...answers];
      const last = updatedAnswers[updatedAnswers.length - 1];
      if (last) {
        updatedAnswers[updatedAnswers.length - 1] = {
          ...last,
          aiFollowUpText: aiFollowUp,
          aiFollowUpAnswer: answerText.trim() || undefined,
        };
      }
      setAnswers(updatedAnswers);
      setAiFollowUp(null);
      setAnswerText("");
      setMediaAnswer(null);
      await advanceOrSubmit(updatedAnswers);
      return;
    }

    const currentAnswer = buildCurrentAnswer();
    if (!currentAnswer) return;

    const summary = getAnswerSummary();
    const newAnswers = [...answers, currentAnswer];

    if (question.aiFollowUp && summary) {
      setSubmitting(true);
      try {
        const res = await api<{ question: string }>(
          API_ENDPOINTS.ai.followUpQuestions,
          {
            method: "POST",
            body: JSON.stringify({
              answerText: summary,
              questionTitle: question.title,
            }),
          },
        );
        setAnswers(newAnswers);
        setAiFollowUp(res.question);
        setAnswerText("");
        setMediaAnswer(null);
        return;
      } catch {
      } finally {
        setSubmitting(false);
      }
    }

    setAnswers(newAnswers);
    setAnswerText("");
    setMediaAnswer(null);
    await advanceOrSubmit(newAnswers);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Flow not found</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="hero-glow absolute inset-0" />
      <header className="relative z-10 flex h-16 items-center justify-center border-b border-border/30">
        <Logo />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <div className="glass-card rounded-3xl p-8 text-center">
                <h1 className="font-heading text-2xl font-bold">{flow.name}</h1>
                <p className="mt-3 text-muted-foreground">
                  {flow.description ||
                    "Answer a few questions at your own pace. No scheduling needed."}
                </p>
                <div className="mt-8 space-y-4 text-left">
                  <div className="space-y-2">
                    <Label>Your name</Label>
                    <Input
                      placeholder="Hassan Khan"
                      className="h-11 rounded-xl"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  {requireEmail && (
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="you@email.com"
                        className="h-11 rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                {formError && (
                  <p className="mt-4 text-sm text-destructive">{formError}</p>
                )}
                <Button
                  className="mt-8 h-12 w-full rounded-xl text-base"
                  onClick={startFlow}
                  disabled={
                    !name.trim() ||
                    (requireEmail && !email.trim()) ||
                    loading
                  }
                >
                  Start
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "question" && question && (
            <motion.div
              key={`q-${currentQ}-${aiFollowUp ? "followup" : "main"}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl"
            >
              <div className="glass-card rounded-3xl p-8">
                <div className="mb-6 space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Question {currentQ + 1} of {activeQuestions.length}
                    </span>
                    <span>{progressPct}%</span>
                  </div>
                  <Progress value={progressPct} className="h-1.5" />
                </div>
                <h2 className="font-heading text-2xl font-bold">
                  {aiFollowUp || question.title}
                </h2>

                {!aiFollowUp && question.mediaUrl && (
                  <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-black/5">
                    {question.mediaType?.startsWith("audio") ? (
                      <div className="flex items-center gap-3 p-4">
                        <p className="text-xs font-medium text-muted-foreground">
                          Question from host
                        </p>
                        <audio
                          src={question.mediaUrl}
                          controls
                          className="flex-1"
                        />
                      </div>
                    ) : (
                      <video
                        src={question.mediaUrl}
                        controls
                        playsInline
                        className="aspect-video w-full bg-black object-cover"
                      />
                    )}
                  </div>
                )}

                {aiFollowUp ? (
                  <Textarea
                    placeholder="Type your follow-up answer..."
                    className="mt-6 min-h-32 rounded-xl"
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                  />
                ) : question.type === "VIDEO" || question.type === "AUDIO" ? (
                  <>
                    <div className="mt-6">
                      <MediaRecorderPanel
                        key={`recorder-${question.id}`}
                        mode={question.type === "AUDIO" ? "audio" : "video"}
                        timeLimit={question.timeLimit ?? 120}
                        allowRetakes={allowRetakes}
                        onRecordingComplete={setMediaAnswer}
                        onClear={() => setMediaAnswer(null)}
                      />
                    </div>
                    <Textarea
                      placeholder="Optional notes with your recording..."
                      className="mt-4 rounded-xl"
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                    />
                  </>
                ) : (
                  <Textarea
                    placeholder={question.placeholder || "Your answer..."}
                    className="mt-6 min-h-32 rounded-xl"
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                  />
                )}

                {question.aiFollowUp && !aiFollowUp && (
                  <div className="glass mt-6 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      <p className="text-xs font-medium text-primary">
                        AI may ask a follow-up based on your answer
                      </p>
                    </div>
                  </div>
                )}

                {formError && step === "question" && (
                  <p className="mt-4 text-sm text-destructive">{formError}</p>
                )}

                <Button
                  className="mt-6 h-12 w-full rounded-xl"
                  onClick={() => void handleNext()}
                  disabled={!hasAnswer || submitting}
                >
                  {submitting ? (
                    "Saving..."
                  ) : aiFollowUp ? (
                    "Submit Follow-up"
                  ) : currentQ < activeQuestions.length - 1 ? (
                    "Next"
                  ) : (
                    "Submit"
                  )}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md"
            >
              <div className="glass-card rounded-3xl p-8">
                <h2 className="font-heading text-center text-xl font-bold">
                  Processing your response
                </h2>
                <div className="mt-8 space-y-6">
                  {["Uploading", "Transcribing", "Generating Summary"].map(
                    (label, i) => (
                      <div key={label}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span>{label}</span>
                          {i < processingIndex && (
                            <Check className="size-4 text-primary" />
                          )}
                        </div>
                        <Progress
                          value={i < processingIndex ? 100 : 0}
                          className="h-2"
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md text-center"
            >
              <div className="glass-card rounded-3xl p-8">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/20">
                  <Check className="size-8 text-primary" />
                </div>
                <h2 className="font-heading mt-6 text-2xl font-bold">
                  Thank you!
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Your responses have been submitted. We&apos;ll be in touch
                  soon.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
