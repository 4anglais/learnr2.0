import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import CreateRoadmapModal from '@/components/planner/CreateRoadmapModal';
import RoadmapTimeline from '@/components/planner/RoadmapTimeline';
import WeeklyPlanner from '@/components/planner/WeeklyPlanner';
import PlannerDashboardCards from '@/components/planner/PlannerDashboardCards';
import { Plus, Map, Calendar, Sparkles, Clock, Trash2 } from 'lucide-react';

export default function PlannerPage() {
  const { activeRoadmap, roadmaps, isLoading, deleteRoadmap } = useRoadmaps();
  const [createRoadmapOpen, setCreateRoadmapOpen] = useState(false);

  const totalSteps = activeRoadmap?.milestones?.flatMap(m => m.steps || []).length || 0;
  const completedSteps = activeRoadmap?.milestones?.flatMap(m => m.steps || []).filter(s => s.is_completed).length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Study Planner</h1>
            <p className="text-muted-foreground">Plan, track, and complete your learning goals</p>
          </div>
          <Button onClick={() => setCreateRoadmapOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Roadmap
          </Button>
        </div>

        {/* Dashboard Cards */}
        <PlannerDashboardCards roadmap={activeRoadmap || null} />

        {/* Main Content */}
        <Tabs defaultValue="roadmap" className="space-y-4">
          <TabsList>
            <TabsTrigger value="roadmap" className="gap-2">
              <Map className="h-4 w-4" />
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="weekly" className="gap-2">
              <Calendar className="h-4 w-4" />
              Weekly Planner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roadmap" className="space-y-4">
            {!activeRoadmap ? (
              <Card className="border-border/50 shadow-card">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
                    <Map className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No roadmap yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create a learning roadmap to plan your study path with milestones and steps
                  </p>
                  <Button onClick={() => setCreateRoadmapOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Roadmap
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Roadmap Timeline - Left Panel */}
                <div className="lg:col-span-2">
                  <Card className="border-border/50 shadow-card">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{activeRoadmap.title}</CardTitle>
                          {activeRoadmap.description && (
                            <p className="text-sm text-muted-foreground mt-1">{activeRoadmap.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground">{Math.round(progress)}%</p>
                            <p className="text-xs text-muted-foreground">{activeRoadmap.duration_weeks} weeks</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteRoadmap.mutate(activeRoadmap.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                      <Progress value={progress} className="h-2 mt-4" />
                    </CardHeader>
                    <CardContent>
                      <RoadmapTimeline 
                        roadmapId={activeRoadmap.id} 
                        milestones={activeRoadmap.milestones || []} 
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar - Right Panel */}
                <div className="space-y-4">
                  {/* What should I study */}
                  <Card className="border-border/50 shadow-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        What should I study?
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activeRoadmap.milestones && activeRoadmap.milestones.length > 0 ? (
                        (() => {
                          const nextStep = activeRoadmap.milestones
                            .flatMap(m => m.steps || [])
                            .find(s => !s.is_completed);
                          
                          if (nextStep) {
                            return (
                              <div>
                                <p className="font-medium text-foreground">{nextStep.title}</p>
                                <p className="text-xs text-muted-foreground mt-1 capitalize">{nextStep.difficulty}</p>
                              </div>
                            );
                          }
                          return <p className="text-sm text-muted-foreground">All steps completed!</p>;
                        })()
                      ) : (
                        <p className="text-sm text-muted-foreground">Add milestones to get started</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Progress Summary */}
                  <Card className="border-border/50 shadow-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Progress Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Milestones</span>
                        <span className="font-medium text-foreground">{activeRoadmap.milestones?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Steps</span>
                        <span className="font-medium text-foreground">{totalSteps}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completed</span>
                        <span className="font-medium text-foreground">{completedSteps}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="weekly">
            <Card className="border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Study Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WeeklyPlanner />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateRoadmapModal open={createRoadmapOpen} onOpenChange={setCreateRoadmapOpen} />
    </AppLayout>
  );
}
