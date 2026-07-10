"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronDown,
  Inbox,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Workflow,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SIDEBAR_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { MadeByHassan } from "@/components/shared/made-by-hassan";

const iconMap = {
  LayoutDashboard,
  Workflow,
  Inbox,
  BarChart3,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2) || "U";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <div className="px-3">
        <Button className="w-full justify-start gap-2 rounded-xl" asChild>
          <Link href="/flows/new">
            <Plus className="size-4" />
            New flow
          </Link>
        </Button>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {SIDEBAR_NAV.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-border/50 p-3">
        <div className="px-3 pb-1">
          <MadeByHassan variant="subtle" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-accent">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/20 text-xs text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="font-medium">{user?.name || "User"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <ChevronDown className="size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
