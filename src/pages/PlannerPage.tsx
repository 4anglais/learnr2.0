import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTasks } from '@/hooks/useTasks';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { 
  BookOpen, 
  Sparkles, 
  Clock, 
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface StudyBlock {
  id: string;
  taskId: string;
  taskTitle: string;
  priority: string;
  duration: number; // in minutes
  startTime: string;
  category?: string;
  categoryColor?: string;
}

export default function PlannerPage() {
  const { tasks, toggleComplete } = useTasks();
  const { settings } = useUserSettings();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const incompleteTasks = tasks.filter(t => !t.is_completed);
  const todaysTasks = incompleteTasks.filter(t => t.due_date && isToday(parseISO(t.due_date)));
  const overdueTasks = incompleteTasks.filter(
    t => t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))
  );
  const upcomingTasks = incompleteTasks.filter(
    t => t.due_date && !isToday(parseISO(t.due_date)) && !isPast(parseISO(t.due_date))
  );

  // Generate auto study plan based on priority and due dates
  const studyPlan = useMemo(() => {
    const availableMinutes = settings.study_hours_per_day * 60;
    const focusDuration = settings.focus_duration_minutes;
    
    // Sort tasks by priority (high first) and due date (earliest first)
    const sortedTasks = [...incompleteTasks].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return a.due_date ? -1 : 1;
    });

    const blocks: StudyBlock[] = [];
    let currentTime = settings.preferred_study_start_time?.split(':').slice(0, 2).join(':') || '09:00';
    let usedMinutes = 0;

    for (const task of sortedTasks) {
      if (usedMinutes >= availableMinutes) break;

      const block: StudyBlock = {
        id: task.id,
        taskId: task.id,
        taskTitle: task.title,
        priority: task.priority,
        duration: focusDuration,
        startTime: currentTime,
        category: task.categories?.name,
        categoryColor: task.categories?.color,
      };

      blocks.push(block);
      usedMinutes += focusDuration;

      // Add break time
      const breakTime = blocks.length % settings.sessions_before_long_break === 0 
        ? settings.long_break_minutes 
        : settings.short_break_minutes;
      
      // Calculate next start time
      const [hours, mins] = currentTime.split(':').map(Number);
      const totalMins = hours * 60 + mins + focusDuration + breakTime;
      const newHours = Math.floor(totalMins / 60);
      const newMins = totalMins % 60;
      currentTime = `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
    }

    return blocks;
  }, [incompleteTasks, settings]);

  // Get the focus task of the day (highest priority, earliest due date)
  const focusTask = useMemo(() => {
    if (incompleteTasks.length === 0) return null;

    return incompleteTasks.reduce((best, task) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const bestPriority = priorityOrder[best.priority];
      const taskPriority = priorityOrder[task.priority];

      if (taskPriority < bestPriority) return task;
      if (taskPriority === bestPriority) {
        if (task.due_date && best.due_date) {
          return new Date(task.due_date) < new Date(best.due_date) ? task : best;
        }
        return task.due_date ? task : best;
      }
      return best;
    }, incompleteTasks[0]);
  }, [incompleteTasks]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Study Planner</h1>
            <p className="text-muted-foreground">Your personalized study schedule</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="gradient-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Focus Task of the Day */}
        {focusTask && (
          <Card className="border-border/50 shadow-card bg-accent/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-foreground/10">
                  <Sparkles className="h-6 w-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Focus Task of the Day</p>
                  <h3 className="text-xl font-bold text-foreground">{focusTask.title}</h3>
                  {focusTask.description && (
                    <p className="text-muted-foreground mt-1">{focusTask.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className={cn(
                      'text-xs',
                      focusTask.priority === 'high' && 'priority-high',
                      focusTask.priority === 'medium' && 'priority-medium',
                      focusTask.priority === 'low' && 'priority-low'
                    )}>
                      {focusTask.priority}
                    </Badge>
                    {focusTask.due_date && (
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(parseISO(focusTask.due_date), 'MMM d')}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => toggleComplete.mutate({ id: focusTask.id, is_completed: true })}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Study Plan */}
          <Card className="lg:col-span-2 border-border/50 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Today's Study Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studyPlan.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No tasks to schedule</p>
                  <Button variant="link" onClick={() => setCreateModalOpen(true)} className="mt-2">
                    Add your first task
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {studyPlan.map((block, index) => (
                    <div
                      key={block.id}
                      className="flex items-center gap-4 p-3 rounded-xl border border-border/50 hover:bg-accent/50 transition-colors"
                    >
                      <div className="text-sm font-mono text-muted-foreground w-14">
                        {block.startTime}
                      </div>
                      <div className="w-1 h-12 bg-border rounded-full relative">
                        <div 
                          className="absolute top-0 left-0 w-full rounded-full bg-foreground"
                          style={{ height: '100%' }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{block.taskTitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={cn(
                            'text-xs',
                            block.priority === 'high' && 'priority-high',
                            block.priority === 'medium' && 'priority-medium',
                            block.priority === 'low' && 'priority-low'
                          )}>
                            {block.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {block.duration} min
                          </span>
                          {block.category && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${block.categoryColor}20`,
                                color: block.categoryColor 
                              }}
                            >
                              {block.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Checkbox
                        onCheckedChange={(checked) => {
                          if (checked) {
                            toggleComplete.mutate({ id: block.taskId, is_completed: true });
                          }
                        }}
                        className="h-5 w-5"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <Card className="border-destructive/20 shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Overdue ({overdueTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {overdueTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        onCheckedChange={(checked) => {
                          if (checked) {
                            toggleComplete.mutate({ id: task.id, is_completed: true });
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <span className="text-foreground truncate">{task.title}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Study Stats */}
            <Card className="border-border/50 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Study Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hours/day</span>
                  <span className="font-medium text-foreground">{settings.study_hours_per_day}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Focus duration</span>
                  <span className="font-medium text-foreground">{settings.focus_duration_minutes}min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Planned sessions</span>
                  <span className="font-medium text-foreground">{studyPlan.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* What to Study */}
            <Card className="border-border/50 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  What should I study?
                </CardTitle>
              </CardHeader>
              <CardContent>
                {focusTask ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Based on priority and deadlines:</p>
                    <p className="font-medium text-foreground">{focusTask.title}</p>
                    {focusTask.due_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {format(parseISO(focusTask.due_date), 'EEEE, MMM d')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Add tasks to get recommendations</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CreateTaskModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </AppLayout>
  );
}