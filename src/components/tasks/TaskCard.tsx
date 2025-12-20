import { Task, useTasks } from '@/hooks/useTasks';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit, Calendar, Bell } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const { toggleComplete, deleteTask } = useTasks();

  const isOverdue =
    task.due_date &&
    !task.is_completed &&
    isPast(parseISO(task.due_date)) &&
    !isToday(parseISO(task.due_date));

  const priorityStyles = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
  };

  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card hover:shadow-card transition-all',
        task.is_completed && 'opacity-60'
      )}
    >
      <Checkbox
        checked={task.is_completed}
        onCheckedChange={(checked) =>
          toggleComplete.mutate({ id: task.id, is_completed: !!checked })
        }
        className="mt-1 h-5 w-5 rounded-full border-2"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'font-medium text-foreground',
                task.is_completed && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {task.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteTask.mutate(task.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge
            variant="outline"
            className={cn('text-xs', priorityStyles[task.priority])}
          >
            {task.priority}
          </Badge>

          {task.categories && (
            <Badge
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: `${task.categories.color}20`,
                color: task.categories.color,
                borderColor: `${task.categories.color}40`,
              }}
            >
              {task.categories.icon} {task.categories.name}
            </Badge>
          )}

          {task.due_date && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs text-muted-foreground',
                isOverdue && 'text-destructive'
              )}
            >
              <Calendar className="h-3 w-3" />
              {format(parseISO(task.due_date), 'MMM d')}
            </div>
          )}

          {task.reminder_at && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Bell className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}