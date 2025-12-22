import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTasks } from '@/hooks/useTasks';
import { useFocusSessions } from '@/hooks/useFocusSessions';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Timer, Play, Pause, RotateCcw, Flame, Target, Clock, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

type SessionState = 'idle' | 'running' | 'paused';
type SessionType = 'focus' | 'short_break' | 'long_break';

export default function FocusPage() {
  const { tasks } = useTasks();
  const { createSession, completeSession, streak, completedSessionsCount, totalFocusMinutes } = useFocusSessions();
  const { settings } = useUserSettings();

  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(settings.focus_duration_minutes * 60);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const incompleteTasks = tasks.filter(t => !t.is_completed);

  const getDuration = useCallback((type: SessionType) => {
    switch (type) {
      case 'focus': return settings.focus_duration_minutes;
      case 'short_break': return settings.short_break_minutes;
      case 'long_break': return settings.long_break_minutes;
    }
  }, [settings]);

  useEffect(() => {
    if (sessionState === 'idle') {
      setTimeRemaining(getDuration(sessionType) * 60);
    }
  }, [sessionType, sessionState, getDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (sessionState === 'running' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [sessionState, timeRemaining]);

  const handleStart = async () => {
    if (sessionState === 'idle') {
      const session = await createSession.mutateAsync({
        task_id: selectedTaskId || undefined,
        duration_minutes: getDuration(sessionType),
        session_type: sessionType,
      });
      setCurrentSessionId(session.id);
    }
    setSessionState('running');
  };

  const handlePause = () => {
    setSessionState('paused');
  };

  const handleReset = () => {
    setSessionState('idle');
    setTimeRemaining(getDuration(sessionType) * 60);
    setCurrentSessionId(null);
  };

  const handleSessionComplete = async () => {
    if (currentSessionId) {
      await completeSession.mutateAsync(currentSessionId);
    }
    
    setSessionState('idle');
    setCurrentSessionId(null);

    if (sessionType === 'focus') {
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);

      // Determine next session type
      if (newCount % settings.sessions_before_long_break === 0) {
        setSessionType('long_break');
      } else {
        setSessionType('short_break');
      }
    } else {
      setSessionType('focus');
    }

    setTimeRemaining(getDuration(sessionType === 'focus' ? 'short_break' : 'focus') * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeRemaining / (getDuration(sessionType) * 60));
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - progress);

  const sessionTypeLabels = {
    focus: 'Focus',
    short_break: 'Short Break',
    long_break: 'Long Break',
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Focus Mode</h1>
          <p className="text-muted-foreground">Stay focused with the Pomodoro technique</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-border/50 shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent">
                <Flame className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{streak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent">
                <Target className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedSessionsCount}</p>
                <p className="text-sm text-muted-foreground">Sessions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent">
                <Clock className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{Math.round(totalFocusMinutes / 60)}h</p>
                <p className="text-sm text-muted-foreground">Total Focus</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timer */}
        <Card className="border-border/50 shadow-card">
          <CardContent className="p-8">
            {/* Session Type Selector */}
            <div className="flex justify-center gap-2 mb-8">
              {(['focus', 'short_break', 'long_break'] as SessionType[]).map((type) => (
                <Button
                  key={type}
                  variant={sessionType === type ? 'default' : 'outline'}
                  onClick={() => {
                    if (sessionState === 'idle') {
                      setSessionType(type);
                    }
                  }}
                  disabled={sessionState !== 'idle'}
                  className="gap-2"
                >
                  {type === 'focus' ? <Timer className="h-4 w-4" /> : <Coffee className="h-4 w-4" />}
                  {sessionTypeLabels[type]}
                </Button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="flex flex-col items-center">
              <div className="relative w-64 h-64 mb-8">
                {/* Background circle */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="timer-ring transition-all duration-1000"
                    style={{
                      strokeDasharray: circumference,
                      strokeDashoffset: strokeDashoffset,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-foreground font-mono">
                    {formatTime(timeRemaining)}
                  </span>
                  <span className="text-sm text-muted-foreground mt-2">
                    {sessionTypeLabels[sessionType]}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-4">
                {sessionState === 'running' ? (
                  <Button size="lg" variant="outline" onClick={handlePause} className="gap-2">
                    <Pause className="h-5 w-5" />
                    Pause
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleStart} className="gap-2 gradient-primary text-primary-foreground">
                    <Play className="h-5 w-5" />
                    {sessionState === 'paused' ? 'Resume' : 'Start'}
                  </Button>
                )}
                <Button size="lg" variant="outline" onClick={handleReset} disabled={sessionState === 'idle'}>
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Selection */}
        <Card className="border-border/50 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Lock in a Task</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedTaskId}
              onValueChange={(value) => setSelectedTaskId(value === 'none' ? '' : value)}
              disabled={sessionState !== 'idle'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a task to focus on..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific task</SelectItem>
                {incompleteTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    <span className="flex items-center gap-2">
                      <Badge variant="outline" className={cn(
                        'text-xs',
                        task.priority === 'high' && 'priority-high',
                        task.priority === 'medium' && 'priority-medium',
                        task.priority === 'low' && 'priority-low'
                      )}>
                        {task.priority}
                      </Badge>
                      {task.title}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTaskId && (
              <p className="text-sm text-muted-foreground mt-2">
                Stay focused on this task until the timer ends
              </p>
            )}
          </CardContent>
        </Card>

        {/* Today's Progress */}
        <Card className="border-border/50 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Today's Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {Array.from({ length: settings.sessions_before_long_break }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-3 flex-1 rounded-full transition-colors',
                    i < sessionsCompleted % settings.sessions_before_long_break
                      ? 'bg-foreground'
                      : 'bg-border'
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {sessionsCompleted % settings.sessions_before_long_break} / {settings.sessions_before_long_break} sessions until long break
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}