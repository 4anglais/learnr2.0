# Firebase Setup Guide for Learnr

This document outlines the Firestore collections and security rules needed for the application.

## Collections to Create

Create the following Firestore collections:

### 1. `users` Collection
**Purpose**: Stores user profile information

**Fields**:
- `email` (string) - User's email address
- `fullName` (string) - User's full name
- `nickname` (string) - Display nickname (optional)
- `username` (string) - Unique username (indexed)
- `avatar_url` (string, nullable) - URL to profile avatar image
- `createdAt` (timestamp) - Account creation date
- `updatedAt` (timestamp) - Last profile update

**Document ID**: Firebase Auth UID

### 2. `tasks` Collection
**Purpose**: Stores user tasks

**Fields**:
- `user_id` (string) - Reference to user
- `category_id` (string, nullable) - Reference to category
- `title` (string) - Task title
- `description` (string, nullable) - Task description
- `due_date` (string, nullable) - Due date (ISO format)
- `priority` (string) - 'low' | 'medium' | 'high'
- `is_completed` (boolean) - Completion status
- `completed_at` (timestamp, nullable) - Completion date
- `reminder_at` (timestamp, nullable) - Reminder time
- `created_at` (timestamp) - Creation date
- `updated_at` (timestamp) - Last update

### 3. `categories` Collection
**Purpose**: Stores task categories

**Fields**:
- `user_id` (string) - Reference to user
- `name` (string) - Category name
- `color` (string) - Hex color code
- `icon` (string, nullable) - Emoji or icon
- `created_at` (timestamp) - Creation date

### 4. `focus_sessions` Collection
**Purpose**: Stores Pomodoro/focus sessions

**Fields**:
- `user_id` (string) - Reference to user
- `task_id` (string, nullable) - Reference to task
- `duration_minutes` (number) - Session duration
- `started_at` (timestamp) - Start time
- `completed_at` (timestamp, nullable) - Completion time
- `is_completed` (boolean) - Completion status
- `session_type` (string) - 'focus' | 'short_break' | 'long_break'
- `created_at` (timestamp) - Creation date

### 5. `study_sessions` Collection
**Purpose**: Stores scheduled study sessions

**Fields**:
- `user_id` (string) - Reference to user
- `task_id` (string, nullable) - Reference to task
- `step_id` (string, nullable) - Reference to roadmap step
- `scheduled_date` (string) - Date (YYYY-MM-DD format)
- `start_time` (string) - Start time (HH:mm format)
- `duration_minutes` (number) - Duration
- `is_completed` (boolean) - Completion status
- `created_at` (timestamp) - Creation date

### 6. `roadmaps` Collection
**Purpose**: Stores learning roadmaps

**Fields**:
- `user_id` (string) - Reference to user
- `title` (string) - Roadmap title
- `description` (string, nullable) - Description
- `is_completed` (boolean) - Completion status
- `completed_at` (timestamp, nullable) - Completion date
- `created_at` (timestamp) - Creation date
- `updated_at` (timestamp) - Last update

### 7. `milestones` Collection
**Purpose**: Stores roadmap milestones (nested under roadmaps)

**Fields**:
- `roadmap_id` (string) - Reference to parent roadmap
- `title` (string) - Milestone title
- `description` (string, nullable) - Description
- `position` (number) - Order position
- `color` (string) - Color code
- `created_at` (timestamp) - Creation date

### 8. `steps` Collection
**Purpose**: Stores roadmap steps (nested under milestones)

**Fields**:
- `milestone_id` (string) - Reference to parent milestone
- `title` (string) - Step title
- `difficulty` (string) - 'beginner' | 'intermediate' | 'advanced'
- `resource_url` (string, nullable) - Learning resource URL
- `is_completed` (boolean) - Completion status
- `completed_at` (timestamp, nullable) - Completion date
- `position` (number) - Order position
- `linked_task_id` (string, nullable) - Reference to task
- `created_at` (timestamp) - Creation date

