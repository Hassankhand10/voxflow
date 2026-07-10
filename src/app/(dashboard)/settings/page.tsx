"use client";

import { useRouter } from "next/navigation";
import { LogOut, Mail, User } from "lucide-react";
import { MadeByHassan } from "@/components/shared/made-by-hassan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your account details.
        </p>
      </div>

      <Card className="glass-card rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="font-heading text-base font-semibold">
            Your account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
            <User className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{user?.name ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
            <Mail className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email ?? "—"}</p>
            </div>
          </div>
          {user?.workspace?.name && (
            <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Workspace</p>
                <p className="font-medium">{user.workspace.name}</p>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            className="rounded-xl text-destructive hover:text-destructive"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-center pb-4">
        <MadeByHassan />
      </div>
    </div>
  );
}
