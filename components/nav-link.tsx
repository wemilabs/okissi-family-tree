"use client";

import { Loader2 } from "lucide-react";
import type { Route } from "next";
import Link, { useLinkStatus } from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function NavPendingIndicator() {
  const { pending } = useLinkStatus();

  if (!pending) {
    return null;
  }

  return <Loader2 aria-hidden className="size-3.5 animate-spin" />;
}

interface NavLinkProps {
  href: Route;
  children: ReactNode;
  className?: string;
}

export function NavLink({ href, children, className }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium hover:underline",
        className,
      )}
    >
      {children}
      <NavPendingIndicator />
    </Link>
  );
}
