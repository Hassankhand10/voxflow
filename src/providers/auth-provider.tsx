"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
}

export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, isInitialized, router]);

  return { isAuthenticated, isLoading: isLoading || !isInitialized };
}
