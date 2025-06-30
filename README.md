# Hopium Prayer App

## Overview

The Hopium Prayer App is a Progressive Web Application (PWA) designed to help Muslims track and enhance their prayer experience through emotional design, community features, and personalized guidance. The app incorporates Lopi, an AI assistant that provides spiritual guidance and personalized support.

## Current Status

### Completed Features

- **Core UI Framework**
  - Next.js 14 with App Router
  - TypeScript implementation
  - Tailwind CSS with custom HSL theme
  - Shadcn/UI component library integration

- **Navigation System**
  - Consistent bottom navigation across all pages
  - Active state highlighting
  - Mobile-friendly design

- **Key Pages**
  - Dashboard (Home): Prayer journey tracking and quick actions
  - Calendar: Monthly view with prayer completion tracking
  - Lopi: AI assistant chat interface
  - Profile: User stats and preferences

- **PWA Foundation**
  - Web App Manifest
  - Service Worker setup
  - Offline fallback
  - Installation prompt

### In Progress

- Prayer time calculation integration
- Streak tracking system
- Enhanced AI assistant capabilities
- Community features

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI
- **PWA**: Service Workers (Workbox), Web App Manifest
- **State Management**: React Context (planned: Zustand)
- **Form Handling**: React Hook Form + Zod (planned)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/JoodasCode/hopium-prayer-app.git

# Navigate to project directory
cd hopium-prayer-app

# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev
```

The app will be available at http://localhost:3000

## Project Structure

```
src/
  app/           # Next.js App Router pages
  components/    # Reusable UI components
    ui/          # Shadcn components
    shared/      # Shared components (like BottomNav)
    dashboard/   # Dashboard-specific components
    calendar/    # Calendar-specific components
    lopi/        # Lopi AI assistant components
  lib/           # Utility functions and services
  styles/        # Global styles and Tailwind config
```

## Documentation

- [Project Plan](./Projectplan.md) - Detailed development timeline and technical specifications
- [Page Plan](./PagePlan.md) - Page-by-page breakdown of features and components

## Next Steps

See the [Project Plan](./Projectplan.md) for the detailed development roadmap.

## License

This project is proprietary and confidential.
