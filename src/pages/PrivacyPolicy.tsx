import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">Effective Date: December 27, 2025</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p>LEARNR respects your privacy. Here’s how we handle your information:</p>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Personal info: Email, username.</li>
              <li>Usage data: Tasks created, milestones, app activity.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To improve app performance and user experience.</li>
              <li>To send updates or notifications (if you opt-in).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Data Sharing</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>We do not sell your data to third parties.</li>
              <li>Data may be shared with service providers for app functionality (e.g., cloud storage).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Data Security</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>We use reasonable measures to protect your data.</li>
              <li>We cannot guarantee 100% security.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Your Rights</h2>
            <p>You can request deletion of your account and personal data at any time.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Children’s Privacy</h2>
            <p>LEARNR does not knowingly collect data from children under 13.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
