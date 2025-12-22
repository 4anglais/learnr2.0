import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Map, Target, Flag, Clock, Flame, Trophy } from 'lucide-react';
import { useRoadmaps, Roadmap } from '@/hooks/useRoadmaps';
import { useFocusSessions } from '@/hooks/useFocusSessions';
import { useUserSettings } from '@/hooks/useUserSettings';

interface PlannerDashboardCardsProps {
  roadmap: Roadmap | null;
}

export default function PlannerDashboardCards({ roadmap }: PlannerDashboardCardsProps) {
  const { streak, totalFocusMinutes } = useFocusSessions();
  const { settings } = useUserSettings();

  const stats = useMemo(() => {
    if (!roadmap) {
      return {
        totalSteps: 0,
        completedSteps: 0,
        progress: 0,
        nextMilestone: null,
        todayGoalMinutes: settings.study_hours_per_day * 60,
        timeSpentToday: 0,
      };
    }

    const allSteps = roadmap.milestones?.flatMap(m => m.steps || []) || [];
    const completedSteps = allSteps.filter(s => s.is_completed).length;
    const totalSteps = allSteps.length;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    // Find next incomplete milestone
    const nextMilestone = roadmap.milestones?.find(m => {
      const milestoneSteps = m.steps || [];
      return milestoneSteps.some(s => !s.is_completed);
    });

    return {
      totalSteps,
      completedSteps,
      progress,
      nextMilestone,
      todayGoalMinutes: settings.study_hours_per_day * 60,
      timeSpentToday: 0, // Would need to calculate from today's sessions
    };
  }, [roadmap, settings]);

  const cards = [
    {
      icon: Map,
      label: 'Active Roadmap',
      value: roadmap?.title || 'No roadmap',
      subtext: roadmap ? `${stats.completedSteps}/${stats.totalSteps} steps` : 'Create one to get started',
      progress: stats.progress,
      showProgress: !!roadmap,
    },
    {
      icon: Target,
      label: "Today's Goal",
      value: `${Math.floor(stats.todayGoalMinutes / 60)}h`,
      subtext: `${settings.study_hours_per_day} hours of study`,
    },
    {
      icon: Flag,
      label: 'Next Milestone',
      value: stats.nextMilestone?.title || 'All done!',
      subtext: stats.nextMilestone 
        ? `${stats.nextMilestone.steps?.filter(s => !s.is_completed).length || 0} steps remaining`
        : 'Great work!',
    },
    {
      icon: Flame,
      label: 'Study Streak',
      value: `${streak} days`,
      subtext: streak > 5 ? "You're on fire!" : 'Keep going!',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <Card key={i} className="border-border/50 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent">
                <card.icon className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="font-semibold text-foreground truncate">{card.value}</p>
                <p className="text-xs text-muted-foreground truncate">{card.subtext}</p>
              </div>
            </div>
            {card.showProgress && (
              <Progress value={card.progress} className="h-1.5 mt-3" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
