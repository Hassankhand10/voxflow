import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { MadeByHassan } from "@/components/shared/made-by-hassan";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <Logo />
          <MadeByHassan className="mt-2" />
          <p className="mt-1 text-sm text-muted-foreground">
            Video responses + AI follow-ups
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/f/senior-react-dev" className="hover:text-foreground">
            Public Flow
          </Link>
        </div>
      </div>
    </footer>
  );
}
