import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTasks } from '@/hooks/useTasks';
import { useFocusSessions } from '@/hooks/useFocusSessions';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const { settings, updateSettings } = useUserSettings();

  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(settings.focus_duration_minutes * 60);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Local state for settings inputs to prevent jank
  const [focusInput, setFocusInput] = useState(settings.focus_duration_minutes.toString());
  const [shortBreakInput, setShortBreakInput] = useState(settings.short_break_minutes.toString());
  const [longBreakInput, setLongBreakInput] = useState(settings.long_break_minutes.toString());

  const incompleteTasks = tasks.filter(t => !t.is_completed);

  const getDuration = useCallback((type: SessionType) => {
    switch (type) {
      case 'focus': return settings.focus_duration_minutes;
      case 'short_break': return settings.short_break_minutes;
      case 'long_break': return settings.long_break_minutes;
    }
  }, [settings]);

  // Sync local inputs when settings change (e.g., from initial load or other pages)
  useEffect(() => {
    setFocusInput(settings.focus_duration_minutes.toString());
    setShortBreakInput(settings.short_break_minutes.toString());
    setLongBreakInput(settings.long_break_minutes.toString());
  }, [settings.focus_duration_minutes, settings.short_break_minutes, settings.long_break_minutes]);

  useEffect(() => {
    if (sessionState === 'idle') {
      setTimeRemaining(getDuration(sessionType) * 60);
    }
  }, [sessionType, sessionState, getDuration]);

  const handleSessionComplete = useCallback(async () => {
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
  }, [currentSessionId, completeSession, sessionType, sessionsCompleted, settings.sessions_before_long_break]);

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
  }, [sessionState, timeRemaining, handleSessionComplete]);

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

  const handleSettingUpdate = (key: keyof typeof settings, value: string, defaultValue: number) => {
    const numValue = parseInt(value) || defaultValue;
    updateSettings.mutate({ [key]: numValue });
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

        {/* Timer Settings */}
        <Card className="border-border/50 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timer Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="focus-duration">Focus (min)</Label>
              <Input
                id="focus-duration"
                type="number"
                min={1}
                max={60}
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
                onBlur={() => handleSettingUpdate('focus_duration_minutes', focusInput, 25)}
                onKeyDown={(e) => e.key === 'Enter' && handleSettingUpdate('focus_duration_minutes', focusInput, 25)}
                disabled={sessionState !== 'idle'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="short-break-duration">Short Break (min)</Label>
              <Input
                id="short-break-duration"
                type="number"
                min={1}
                max={30}
                value={shortBreakInput}
                onChange={(e) => setShortBreakInput(e.target.value)}
                onBlur={() => handleSettingUpdate('short_break_minutes', shortBreakInput, 5)}
                onKeyDown={(e) => e.key === 'Enter' && handleSettingUpdate('short_break_minutes', shortBreakInput, 5)}
                disabled={sessionState !== 'idle'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="long-break-duration">Long Break (min)</Label>
              <Input
                id="long-break-duration"
                type="number"
                min={1}
                max={60}
                value={longBreakInput}
                onChange={(e) => setLongBreakInput(e.target.value)}
                onBlur={() => handleSettingUpdate('long_break_minutes', longBreakInput, 15)}
                onKeyDown={(e) => e.key === 'Enter' && handleSettingUpdate('long_break_minutes', longBreakInput, 15)}
                disabled={sessionState !== 'idle'}
              />
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