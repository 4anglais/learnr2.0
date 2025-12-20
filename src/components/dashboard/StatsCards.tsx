import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertTriangle, Target } from 'lucide-react';
import { isToday, isPast, parseISO } from 'date-fns';

export default function StatsCards() {
  const { tasks } = useTasks();

  const todaysTasks = tasks.filter(
    (task) => task.due_date && isToday(parseISO(task.due_date))
  );

  const completedToday = todaysTasks.filter((task) => task.is_completed).length;
  const pendingToday = todaysTasks.filter((task) => !task.is_completed).length;

  const overdueTasks = tasks.filter(
    (task) =>
      !task.is_completed &&
      task.due_date &&
      isPast(parseISO(task.due_date)) &&
      !isToday(parseISO(task.due_date))
  ).length;

  const totalCompleted = tasks.filter((task) => task.is_completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const stats = [
    {
      label: 'Today\'s Tasks',
      value: pendingToday,
      icon: Clock,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Completed Today',
      value: completedToday,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Overdue',
      value: overdueTasks,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: Target,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
      {stats.map((stat, index) => (
        <Card key={stat.label} className="border-border/50 shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}