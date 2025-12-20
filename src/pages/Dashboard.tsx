import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import GreetingCard from '@/components/dashboard/GreetingCard';
import StatsCards from '@/components/dashboard/StatsCards';
import TodaysTasks from '@/components/dashboard/TodaysTasks';
import UpcomingDeadlines from '@/components/dashboard/UpcomingDeadlines';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Dashboard() {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6">
        <GreetingCard />
        <StatsCards />
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TodaysTasks onAddTask={() => setCreateModalOpen(true)} />
          </div>
          <div>
            <UpcomingDeadlines />
          </div>
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <Button
        onClick={() => setCreateModalOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg gradient-primary text-primary-foreground md:hidden"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <CreateTaskModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </AppLayout>
  );
}