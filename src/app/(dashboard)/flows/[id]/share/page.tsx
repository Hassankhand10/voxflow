"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, ExternalLink, Link2 } from "lucide-react";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Flow {
  id: string;
  name: string;
  slug: string;
  status: string;
  requireEmail: boolean;
  allowRetakes: boolean;
}

export default function ShareFlowPage() {
  const params = useParams();
  const flowId = params.id as string;
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [requireEmail, setRequireEmail] = useState(true);
  const [allowRetakes, setAllowRetakes] = useState(true);
  const [saved, setSaved] = useState(false);

  const { data: flow, isLoading } = useQuery({
    queryKey: ["flow", flowId],
    queryFn: () => api<Flow>(API_ENDPOINTS.flows.byId(flowId)),
  });

  useEffect(() => {
    if (flow) {
      setRequireEmail(flow.requireEmail);
      setAllowRetakes(flow.allowRetakes);
    }
  }, [flow]);

  const saveSettings = useMutation({
    mutationFn: (data: { requireEmail: boolean; allowRetakes: boolean }) =>
      api(API_ENDPOINTS.flows.sharingSettings(flowId), {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flow", flowId] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const shareUrl =
    typeof window !== "undefined" && flow
      ? `${window.location.origin}/f/${flow.slug}`
      : "";

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateSetting = (
    key: "requireEmail" | "allowRetakes",
    value: boolean,
  ) => {
    const next = {
      requireEmail: key === "requireEmail" ? value : requireEmail,
      allowRetakes: key === "allowRetakes" ? value : allowRetakes,
    };
    if (key === "requireEmail") setRequireEmail(value);
    else setAllowRetakes(value);
    saveSettings.mutate(next);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Share flow
        </h1>
        <p className="mt-1 text-muted-foreground">
          Copy the link and send it to anyone who should answer.
        </p>
      </div>

      <Card className="glass-card rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="font-heading text-base font-semibold">
            {flow?.name}
          </CardTitle>
          {flow?.status !== "PUBLISHED" && (
            <p className="text-xs text-amber-700">
              Publish this flow first so the link works for everyone.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                readOnly
                value={shareUrl}
                className="h-11 rounded-xl pl-10 font-mono text-sm"
              />
            </div>
            <Button className="h-11 rounded-xl px-6" onClick={handleCopy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          {flow && (
            <Button variant="outline" className="rounded-xl" asChild>
              <a
                href={`/f/${flow.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" />
                Preview
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card rounded-2xl border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-base font-semibold">
            Link settings
          </CardTitle>
          {saved && (
            <span className="text-xs font-medium text-emerald-600">Saved</span>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Ask for email</Label>
              <p className="text-xs text-muted-foreground">
                Show an email field on the intro screen
              </p>
            </div>
            <Switch
              checked={requireEmail}
              onCheckedChange={(v) => updateSetting("requireEmail", v)}
              disabled={saveSettings.isPending}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Allow retakes</Label>
              <p className="text-xs text-muted-foreground">
                Let people re-record before submitting
              </p>
            </div>
            <Switch
              checked={allowRetakes}
              onCheckedChange={(v) => updateSetting("allowRetakes", v)}
              disabled={saveSettings.isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
