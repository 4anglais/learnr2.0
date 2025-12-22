-- Create roadmaps table
CREATE TABLE public.roadmaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- RLS policies for roadmaps
CREATE POLICY "Users can view their own roadmaps" ON public.roadmaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own roadmaps" ON public.roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own roadmaps" ON public.roadmaps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own roadmaps" ON public.roadmaps FOR DELETE USING (auth.uid() = user_id);

-- Create milestones table (sections in a roadmap)
CREATE TABLE public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#6b7280',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- RLS policies for milestones
CREATE POLICY "Users can view milestones of their roadmaps" ON public.milestones FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.roadmaps WHERE roadmaps.id = milestones.roadmap_id AND roadmaps.user_id = auth.uid()));
CREATE POLICY "Users can create milestones in their roadmaps" ON public.milestones FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.roadmaps WHERE roadmaps.id = milestones.roadmap_id AND roadmaps.user_id = auth.uid()));
CREATE POLICY "Users can update milestones of their roadmaps" ON public.milestones FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.roadmaps WHERE roadmaps.id = milestones.roadmap_id AND roadmaps.user_id = auth.uid()));
CREATE POLICY "Users can delete milestones from their roadmaps" ON public.milestones FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.roadmaps WHERE roadmaps.id = milestones.roadmap_id AND roadmaps.user_id = auth.uid()));

-- Create steps table (individual items within milestones)
CREATE TABLE public.steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  resource_url TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  position INTEGER NOT NULL DEFAULT 0,
  linked_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;

-- RLS policies for steps
CREATE POLICY "Users can view steps of their roadmaps" ON public.steps FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.milestones m JOIN public.roadmaps r ON m.roadmap_id = r.id WHERE m.id = steps.milestone_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can create steps in their roadmaps" ON public.steps FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.milestones m JOIN public.roadmaps r ON m.roadmap_id = r.id WHERE m.id = steps.milestone_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can update steps of their roadmaps" ON public.steps FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.milestones m JOIN public.roadmaps r ON m.roadmap_id = r.id WHERE m.id = steps.milestone_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can delete steps from their roadmaps" ON public.steps FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.milestones m JOIN public.roadmaps r ON m.roadmap_id = r.id WHERE m.id = steps.milestone_id AND r.user_id = auth.uid()));

-- Create study_sessions table for weekly planner
CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  step_id UUID REFERENCES public.steps(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 25,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for study_sessions
CREATE POLICY "Users can view their own study sessions" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own study sessions" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own study sessions" ON public.study_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own study sessions" ON public.study_sessions FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_roadmaps_updated_at BEFORE UPDATE ON public.roadmaps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_milestones_roadmap_id ON public.milestones(roadmap_id);
CREATE INDEX idx_steps_milestone_id ON public.steps(milestone_id);
CREATE INDEX idx_study_sessions_user_date ON public.study_sessions(user_id, scheduled_date);