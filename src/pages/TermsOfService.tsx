import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">Effective Date: December 27, 2025</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p>Welcome to LEARNR! By using our app, you agree to the following terms:</p>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Use of the App</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You may use the app for personal, educational purposes only.</li>
              <li>You must be at least 13 years old to use LEARNR.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You are responsible for keeping your account login details safe.</li>
              <li>You agree not to share your account with others or use someone else’s account.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Prohibited Activities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Do not use LEARNR to harm others or upload illegal content.</li>
              <li>Do not attempt to hack, reverse-engineer, or interfere with the app.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Content</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>All content created by you in the app remains yours.</li>
              <li>LEARNR reserves the right to remove content that violates these terms.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Termination</h2>
            <p>We may suspend or terminate your account if you violate these terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Disclaimer</h2>
            <p>LEARNR is provided “as is.” We are not responsible for any data loss, errors, or interruptions.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Changes to Terms</h2>
            <p>We may update these terms at any time. Updates will be posted in the app.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