### 9. `user_settings` Collection
**Purpose**: Stores user preferences

**Fields**:
- `user_id` (string) - Reference to user
- `theme` (string) - 'light' | 'dark' | 'system'
- `notifications_enabled` (boolean)
- `email_reminders` (boolean)
- `study_hours_per_day` (number)
- `focus_duration_minutes` (number)
- `short_break_minutes` (number)
- `long_break_minutes` (number)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Firestore Indexes

Create the following composite indexes:

### For Tasks
- Collection: `tasks`
- Fields: `user_id` (Ascending), `created_at` (Descending)
- Fields: `user_id` (Ascending), `due_date` (Ascending)

### For Focus Sessions
- Collection: `focus_sessions`
- Fields: `user_id` (Ascending), `started_at` (Descending)

### For Study Sessions
- Collection: `study_sessions`
- Fields: `user_id` (Ascending), `scheduled_date` (Ascending)

### For Roadmaps
- Collection: `roadmaps`
- Fields: `user_id` (Ascending), `created_at` (Descending)

## Security Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth.uid == resource.data.user_id;
      allow create: if request.auth.uid == request.resource.data.user_id;
    }

    // Categories
    match /categories/{categoryId} {
      allow read, write: if request.auth.uid == resource.data.user_id;
      allow create: if request.auth.uid == request.resource.data.user_id;
    }

    // Focus Sessions
    match /focus_sessions/{sessionId} {
      allow read, write: if request.auth.uid == resource.data.user_id;
      allow create: if request.auth.uid == request.resource.data.user_id;
    }

    // Study Sessions
    match /study_sessions/{sessionId} {
      allow read, write: if request.auth.uid == resource.data.user_id;
      allow create: if request.auth.uid == request.resource.data.user_id;
    }

    // Roadmaps
    match /roadmaps/{roadmapId} {
      allow read, write: if request.auth.uid == resource.data.user_id;
      allow create: if request.auth.uid == request.resource.data.user_id;

      // Milestones (nested)
      match /milestones/{milestoneId} {
        allow read, write: if request.auth.uid == get(/databases/$(database)/documents/roadmaps/$(roadmapId)).data.user_id;
      }

      // Steps (nested)
      match /steps/{stepId} {
        allow read, write: if request.auth.uid == get(/databases/$(database)/documents/roadmaps/$(roadmapId)).data.user_id;
      }
    }

    // User Settings
    match /user_settings/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## Firebase Storage Setup

### Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User avatars
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write, delete: if request.auth.uid == userId;
    }

    // Task attachments
    match /tasks/{userId}/{allPaths=**} {
      allow read, write, delete: if request.auth.uid == userId;
    }
  }
}
```

## Steps to Configure in Firebase Console

1. **Go to Firestore Database**
   - Click "Create Database"
   - Start in test mode (for development)
   - Select your region

2. **Create Collections**
   - Manually create each collection using the structure above
   - OR let the app auto-create them as you use features

3. **Set Security Rules**
   - Go to "Rules" tab
   - Replace with the rules provided above

4. **Create Indexes**
   - Go to "Indexes" tab
   - Create composite indexes as listed above

5. **Configure Storage**
   - Go to Storage
   - Create bucket if not exists
   - Update storage rules as provided above

6. **Enable Authentication Methods**
   - Go to Authentication
   - Enable "Email/Password"
   - Enable "Google"
   - Add your app domain to authorized domains (Authentication > Settings > Authorized domains)
     - Add `localhost`
     - Add `127.0.0.1` if needed
     - Add any other domain you use (e.g., `192.168.x.x` for local network testing, or your deployed Vercel/Netlify domain)

## Notes

- Username uniqueness is enforced at the application level
- Images are stored in Firebase Storage (5MB max)
- All timestamps use Firestore server timestamps
- User data is private (only accessible to that user)
