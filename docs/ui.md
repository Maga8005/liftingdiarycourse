# UI Coding Standards

## Overview

This document outlines the mandatory UI coding standards for the Lifting Diary project.

## Component Library

**shadcn/ui is the ONLY approved component library for this project.**

- Documentation: https://ui.shadcn.com/
- All UI elements MUST be built using shadcn/ui components

## Rules

### 1. No Custom Components

**ABSOLUTELY NO custom UI components should be created.**

- Do not create custom buttons, inputs, modals, cards, or any other UI elements
- Do not create wrapper components around shadcn/ui components
- Do not style native HTML elements to create custom UI

### 2. Use shadcn/ui Exclusively

All UI must be composed using shadcn/ui components:

- `Button` - for all clickable actions
- `Input` - for text inputs
- `Card` - for content containers
- `Dialog` - for modals
- `Table` - for tabular data
- `Form` - for form handling
- `Select` - for dropdowns
- `Checkbox` - for boolean inputs
- `Toast` - for notifications
- And all other shadcn/ui components as needed

### 3. Adding New Components

When a new UI element is needed:

1. Check if shadcn/ui provides the component
2. Install it using: `npx shadcn@latest add <component-name>`
3. Use the installed component directly

### 4. Styling

- Use Tailwind CSS utility classes for layout and spacing
- Use shadcn/ui's built-in variants for component styling
- Do not override shadcn/ui component styles unless absolutely necessary

## Why This Standard?

- **Consistency**: Ensures uniform look and feel across the application
- **Accessibility**: shadcn/ui components are built with accessibility in mind
- **Maintainability**: Reduces custom code that needs to be maintained
- **Speed**: Faster development by using pre-built, tested components

## Date Formatting

**date-fns is the ONLY approved library for date formatting.**

### Format Standard

All dates displayed in the UI must follow this format:

```
do MMM yyyy
```

Examples:
- 1st Sep 2025
- 2nd Aug 2025
- 3rd Jan 2026
- 4th Jun 2024

### Usage

```typescript
import { format } from "date-fns";

const formattedDate = format(new Date(), "do MMM yyyy");
// Output: "24th Jan 2026"
```

### Rules

- Do not use native JavaScript date formatting methods
- Do not use other date libraries (moment.js, dayjs, etc.)
- All dates must be formatted consistently using the standard above

## Violations

Any PR containing custom UI components or incorrect date formatting will be rejected. If shadcn/ui does not provide a required component, raise the issue with the team before proceeding.
