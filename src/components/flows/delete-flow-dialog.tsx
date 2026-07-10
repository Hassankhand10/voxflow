"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteFlowDialogProps {
  flowId: string;
  flowName: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  redirectTo?: string;
}

export function DeleteFlowDialog({
  flowId,
  flowName,
  trigger,
  open: controlledOpen,
  onOpenChange,
  redirectTo = "/flows",
}: DeleteFlowDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api(API_ENDPOINTS.flows.byId(flowId), { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["flows"] });
      setOpen(false);
      router.push(redirectTo);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger
          nativeButton={false}
          render={trigger as React.ReactElement}
        />
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete flow?</DialogTitle>
              <DialogDescription className="mt-1">
                <span className="font-medium text-foreground">{flowName}</span>{" "}
                and all its responses will be permanently deleted.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="rounded-xl"
            onClick={() => void handleDelete()}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete flow"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
