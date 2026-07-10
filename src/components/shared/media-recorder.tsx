"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Mic,
  RotateCcw,
  Square,
  Upload,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface MediaRecording {
  fileUrl: string;
  fileType: string;
  duration: number;
  previewUrl: string;
}

interface MediaRecorderPanelProps {
  mode: "video" | "audio";
  timeLimit?: number;
  allowRetakes?: boolean;
  onRecordingComplete: (recording: MediaRecording) => void;
  onClear?: () => void;
  className?: string;
}

function pickMimeType(mode: "video" | "audio") {
  const candidates =
    mode === "video"
      ? [
          "video/webm;codecs=vp9,opus",
          "video/webm;codecs=vp8,opus",
          "video/webm",
          "video/mp4",
        ]
      : ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MediaRecorderPanel({
  mode,
  timeLimit = 120,
  allowRetakes = true,
  onRecordingComplete,
  onClear,
  className,
}: MediaRecorderPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [status, setStatus] = useState<
    "idle" | "preview" | "recording" | "uploading" | "done" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const updatePreviewUrl = useCallback((url: string | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = url;
    setPreviewUrl(url);
  }, []);
  const [recording, setRecording] = useState<MediaRecording | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startPreview = useCallback(async () => {
    setError(null);
    setStatus("idle");

    try {
      stopStream();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: mode === "video",
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current && mode === "video") {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus("preview");
    } catch {
      setError(
        "Camera or microphone access was denied. Allow permissions or upload a file instead.",
      );
      setStatus("error");
    }
  }, [mode, stopStream]);

  useEffect(() => {
    startPreview();
    return () => {
      clearTimer();
      stopStream();
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [mode, startPreview, clearTimer, stopStream]);

  const uploadBlob = async (blob: Blob, mimeType: string, duration: number) => {
    setStatus("uploading");
    const ext = mimeType.includes("mp4")
      ? ".mp4"
      : mimeType.includes("ogg")
        ? ".ogg"
        : ".webm";
    const file = new File(
      [blob],
      `response-${Date.now()}${ext}`,
      { type: mimeType || "video/webm" },
    );

    const uploaded = await uploadFile(file);
    const localPreview = URL.createObjectURL(blob);
    updatePreviewUrl(localPreview);

    const result: MediaRecording = {
      fileUrl: uploaded.url,
      fileType: uploaded.mimetype || mimeType,
      duration: Math.max(1, Math.floor(duration)),
      previewUrl: localPreview,
    };

    setRecording(result);
    setStatus("done");
    onRecordingComplete(result);
  };

  const stopRecording = async () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    clearTimer();

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    stopStream();

    const mimeType = recorder.mimeType || pickMimeType(mode);
    const blob = new Blob(chunksRef.current, { type: mimeType });
    chunksRef.current = [];

    try {
      await uploadBlob(blob, mimeType, elapsedRef.current);
    } catch {
      setError("Failed to upload recording. Please try again.");
      setStatus("error");
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const mimeType = pickMimeType(mode);
    const recorder = mimeType
      ? new MediaRecorder(streamRef.current, { mimeType })
      : new MediaRecorder(streamRef.current);

    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorderRef.current = recorder;
    recorder.start(1000);
    elapsedRef.current = 0;
    setElapsed(0);
    setStatus("recording");

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= timeLimit) {
        void stopRecording();
      }
    }, 1000);
  };

  const handleRetake = async () => {
    clearTimer();
    recorderRef.current = null;
    chunksRef.current = [];
    elapsedRef.current = 0;
    setElapsed(0);
    setRecording(null);
    onClear?.();

    updatePreviewUrl(null);

    await startPreview();
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setStatus("uploading");

    try {
      const uploaded = await uploadFile(file);
      const localPreview = URL.createObjectURL(file);
      updatePreviewUrl(localPreview);

      const result: MediaRecording = {
        fileUrl: uploaded.url,
        fileType: uploaded.mimetype || file.type,
        duration: 30,
        previewUrl: localPreview,
      };

      setRecording(result);
      setStatus("done");
      stopStream();
      onRecordingComplete(result);
    } catch {
      setError("Upload failed. Please try a smaller file or record again.");
      setStatus("error");
    }
  };

  const showPreview = status === "preview" || status === "recording";
  const showPlayback = status === "done" && previewUrl;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
        {mode === "video" && (
          <>
            {showPreview && (
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                muted
                playsInline
                autoPlay
              />
            )}
            {showPlayback && (
              <video
                src={previewUrl}
                className="h-full w-full object-cover"
                controls
                playsInline
              />
            )}
          </>
        )}

        {mode === "audio" && (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
            <div
              className={cn(
                "flex size-20 items-center justify-center rounded-full",
                status === "recording"
                  ? "animate-pulse bg-red-500/20"
                  : "bg-primary/15",
              )}
            >
              <Mic
                className={cn(
                  "size-10",
                  status === "recording"
                    ? "text-red-500"
                    : "text-muted-foreground",
                )}
              />
            </div>
            {showPlayback && (
              <audio src={previewUrl} controls className="w-full max-w-sm" />
            )}
            {!showPlayback && status !== "recording" && (
              <p className="text-sm text-muted-foreground">
                Record your audio answer below
              </p>
            )}
          </div>
        )}

        {!showPreview && !showPlayback && status !== "recording" && (
          <div className="flex h-full flex-col items-center justify-center">
            {status === "uploading" ? (
              <Loader2 className="size-10 animate-spin text-primary" />
            ) : (
              <Video className="size-12 text-muted-foreground/50" />
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              {status === "uploading"
                ? "Uploading your recording..."
                : "Allow camera access to record"}
            </p>
          </div>
        )}

        {status === "recording" && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1 text-xs font-medium text-white">
            <span className="size-2 animate-pulse rounded-full bg-white" />
            REC {formatTimer(elapsed)}
            {timeLimit > 0 && (
              <span className="text-white/80">/ {formatTimer(timeLimit)}</span>
            )}
          </div>
        )}

        {recording && status === "done" && (
          <div className="absolute right-4 top-4 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-medium text-white">
            Saved · {formatTimer(recording.duration)}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {status === "preview" && (
          <Button
            size="lg"
            className="rounded-xl"
            onClick={startRecording}
            disabled={status === "uploading"}
          >
            <Video className="size-4" />
            Record
          </Button>
        )}

        {status === "recording" && (
          <Button
            size="lg"
            variant="destructive"
            className="rounded-xl"
            onClick={() => void stopRecording()}
          >
            <Square className="size-4 fill-current" />
            Stop
          </Button>
        )}

        {(status === "done" || status === "error") && allowRetakes && (
          <Button
            variant="outline"
            size="lg"
            className="glass rounded-xl"
            onClick={() => void handleRetake()}
            disabled={status === "uploading"}
          >
            <RotateCcw className="size-4" />
            Retake
          </Button>
        )}

        <Button
          variant="outline"
          size="lg"
          className="glass rounded-xl"
          onClick={() => fileInputRef.current?.click()}
          disabled={status === "uploading" || status === "recording"}
        >
          <Upload className="size-4" />
          Upload
        </Button>

        {status === "error" && (
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl"
            onClick={() => void startPreview()}
          >
            Retry Camera
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={mode === "video" ? "video/*" : "audio/*"}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFileUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
