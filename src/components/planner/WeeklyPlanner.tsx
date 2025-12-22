import { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Clock, AlertTriangle, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useStudySessions, StudySession } from '@/hooks/useStudySessions';
import { useUserSettings } from '@/hooks/useUserSettings';
import AddSessionModal from './AddSessionModal';

const MAX_DAILY_MINUTES = 480; // 8 hours warning threshold

export default function WeeklyPlanner() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [addSessionDate, setAddSessionDate] = useState<Date | null>(null);
  
  const { sessions, sessionsByDay, dailyLoad, toggleComplete, deleteSession } = useStudySessions(currentWeekStart);
  const { settings } = useUserSettings();

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        <h3 className="font-semibold text-foreground">
          {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
        </h3>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const daySessions = sessionsByDay[dateKey] || [];
          const dayMinutes = dailyLoad[dateKey] || 0;
          const isOverloaded = dayMinutes > MAX_DAILY_MINUTES;
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={dateKey}
              className={cn(
                "min-h-[200px] rounded-xl border p-2 transition-colors",
                isToday ? "border-foreground/50 bg-accent/30" : "border-border/50 bg-card/50",
                isOverloaded && "border-amber-500/50"
              )}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
                  <p className={cn(
                    "text-lg font-semibold",
                    isToday ? "text-foreground" : "text-foreground"
                  )}>
                    {format(day, 'd')}
                  </p>
                </div>
                {isOverloaded && (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
              </div>

              {/* Sessions */}
              <div className="space-y-1.5">
                {daySessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "p-2 rounded-lg text-xs group relative",
                      session.is_completed
                        ? "bg-muted/50 opacity-60"
                        : "bg-foreground/5 hover:bg-foreground/10"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleComplete.mutate({ id: session.id, is_completed: !session.is_completed })}
                        className={cn(
                          "w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors",
                          session.is_completed
                            ? "bg-foreground border-foreground"
                            : "border-border"
                        )}
                      >
                        {session.is_completed && <Check className="h-2 w-2 text-background" />}
                      </button>
                      <span className="font-medium text-foreground truncate flex-1">
                        {formatTime(session.start_time)}
                      </span>
                      <button
                        onClick={() => deleteSession.mutate(session.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{session.duration_minutes}m</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add session button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 h-7 text-xs text-muted-foreground"
                onClick={() => setAddSessionDate(day)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>

              {/* Day summary */}
              {dayMinutes > 0 && (
                <div className="mt-2 pt-2 border-t border-border/30">
                  <p className="text-xs text-muted-foreground">
                    {Math.floor(dayMinutes / 60)}h {dayMinutes % 60}m
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {addSessionDate && (
        <AddSessionModal
          open={!!addSessionDate}
          onOpenChange={(open) => !open && setAddSessionDate(null)}
          date={addSessionDate}
        />
      )}
    </div>
  );
}
