import { useProfile } from '@/hooks/useProfile';

export default function GreetingCard() {
  const { profile } = useProfile();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const name = profile?.nickname || profile?.fullName?.split(' ')[0] || 'there';

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
        {getGreeting()}, {name} 
      </h1>
      <p className="text-muted-foreground mt-1">
        Here are plans for today!
      </p>
    </div>
  );
}