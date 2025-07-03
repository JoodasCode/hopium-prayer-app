# Mulvi App Hooks Architecture

## Authentication Pattern

The Mulvi app uses a single, unified authentication pattern based on the `useAuth` hook. This hook is the source of truth for all authentication-related functionality.

### Key Authentication Components

- **`useAuth.ts`**: The primary hook for all authentication operations including:
  - Session management
  - Sign up
  - Sign in
  - Sign out
  - Password reset
  - Profile updates

### Data Hooks

Each data concern has its own dedicated hook:

- **`useUserStats.ts`**: For fetching user streak and statistics
- **`usePrayerRecords.ts`**: For managing prayer records (fetching and marking as completed)
- **`useUserSettings.ts`**: For managing user settings

### Deprecated Files

- **`useSupabase.ts`**: This file is deprecated and maintained only for backward compatibility. All hooks have been moved to dedicated files.

## Usage Guidelines

### Authentication

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, session, signIn, signOut, authLoading } = useAuth();
  
  // Check if user is authenticated
  if (!session) {
    return <p>Please sign in</p>;
  }
  
  // Use user data
  return <p>Welcome, {user?.email}</p>;
}
```

### Protected Routes

Protected routes should use the `useAuth` hook to check authentication status:

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

function ProtectedComponent() {
  const { session, authLoading } = useAuth();
  const router = useRouter();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
    }
  }, [session, authLoading, router]);
  
  if (authLoading) {
    return <LoadingSpinner />;
  }
  
  if (!session) {
    return <RedirectingMessage />;
  }
  
  return <YourProtectedContent />;
}
```

### Data Fetching

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useUserStats } from '@/hooks/useUserStats';
import { usePrayerRecords } from '@/hooks/usePrayerRecords';
import { useUserSettings } from '@/hooks/useUserSettings';

function Dashboard() {
  const { user } = useAuth();
  const userId = user?.id;
  
  // Get user stats
  const { userStats, isLoading: statsLoading } = useUserStats(userId);
  
  // Get prayer records for today
  const today = new Date().toISOString().split('T')[0];
  const { prayerRecords, isLoading: recordsLoading } = usePrayerRecords(userId, today);
  
  // Get user settings
  const { settings, isLoading: settingsLoading } = useUserSettings(userId);
  
  // Rest of your component...
}
```

## Best Practices

1. **Always use the dedicated hooks** - Don't import from deprecated files
2. **Handle loading states** - All hooks provide isLoading properties
3. **Error handling** - All hooks provide error properties
4. **User ID dependency** - Most data hooks require a user ID, which should come from useAuth
5. **React Query integration** - All data hooks use React Query for caching and state management

By following these patterns, we maintain a clean, consistent, and maintainable authentication system throughout the app.
