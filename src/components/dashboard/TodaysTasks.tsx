import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TaskCard from '@/components/tasks/TaskCard';
import { Plus, CheckCircle2 } from 'lucide-react';
import { isToday, parseISO } from 'date-fns';

interface TodaysTasksProps {
  onAddTask: () => void;
}

export default function TodaysTasks({ onAddTask }: TodaysTasksProps) {
  const { tasks, isLoading } = useTasks();

  const todaysTasks = tasks.filter(
    (task) => task.due_date && isToday(parseISO(task.due_date))
  );

  const pendingTasks = todaysTasks.filter((task) => !task.is_completed);
  const completedTasks = todaysTasks.filter((task) => task.is_completed);

  return (
    <Card className="border-border/50 shadow-card animate-fade-up" style={{ animationDelay: '0.2s' }}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold">Today's Tasks</CardTitle>
        <Button size="sm" onClick={onAddTask} className="gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          </div>
        ) : todaysTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No tasks scheduled for today</p>
            <Button variant="link" onClick={onAddTask} className="mt-2">
              Add your first task
            </Button>
          </div>
        ) : (
          <>
            {pendingTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {completedTasks.length > 0 && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Completed ({completedTasks.length})
                </p>
                {completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}