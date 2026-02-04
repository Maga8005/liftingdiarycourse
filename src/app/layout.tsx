import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import {
  ClerkProvider,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lifting Diary",
  description: "Your personal fitness companion. Track your workouts and achieve your goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SignedIn>
              <header className="flex justify-between items-center p-4">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Dumbbell className="h-6 w-6" />
                  <span className="text-xl font-bold">Lifting Diary</span>
                </Link>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <UserButton />
                </div>
              </header>
            </SignedIn>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
