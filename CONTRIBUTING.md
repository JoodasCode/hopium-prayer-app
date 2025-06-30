# Contributing to Hopium Prayer App

Thank you for considering contributing to the Hopium Prayer App! This document provides guidelines and instructions for contributing to the project.

## Code Style

We follow the Airbnb Style Guide for JavaScript and TypeScript. Please ensure your code adheres to these standards.

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Prefer arrow functions
- Follow proper naming conventions:
  - PascalCase for components and classes
  - camelCase for variables and functions
  - UPPER_SNAKE_CASE for constants

## Development Workflow

### Branching Strategy

- `main` - Production code
- `staging` - Pre-production testing
- `develop` - Development branch
- Feature branches - For individual features or fixes

When working on a new feature or fix:

1. Create a new branch from `develop` with a descriptive name:
   ```bash
   git checkout -b feature/feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. Make your changes, following the code style guidelines

3. Commit your changes with clear, descriptive messages following conventional commits:
   ```bash
   git commit -m "feat: add prayer streak tracking"
   # or
   git commit -m "fix: correct calendar date selection"
   ```

4. Push your branch and create a pull request to the `develop` branch

## Pull Request Process

1. Ensure your code follows the style guidelines
2. Update documentation if necessary
3. Make sure all tests pass
4. Request a review from at least one team member

## Component Guidelines

### Creating New Components

1. Place components in the appropriate directory:
   - Reusable UI components in `src/components/ui`
   - Shared components in `src/components/shared`
   - Feature-specific components in their respective directories

2. Use TypeScript for type safety

3. Follow the component structure:
   ```tsx
   // Import statements
   import React from 'react';
   import { cn } from '@/lib/utils';
   
   // Types
   interface ComponentProps {
     // Props definition
   }
   
   // Component
   export default function Component({ prop1, prop2 }: ComponentProps) {
     // Component logic
     
     return (
       // JSX
     );
   }
   ```

### Styling

- Use Tailwind CSS for styling
- Use the `cn` utility for conditional class names
- Follow the project's color scheme and design tokens

## Testing

- Write tests for new features and bug fixes
- Ensure all tests pass before submitting a pull request

## Documentation

- Update documentation when adding or changing features
- Document complex logic with comments
- Keep the README and other documentation files up to date

## Questions?

If you have any questions or need help, please reach out to the project maintainers.
