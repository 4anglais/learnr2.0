-- Add subtasks table
CREATE TABLE public.subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on subtasks
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- Subtasks policies (access through parent task ownership)
CREATE POLICY "Users can view subtasks of their tasks"
ON public.subtasks FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid()
));

CREATE POLICY "Users can create subtasks for their tasks"
ON public.subtasks FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid()
));

CREATE POLICY "Users can update subtasks of their tasks"
ON public.subtasks FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid()
));

CREATE POLICY "Users can delete subtasks of their tasks"
ON public.subtasks FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid()
));

-- Add recurring task fields to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT; -- daily, weekly, monthly
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMP WITH TIME ZONE;

-- Create focus_sessions table for Pomodoro tracking
CREATE TABLE public.focus_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 25,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  session_type TEXT NOT NULL DEFAULT 'focus', -- focus, short_break, long_break
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on focus_sessions
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- Focus sessions policies
CREATE POLICY "Users can view their own focus sessions"
ON public.focus_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own focus sessions"
ON public.focus_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus sessions"
ON public.focus_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own focus sessions"
ON public.focus_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Create user_settings table for study preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  study_hours_per_day INTEGER DEFAULT 4,
  preferred_study_start_time TIME DEFAULT '09:00',
  preferred_study_end_time TIME DEFAULT '21:00',
  focus_duration_minutes INTEGER DEFAULT 25,
  short_break_minutes INTEGER DEFAULT 5,
  long_break_minutes INTEGER DEFAULT 15,
  sessions_before_long_break INTEGER DEFAULT 4,
  theme TEXT DEFAULT 'system', -- light, dark, system
  notification_enabled BOOLEAN DEFAULT true,
  reminder_before_deadline_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- User settings policies
CREATE POLICY "Users can view their own settings"
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at on user_settings
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for common queries
CREATE INDEX idx_subtasks_task_id ON public.subtasks(task_id);
CREATE INDEX idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_started_at ON public.focus_sessions(started_at);
CREATE INDEX idx_tasks_user_due_date ON public.tasks(user_id, due_date);