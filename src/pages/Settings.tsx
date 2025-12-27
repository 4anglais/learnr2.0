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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Bell, Palette, LogOut, Clock, Sun, Moon, Monitor, ShieldCheck, UserX, HelpCircle, Mail, FileText, Copyright, ExternalLink } from 'lucide-react';
import { ProfileEditCard } from '@/components/ProfileEditCard';
import { AccountSecurityCard } from '@/components/AccountSecurityCard';
import { Link } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { useState } from 'react';

export default function Settings() {
  const { signOut, deleteAccount } = useAuth();
  const { settings, updateSettings } = useUserSettings();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const { error } = await deleteAccount();
    setIsDeleting(false);

    if (error) {
      if (error.message.includes('requires-recent-login')) {
        toast.error('For security reasons, please sign out and sign back in before deleting your account.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Account deleted successfully');
    }
  };

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

        {/* Collapsible Sections */}
        <Accordion type="single" collapsible className="space-y-6">
          {/* Account Security Section */}
          <AccountSecurityCard />

          {/* Study Preferences */}
          <AccordionItem value="study-preferences" className="border-none">
            <Card className="border-border/50 shadow-card">
              <AccordionTrigger className="px-6 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <div className="text-left">
                    <CardTitle className="text-base">Study Preferences</CardTitle>
                    <CardDescription>Configure your study schedule</CardDescription>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 pt-4">
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
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Notifications Section */}
          <AccordionItem value="notifications" className="border-none">
            <Card className="border-border/50 shadow-card">
              <AccordionTrigger className="px-6 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <div className="text-left">
                    <CardTitle className="text-base">Notifications</CardTitle>
                    <CardDescription>Configure how you receive notifications</CardDescription>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 pt-4">
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
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Appearance Section */}
          <AccordionItem value="appearance" className="border-none">
            <Card className="border-border/50 shadow-card">
              <AccordionTrigger className="px-6 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  <div className="text-left">
                    <CardTitle className="text-base">Appearance</CardTitle>
                    <CardDescription>Customize the look and feel</CardDescription>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-2 pt-4">
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
              </AccordionContent>
            </Card>
          </AccordionItem>
          {/* Support & Legal Section */}
          <AccordionItem value="support-legal" className="border-none">
            <Card className="border-border/50 shadow-card">
              <AccordionTrigger className="px-6 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  <div className="text-left">
                    <CardTitle className="text-base">Support & Legal</CardTitle>
                    <CardDescription>Policies, terms, and contact information</CardDescription>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 pt-4">
                  <Accordion type="single" collapsible className="w-full">
                    {/* Terms of Service */}
                    <AccordionItem value="tos">
                      <AccordionTrigger className="text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Terms of Service
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground space-y-4">
                        <p>Effective Date: December 27, 2025</p>
                        <p>Welcome to LEARNR! By using our app, you agree to our terms.</p>
                        <Link to="/terms" className="inline-flex items-center gap-1 text-primary hover:underline">
                          View full Terms of Service <ExternalLink className="h-3 w-3" />
                        </Link>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Privacy Policy */}
                    <AccordionItem value="privacy">
                      <AccordionTrigger className="text-sm">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          Privacy Policy
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground space-y-4">
                        <p>Effective Date: December 27, 2025</p>
                        <p>LEARNR respects your privacy. Here’s how we handle your information.</p>
                        <Link to="/privacy" className="inline-flex items-center gap-1 text-primary hover:underline">
                          View full Privacy Policy <ExternalLink className="h-3 w-3" />
                        </Link>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Copyright */}
                    <AccordionItem value="copyright">
                      <AccordionTrigger className="text-sm">
                        <div className="flex items-center gap-2">
                          <Copyright className="h-4 w-4" />
                          Copyright & Intellectual Property
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground space-y-2">
                        <p>LEARNR and its logo are copyright © {new Date().getFullYear()} Angel Phiri. All rights reserved.</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Users cannot copy, distribute, modify, or sell the app or its content without permission.</li>
                          <li>Content created in the app belongs to the user, but LEARNR may use anonymized data to improve services.</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Contact Us */}
                    <AccordionItem value="contact">
                      <AccordionTrigger className="text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Contact Us
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="contact-email">Email</Label>
                          <Input id="contact-email" value="angelphiri.2021@gmail.com" readOnly className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-subject">Subject</Label>
                          <Input id="contact-subject" value="App Support / Feedback" readOnly className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-message">Message</Label>
                          <Textarea id="contact-message" placeholder="Type your message here..." className="min-h-[100px]" />
                        </div>
                        <Button 
                          className="w-full gradient-primary text-primary-foreground"
                          onClick={() => {
                            const message = (document.getElementById('contact-message') as HTMLTextAreaElement).value;
                            window.location.href = `mailto:angelphiri.2021@gmail.com?subject=App Support / Feedback&body=${encodeURIComponent(message)}`;
                          }}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>

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
        {/* Danger Zone */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all your data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <UserX className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="text-center pt-8 pb-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Learnr. All rights reserved.
          </p>
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">
            Developed by Angel Phiri
          </p>
        </div>
      </div>
    </AppLayout>
  );
}