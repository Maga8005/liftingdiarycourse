# Server Components Coding Standards

## Overview

This document outlines the mandatory coding standards for Server Components in this Next.js 15+ project.

## Critical Rule: Async Params and SearchParams

**In Next.js 15, `params` and `searchParams` are Promises and MUST be awaited.**

This is a breaking change from Next.js 14. Failing to await these values will cause runtime errors.

## Params in Dynamic Routes

### Type Definition

Always type `params` as a `Promise`:

```typescript
interface PageProps {
  params: Promise<{ id: string }>;
}

// For multiple dynamic segments
interface PageProps {
  params: Promise<{ categoryId: string; productId: string }>;
}
```

### Accessing Params

**ALWAYS await `params` before accessing its values:**

```typescript
// CORRECT - Await params before destructuring
export default async function Page({ params }: PageProps) {
  const { id } = await params;

  // Now you can use id
  const data = await getData(id);

  return <div>{data.name}</div>;
}

// WRONG - Accessing params without await (WILL FAIL)
export default async function Page({ params }: PageProps) {
  const { id } = params; // Error: params is a Promise!

  return <div>{id}</div>;
}
```

## SearchParams in Pages

### Type Definition

Always type `searchParams` as a `Promise`:

```typescript
interface PageProps {
  searchParams: Promise<{ query?: string; page?: string }>;
}
```

### Accessing SearchParams

**ALWAYS await `searchParams` before accessing its values:**

```typescript
// CORRECT - Await searchParams
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.query ?? "";
  const page = params.page ?? "1";

  const results = await search(query, parseInt(page));

  return <SearchResults results={results} />;
}

// WRONG - Accessing searchParams without await (WILL FAIL)
export default async function Page({ searchParams }: PageProps) {
  const query = searchParams.query; // Error: searchParams is a Promise!

  return <div>{query}</div>;
}
```

## Complete Example

```typescript
// app/dashboard/workout/[workoutId]/page.tsx
import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({
  params,
}: EditWorkoutPageProps) {
  // 1. Authenticate user
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Await params before accessing
  const { workoutId } = await params;
  const workoutIdNum = parseInt(workoutId, 10);

  if (isNaN(workoutIdNum)) {
    notFound();
  }

  // 3. Fetch data using the param value
  const workout = await getWorkoutById(workoutIdNum, userId);

  if (!workout) {
    notFound();
  }

  return <WorkoutEditor workout={workout} />;
}
```

## Combined Params and SearchParams

When a page needs both:

```typescript
interface PageProps {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{ sort?: string; filter?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  // Await both - can be done in parallel
  const [{ categoryId }, search] = await Promise.all([
    params,
    searchParams,
  ]);

  const sort = search.sort ?? "date";
  const filter = search.filter;

  const products = await getProducts(categoryId, { sort, filter });

  return <ProductList products={products} />;
}
```

## Why This Change?

Next.js 15 made `params` and `searchParams` asynchronous to:

- Enable better streaming and partial rendering
- Improve performance by allowing the framework to defer param resolution
- Support more advanced caching strategies

## Summary Checklist

Before writing any Server Component with dynamic routes, verify:

- [ ] `params` is typed as `Promise<{ ... }>`
- [ ] `params` is awaited before accessing any values
- [ ] `searchParams` is typed as `Promise<{ ... }>` (if used)
- [ ] `searchParams` is awaited before accessing any values

## Violations

Any PR containing Server Components that access `params` or `searchParams` without awaiting them will be rejected.
