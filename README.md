# OKISSI Family Tree

A modern web application for managing and visualizing the OKISSI family genealogy. Built with Next.js 16, this app allows to view the family tree and add new family members in a structured, hierarchical format.

<div align="center">

<p align="center">
  <img src="https://ubrw5iu3hw.ufs.sh/f/TFsxjrtdWsEI2nMSS96OWeVvZR7TyuB8q0wYA9LGpXglijMJ" alt="OKISSI's Family Logo" />
</p>

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

[Live Demo](https://okissi-family-tree.vercel.app) • [Report Bug](https://github.com/wemilabs/okissi-family-tree/issues) • [Request Feature](https://github.com/wemilabs/okissi-family-tree/issues)

</div>

## Features

- **Interactive Family Tree**: Visualize the family structure with generations displayed in a tree format
- **Add Family Members**: Add grandchildren (petit-enfants) to existing parents in the second generation
- **Responsive Design**: Clean, modern UI with dark/light mode support
- **Real-time Updates**: Changes are reflected immediately in the tree view
- **Data Persistence**: Family data is stored locally in JSON format

## How It Works

### Data Structure

The application organizes family members across generations:

- **Generation 1**: Ancestors (roots of the tree)
- **Generation 2**: Parents (can have children added to them)
- **Generation 3**: Grandchildren (added through the form)

Each person has:

- Name
- Generation number
- Parent relationship
- Children relationships
- Birth rank (for ordering siblings)

### Core Functionality

1. **Viewing the Tree**: Navigate to `/tree` to see the complete family structure with all generations connected
2. **Adding Members**: Use the home page form to add grandchildren by:
   - Entering the child's name
   - Selecting a parent from generation 2
   - Specifying birth order (automatically suggested)

### Technical Implementation

- **Framework**: Next.js 16 with App Router
- **UI**: React 19 components with Tailwind CSS styling
- **Data Storage**: Local JSON file (`lib/family-data.json`)
- **Caching**: Server-side caching with Next.js cache tags
- **Forms**: Server Actions for form handling and data mutations
- **Styling**: Responsive design with dark/light theme support

## Usage

1. **Add Family Members**: Fill out the form on the home page to add grandchildren
2. **View Tree**: Click "Voir l'arbre" (View Tree) to see the complete family structure
3. **Toggle Theme**: Use the theme toggle to switch between light and dark modes

## Technologies Used

- [Next.js](https://nextjs.org) - React framework
- [React](https://reactjs.org) - UI library
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Shadcn UI](https://ui.shadcn.com) - Component distribution system
- [Lucide React](https://lucide.dev) - Icons

## Project Structure

```
├── app/                 # Next.js app router pages
│   ├── page.tsx        # Home page with add member form
│   └── tree/           # Family tree visualization page
├── components/         # React components
│   ├── family-form.tsx # Form for adding new members
│   ├── family-tree.tsx # Tree visualization component
│   └── ui/            # Reusable UI components
├── lib/               # Business logic and data access
│   ├── family-actions.ts # Server actions for data operations
│   └── family-data.json  # Family data storage
└── types/             # TypeScript type definitions
    └── family.ts      # Family-related types
```
