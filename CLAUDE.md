# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Documentation First

**ALWAYS refer to the relevant documentation files in the `/docs` directory BEFORE generating any code.**

The `/docs` directory contains coding standards and guidelines that MUST be followed:

- `docs/ui.md` - UI component standards (shadcn/ui only, date formatting)
- `docs/data-fetching.md` - Data fetching standards (Server Components only, Drizzle ORM, user data isolation)

**Workflow:**
1. Identify which docs are relevant to the task
2. Read and understand the standards defined in those docs
3. Generate code that strictly adheres to those standards

Failure to follow documentation standards will result in non-compliant code.

## Project Overview

Lifting Diary - A workout tracking application built with Next.js 16 using the App Router pattern.

## Commands

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

## Tech Stack

- **Framework**: Next.js 16.1.1 with App Router
- **Language**: TypeScript 5 (strict mode enabled)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono via next/font
- **Linting**: ESLint 9 with next/core-web-vitals and typescript configs

## Architecture

This project uses Next.js App Router architecture:

- `app/` - Application routes and layouts (file-based routing)
  - `layout.tsx` - Root layout with fonts and global styles
  - `page.tsx` - Home page component
  - `globals.css` - Global Tailwind styles
- `public/` - Static assets served at root path

## Path Aliases

The project uses `@/*` to reference files from the project root:
```typescript
import { Component } from "@/components/Component";
```

## TypeScript Configuration

- Strict mode enabled
- Module resolution: bundler (for Next.js compatibility)
- JSX: react-jsx
