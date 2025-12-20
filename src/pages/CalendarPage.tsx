import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTasks } from '@/hooks/useTasks';
import TaskCard from '@/components/tasks/TaskCard';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, CalendarDays } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';

export default function CalendarPage() {
  const { tasks } = useTasks();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const tasksForDate = tasks.filter(
    (task) => task.due_date && isSameDay(parseISO(task.due_date), selectedDate)
  );

  // Get dates that have tasks
  const datesWithTasks = tasks
    .filter((task) => task.due_date)
    .map((task) => parseISO(task.due_date!));

  const modifiers = {
    hasTasks: datesWithTasks,
  };

  const modifiersStyles = {
    hasTasks: {
      fontWeight: 'bold' as const,
    },
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground">View your tasks by date</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="gradient-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1 border-border/50 shadow-card">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="rounded-md"
                components={{
                  DayContent: ({ date }) => {
                    const hasTask = datesWithTasks.some((d) => isSameDay(d, date));
                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {date.getDate()}
                        {hasTask && (
                          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                        )}
                      </div>
                    );
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Tasks for Selected Date */}
          <Card className="lg:col-span-2 border-border/50 shadow-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                <Badge variant="secondary">
                  {tasksForDate.length} task{tasksForDate.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksForDate.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <CalendarDays className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No tasks scheduled for this day</p>
                  <Button variant="link" onClick={() => setCreateModalOpen(true)} className="mt-2">
                    Add a task
                  </Button>
                </div>
              ) : (
                tasksForDate.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateTaskModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </AppLayout>
  );
}