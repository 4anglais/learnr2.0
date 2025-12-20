import AppLayout from '@/components/layout/AppLayout';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, CheckCircle2, Clock, Target } from 'lucide-react';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, format, subDays } from 'date-fns';

export default function ProgressPage() {
  const { tasks } = useTasks();
  const { categories } = useCategories();

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // This week's stats
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const thisWeekTasks = tasks.filter(
    (task) =>
      task.created_at &&
      isWithinInterval(parseISO(task.created_at), { start: weekStart, end: weekEnd })
  );
  const thisWeekCompleted = thisWeekTasks.filter((t) => t.is_completed).length;

  // Tasks by category
  const tasksByCategory = categories.map((category) => {
    const categoryTasks = tasks.filter((t) => t.category_id === category.id);
    const completed = categoryTasks.filter((t) => t.is_completed).length;
    return {
      ...category,
      total: categoryTasks.length,
      completed,
      percentage: categoryTasks.length > 0 ? Math.round((completed / categoryTasks.length) * 100) : 0,
    };
  }).filter((c) => c.total > 0);

  // Tasks by priority
  const priorityStats = ['high', 'medium', 'low'].map((priority) => {
    const priorityTasks = tasks.filter((t) => t.priority === priority);
    const completed = priorityTasks.filter((t) => t.is_completed).length;
    return {
      priority,
      total: priorityTasks.length,
      completed,
      percentage: priorityTasks.length > 0 ? Math.round((completed / priorityTasks.length) * 100) : 0,
    };
  });

  // Last 7 days activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayTasks = tasks.filter(
      (task) =>
        task.completed_at &&
        format(parseISO(task.completed_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    return {
      date,
      count: dayTasks.length,
    };
  });

  const maxDayCount = Math.max(...last7Days.map((d) => d.count), 1);

  const priorityColors = {
    high: 'bg-destructive',
    medium: 'bg-warning',
    low: 'bg-success',
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Progress</h1>
          <p className="text-muted-foreground">Track your productivity and achievements</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50 shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedTasks}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{thisWeekCompleted}</p>
                  <p className="text-sm text-muted-foreground">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent">
                  <TrendingUp className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Activity */}
          <Card className="border-border/50 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-32">
                {last7Days.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-primary/20 rounded-t-md transition-all"
                      style={{
                        height: `${(day.count / maxDayCount) * 100}%`,
                        minHeight: day.count > 0 ? '8px' : '4px',
                        backgroundColor: day.count > 0 ? 'hsl(var(--primary))' : undefined,
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {format(day.date, 'EEE')}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Tasks completed per day
              </p>
            </CardContent>
          </Card>

          {/* Progress by Priority */}
          <Card className="border-border/50 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Progress by Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {priorityStats.map((stat) => (
                <div key={stat.priority} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium text-foreground">{stat.priority}</span>
                    <span className="text-muted-foreground">
                      {stat.completed}/{stat.total} completed
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${priorityColors[stat.priority as keyof typeof priorityColors]}`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Progress by Category */}
          {tasksByCategory.length > 0 && (
            <Card className="border-border/50 shadow-card lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Progress by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasksByCategory.map((category) => (
                    <div key={category.id} className="p-4 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-foreground">
                          {category.icon} {category.name}
                        </span>
                      </div>
                      <Progress value={category.percentage} className="h-2 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {category.completed}/{category.total} tasks ({category.percentage}%)
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Motivational Message */}
        {completionRate >= 80 && (
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-6 text-center">
              <p className="text-2xl mb-2">🎉</p>
              <h3 className="text-lg font-semibold text-success">Amazing Progress!</h3>
              <p className="text-muted-foreground">
                You're crushing it! Keep up the great work.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}