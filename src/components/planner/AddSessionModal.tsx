import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { useStudySessions } from '@/hooks/useStudySessions';
import { useTasks } from '@/hooks/useTasks';

interface AddSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
}

const DURATION_OPTIONS = [
  { value: '25', label: '25 min (Pomodoro)' },
  { value: '50', label: '50 min' },
  { value: '90', label: '90 min (Deep Work)' },
  { value: 'custom', label: 'Custom' },
];

export default function AddSessionModal({ open, onOpenChange, date }: AddSessionModalProps) {
  const { createSession } = useStudySessions();
  const { tasks } = useTasks();
  const [startTime, setStartTime] = useState('09:00');
  const [durationOption, setDurationOption] = useState('25');
  const [customDuration, setCustomDuration] = useState('30');
  const [taskId, setTaskId] = useState<string>('');

  const incompleteTasks = tasks.filter(t => !t.is_completed);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const duration = durationOption === 'custom' 
      ? parseInt(customDuration) 
      : parseInt(durationOption);

    await createSession.mutateAsync({
      scheduled_date: format(date, 'yyyy-MM-dd'),
      start_time: startTime,
      duration_minutes: duration,
      task_id: taskId || undefined,
    });

    setStartTime('09:00');
    setDurationOption('25');
    setCustomDuration('30');
    setTaskId('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Study Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium text-foreground">{format(date, 'EEEE, MMMM d, yyyy')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={durationOption} onValueChange={setDurationOption}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {durationOption === 'custom' && (
              <Input
                type="number"
                min="5"
                max="180"
                placeholder="Minutes"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Link to Task (optional)</Label>
            <Select value={taskId} onValueChange={setTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a task..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No task</SelectItem>
                {incompleteTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSession.isPending}>
              {createSession.isPending ? 'Adding...' : 'Add Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
