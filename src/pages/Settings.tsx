import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Palette, LogOut, Clock, Sun, Moon, Monitor } from 'lucide-react';
import { ProfileEditCard } from '@/components/ProfileEditCard';
import { AccountSecurityCard } from '@/components/AccountSecurityCard';

export default function Settings() {
  const { signOut } = useAuth();
  const { settings, updateSettings } = useUserSettings();

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <ProfileEditCard />

        {/* Account Security Section */}
        <AccountSecurityCard />

        {/* Study Preferences */}
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Study Preferences
            </CardTitle>
            <CardDescription>Configure your study schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Study hours per day</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={settings.study_hours_per_day}
                  onChange={(e) => updateSettings.mutate({ study_hours_per_day: parseInt(e.target.value) || 4 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Focus duration (min)</Label>
                <Input
                  type="number"
                  min={5}
                  max={60}
                  value={settings.focus_duration_minutes}
                  onChange={(e) => updateSettings.mutate({ focus_duration_minutes: parseInt(e.target.value) || 25 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Short break (min)</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={settings.short_break_minutes}
                  onChange={(e) => updateSettings.mutate({ short_break_minutes: parseInt(e.target.value) || 5 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Long break (min)</Label>
                <Input
                  type="number"
                  min={5}
                  max={60}
                  value={settings.long_break_minutes}
                  onChange={(e) => updateSettings.mutate({ long_break_minutes: parseInt(e.target.value) || 15 })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Enable notifications</p>
                <p className="text-sm text-muted-foreground">Receive reminders for tasks</p>
              </div>
              <Switch
                checked={settings.notification_enabled}
                onCheckedChange={(checked) => updateSettings.mutate({ notification_enabled: checked })}
              />
            </div>
            <div className="space-y-2">
              <Label>Remind before deadline (hours)</Label>
              <Input
                type="number"
                min={1}
                max={72}
                value={settings.reminder_before_deadline_hours}
                onChange={(e) => updateSettings.mutate({ reminder_before_deadline_hours: parseInt(e.target.value) || 24 })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => updateSettings.mutate({ theme: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <span className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </span>
                  </SelectItem>
                  <SelectItem value="dark">
                    <span className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </span>
                  </SelectItem>
                  <SelectItem value="system">
                    <span className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      System
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Sign Out */}
        <Card className="border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Sign out</p>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account on this device
                </p>
              </div>
              <Button variant="destructive" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}