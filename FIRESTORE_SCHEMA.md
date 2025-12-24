# Cloud Firestore Schema Design for LEARNR

## 1. Users Collection
- **Collection Path:** `users`
- **Document ID:** `uid` (The Firebase Auth User ID)
- **Purpose:** Stores user profile information.

### Fields:
| Field Name | Type | Description |
|---|---|---|
| `email` | string | User's email address |
| `fullName` | string | User's full name |
| `username` | string | Unique username |
| `avatar_url` | string/null | URL to profile picture |
| `createdAt` | timestamp | Account creation date |
| `updatedAt` | timestamp | Last profile update |

## 2. Categories Collection
- **Collection Path:** `categories`
- **Document ID:** Auto-generated
- **Purpose:** Stores user-defined task categories.

### Fields:
| Field Name | Type | Description |
|---|---|---|
| `user_id` | string | The UID of the owner. |
| `name` | string | Category name (e.g. "Homework") |
| `color` | string | Color hex code |
| `icon` | string/null | Emoji or icon string |
| `created_at` | timestamp | Creation time |

## 3. Tasks Collection
- **Collection Path:** `tasks`
- **Document ID:** Auto-generated
- **Purpose:** Stores tasks for all users. Queries are filtered by `user_id`.

### Fields:
| Field Name | Type | Description |
|---|---|---|
| `user_id` | string | The UID of the owner. **CRITICAL for security rules.** |
| `title` | string | Task title |
| `description` | string/null | Task details |
| `is_completed` | boolean | Completion status |
| `completed_at` | timestamp/null | When the task was finished |
| `priority` | string | 'low', 'medium', 'high' |
| `due_date` | timestamp/string/null | Deadline |
| `category_id` | string/null | Reference to `categories` document ID |
| `reminder_at` | timestamp/string/null | Reminder time |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last update time |

## Indexes
- **tasks**: Composite index on `user_id` (Ascending) and `created_at` (Descending) is recommended for fetching user's tasks ordered by creation time.
- **categories**: Composite index on `user_id` (Ascending) and `created_at` (Ascending) for fetching user's categories.
