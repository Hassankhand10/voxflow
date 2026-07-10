"use client";

import { useRef, useState } from "react";
import { Loader2, Mic, Trash2, Upload, Video } from "lucide-react";
import { uploadFile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface QuestionMediaUploadProps {
  mediaUrl?: string | null;
  mediaType?: string | null;
  acceptVideo?: boolean;
  acceptAudio?: boolean;
  onChange: (media: { mediaUrl: string; mediaType: string } | null) => void;
  className?: string;
}

export function QuestionMediaUpload({
  mediaUrl,
  mediaType,
  acceptVideo = true,
  acceptAudio = true,
  onChange,
  className,
}: QuestionMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = [
    acceptVideo ? "video/*" : "",
    acceptAudio ? "audio/*" : "",
  ]
    .filter(Boolean)
    .join(",");

  const isVideo = mediaType?.startsWith("video");
  const isAudio = mediaType?.startsWith("audio");

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const result = await uploadFile(file);
      onChange({
        mediaUrl: result.url,
        mediaType: result.mimetype || file.type,
      });
    } catch {
      setError("Upload failed. Try a smaller file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <Label>Question video or audio (optional)</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Record yourself asking the question — respondents see this before they
          answer. You can also use text only.
        </p>
      </div>

      {mediaUrl ? (
        <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
          {isVideo && (
            <video
              src={mediaUrl}
              controls
              playsInline
              className="aspect-video w-full bg-black object-cover"
            />
          )}
          {isAudio && !isVideo && (
            <div className="flex items-center gap-3 p-4">
              <Mic className="size-5 text-primary" />
              <audio src={mediaUrl} controls className="w-full" />
            </div>
          )}
          {!isVideo && !isAudio && mediaUrl && (
            <video
              src={mediaUrl}
              controls
              playsInline
              className="aspect-video w-full bg-black"
            />
          )}
          <div className="flex justify-end gap-2 border-t border-border/50 p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onChange(null)}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
          {uploading ? (
            <Loader2 className="size-8 animate-spin text-primary" />
          ) : (
            <>
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Video className="size-6 text-primary" />
              </div>
              <p className="mt-3 text-sm font-medium">Add a prompt clip</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Upload a short video or audio where you ask this question
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 rounded-xl"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="size-4" />
                Upload file
              </Button>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {mediaUrl && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="size-4" />
          Replace file
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
