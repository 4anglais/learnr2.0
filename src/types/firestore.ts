/**
 * Firestore Data Models
 * 
 * These interfaces define the structure of documents in Firestore collections.
 * All timestamps are stored as Firestore Timestamps but converted to ISO strings in the app.
 */

// users/{uid}
export interface FirestoreUser {
  email: string;
  fullName: string;
  nickname: string;
  username: string;
  avatar_url: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// tasks/{taskId}
export interface FirestoreTask {
  user_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  due_date: Date | string | null;
  priority: 'low' | 'medium' | 'high';
  is_completed: boolean;
  completed_at: Date | string | null;
  reminder_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

// categories/{categoryId}
export interface FirestoreCategory {
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  created_at: Date | string;
}

// focusSessions/{sessionId}
export interface FirestoreFocusSession {
  user_id: string;
  task_id: string | null;
  duration_minutes: number;
  started_at: Date | string;
  completed_at: Date | string | null;
  is_completed: boolean;
  session_type: 'focus' | 'short_break' | 'long_break';
  created_at: Date | string;
}

// study_sessions/{sessionId}
export interface FirestoreStudySession {
  user_id: string;
  task_id: string | null;
  step_id: string | null;
  scheduled_date: string; // YYYY-MM-DD format
  start_time: string; // HH:mm format
  duration_minutes: number;
  is_completed: boolean;
  created_at: Date | string;
}

// roadmaps/{roadmapId}
export interface FirestoreRoadmap {
  user_id: string;
  title: string;
  description: string | null;
  duration_weeks: number;
  is_completed: boolean;
  completed_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

// milestones/{milestoneId}
export interface FirestoreMilestone {
  roadmap_id: string;
  title: string;
  description: string | null;
  position: number;
  color: string;
  created_at: Date | string;
}

// steps/{stepId}
export interface FirestoreStep {
  milestone_id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  resource_url: string | null;
  is_completed: boolean;
  completed_at: Date | string | null;
  position: number;
  linked_task_id: string | null;
  created_at: Date | string;
}

// subtasks/{subtaskId}
export interface FirestoreSubtask {
  task_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: Date | string;
}

// user_settings/{uid}
export interface FirestoreUserSettings {
  user_id: string;
  study_hours_per_day: number;
  preferred_study_start_time: string; // HH:mm:ss format
  preferred_study_end_time: string; // HH:mm:ss format
  focus_duration_minutes: number;
  short_break_minutes: number;
  long_break_minutes: number;
  sessions_before_long_break: number;
  theme: 'light' | 'dark' | 'system';
  notification_enabled: boolean;
  reminder_before_deadline_hours: number;
  created_at: Date | string;
  updated_at: Date | string;
}

