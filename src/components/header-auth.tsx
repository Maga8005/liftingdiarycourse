"use client";

import { SignInButton, SignUpButton, SignedOut } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export function HeaderAuth() {
  const pathname = usePathname();

  // Hide auth buttons on sign-in and sign-up pages to avoid duplication
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";

  if (isAuthPage) {
    return null;
  }

  return (
    <SignedOut>
      <SignInButton mode="modal" />
      <SignUpButton mode="modal" />
    </SignedOut>
  );
}
