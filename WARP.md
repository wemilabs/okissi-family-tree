# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Setup & Installation
```pwsh
# Install dependencies (using pnpm)
pnpm install

# Set up environment variables
# Required: DATABASE_URL (Neon PostgreSQL connection string)
```

### Development
```pwsh
# Start development server (runs on http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Code Quality
```pwsh
# Lint code (uses Biome)
pnpm lint

# Format code (uses Biome)
pnpm format
```

### Database Operations
```pwsh
# Push database schema changes to Neon DB
pnpm db:push

# Note: Database auto-seeds initial family data on first run
```

## Architecture Overview

### Core Concept
This is a **3-generation family tree application** where:
- **Generation 1**: Ancestors (roots) - Joseph OKISSI and Anne-Marie OGANDAGA
- **Generation 2**: Parents (13 children) - can have grandchildren added to them
- **Generation 3**: Grandchildren - added dynamically through the form

### Technology Stack
- **Framework**: Next.js 16 with App Router and React 19
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Styling**: Tailwind CSS v4 + Shadcn UI components
- **Linting/Formatting**: Biome (replaces ESLint + Prettier)
- **Features**: React Compiler enabled, Server Actions, PPR caching

### Data Flow Architecture

**Database Layer** (`/db`)
- `schema.ts` - Drizzle schema defining two tables:
  - `persons` table: stores family members with id, name, generation, parentId, children array, birthRank
  - `metadata` table: stores system state (e.g., next_id counter)
- `drizzle.ts` - Database connection using Neon serverless driver with lazy initialization pattern
- Auto-seeding: Initial family data is seeded automatically on first database access

**Business Logic Layer** (`/lib`)
- `family-actions.ts` - Server actions (Next.js 16 "use cache" directive)
  - Cached reads with `cacheTag("family-data")`
  - Writes trigger `revalidateTag("family-data", "max")`
  - Key operations: `addPerson()`, `getFamilyData()`, `buildFamilyTree()`
  - Validates birth rank uniqueness per parent

**Type Definitions** (`/types`)
- `family.ts` - Core interfaces:
  - `Person`: base person model
  - `FamilyData`: persons array + nextId counter
  - `FamilyTreeNode`: Person extended with nested children for tree rendering
  - `AddPersonForm`: form input structure

**UI Layer** (`/components`)
- `family-form.tsx` - Server form component for adding Generation 3 members
- `family-tree.tsx` - Recursive tree renderer showing all generations
- `person-node.tsx` - Individual person card with metadata display
- `/ui` - Shadcn components (Button, Card, Select, etc.)

**Routes** (`/app`)
- `/` (page.tsx) - Home page with form to add grandchildren
- `/tree` (tree/page.tsx) - Full family tree visualization
- `layout.tsx` - Root layout with theme provider and header

### Key Patterns

**Caching Strategy**
- Uses Next.js 16's "use cache" directive with cache tags
- All reads go through cached `getFamilyData()`
- Writes invalidate cache with `revalidateTag()` for immediate consistency

**Data Constraints**
- Currently hardcoded to only accept Generation 3 (grandchildren) additions
- Birth rank must be unique per parent (validated before insert)
- Parent-child relationships stored bidirectionally (parentId + children array)

**Path Alias**
- Uses `@/*` to resolve to project root (configured in tsconfig.json)

## Important Implementation Notes

- **No manual TypeScript compilation needed**: Next.js handles all TypeScript
- **Database URL required**: Application will throw error without `DATABASE_URL` environment variable
- **Biome for linting**: Uses Biome instead of ESLint/Prettier - different CLI commands
- **React Compiler enabled**: Automatic memoization, avoid manual `useMemo`/`useCallback` unless necessary
- **Server Actions**: Form submissions use Server Actions, not API routes
- **Drizzle migrations**: Use `pnpm db:push` to sync schema (not traditional migration files)
