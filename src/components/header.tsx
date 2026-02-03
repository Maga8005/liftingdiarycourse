"use client";

import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const pathname = usePathname();

  // Hide header on sign-in and sign-up pages
  if (pathname === "/sign-in" || pathname === "/sign-up") {
    return null;
  }

  return (
    <header className="flex justify-end items-center p-4 gap-4">
      <SignedOut>
        <SignInButton mode="modal" />
        <SignUpButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <ThemeToggle />
        <UserButton />
      </SignedIn>
    </header>
  );
}
