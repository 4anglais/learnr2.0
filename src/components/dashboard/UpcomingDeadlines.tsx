import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';
import { format, parseISO, differenceInDays, isFuture, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

export default function UpcomingDeadlines() {
  const { tasks } = useTasks();

  const upcomingTasks = tasks
    .filter((task) => {
      if (!task.due_date || task.is_completed) return false;
      const dueDate = parseISO(task.due_date);
      return isFuture(dueDate) || isToday(dueDate);
    })
    .sort((a, b) => {
      const dateA = parseISO(a.due_date!);
      const dateB = parseISO(b.due_date!);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  const getDaysLeft = (dueDate: string) => {
    const days = differenceInDays(parseISO(dueDate), new Date());
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days left`;
  };

  const getUrgencyColor = (dueDate: string) => {
    const days = differenceInDays(parseISO(dueDate), new Date());
    if (days <= 1) return 'bg-destructive/10 text-destructive border-destructive/20';
    if (days <= 3) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="border-border/50 shadow-card animate-fade-up" style={{ animationDelay: '0.3s' }}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingTasks.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No upcoming deadlines</p>
          </div>
        ) : (
          upcomingTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{task.title}</p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(task.due_date!), 'MMM d, yyyy')}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn('ml-2 whitespace-nowrap', getUrgencyColor(task.due_date!))}
              >
                {getDaysLeft(task.due_date!)}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}