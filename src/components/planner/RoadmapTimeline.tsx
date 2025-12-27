import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, ExternalLink, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Milestone, Step, useRoadmaps } from '@/hooks/useRoadmaps';
import AddMilestoneModal from './AddMilestoneModal';
import AddStepModal from './AddStepModal';
import AddToTaskModal from './AddToTaskModal';

interface RoadmapTimelineProps {
  roadmapId: string;
  milestones: Milestone[];
}

export default function RoadmapTimeline({ roadmapId, milestones }: RoadmapTimelineProps) {
  const { toggleStepComplete, deleteMilestone, deleteStep } = useRoadmaps();
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set(milestones.map(m => m.id)));

  // Expand new milestones automatically when they are added
  useEffect(() => {
    setExpandedMilestones(prev => {
      const newSet = new Set(prev);
      let changed = false;
      milestones.forEach(m => {
        if (!newSet.has(m.id)) {
          newSet.add(m.id);
          changed = true;
        }
      });
      return changed ? newSet : prev;
    });
  }, [milestones]);
  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false);
  const [addStepMilestone, setAddStepMilestone] = useState<string | null>(null);
  const [addToTaskStep, setAddToTaskStep] = useState<Step | null>(null);

  const toggleMilestone = (id: string) => {
    const newSet = new Set(expandedMilestones);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedMilestones(newSet);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      case 'intermediate': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400';
      case 'advanced': return 'bg-rose-500/20 text-rose-600 dark:text-rose-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {milestones.map((milestone, mIndex) => {
        const completedSteps = milestone.steps?.filter(s => s.is_completed).length || 0;
        const totalSteps = milestone.steps?.length || 0;
        const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

        return (
          <Collapsible
            key={milestone.id}
            open={expandedMilestones.has(milestone.id)}
            onOpenChange={() => toggleMilestone(milestone.id)}
          >
            <div className="relative">
              {/* Vertical line connector */}
              {mIndex < milestones.length - 1 && (
                <div 
                  className="absolute left-4 top-12 w-0.5 h-full -translate-x-1/2"
                  style={{ backgroundColor: milestone.color + '40' }}
                />
              )}

              {/* Milestone header */}
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:bg-accent/50 transition-colors cursor-pointer group">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: milestone.color }}
                  >
                    {mIndex + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{milestone.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {completedSteps}/{totalSteps}
                      </Badge>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground truncate">{milestone.description}</p>
                    )}
                    <Progress value={progress} className="h-1.5 mt-2" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMilestone.mutate({ id: milestone.id, roadmap_id: roadmapId });
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    {expandedMilestones.has(milestone.id) ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>

              {/* Steps */}
              <CollapsibleContent>
                <div className="ml-8 mt-2 space-y-2 relative">
                  {/* Connecting line */}
                  <div 
                    className="absolute left-0 top-0 w-0.5 h-full -translate-x-1/2"
                    style={{ backgroundColor: milestone.color + '30' }}
                  />

                  {milestone.steps?.map((step, sIndex) => (
                    <div
                      key={step.id}
                      className={cn(
                        "relative flex items-center gap-3 p-3 ml-4 rounded-lg border border-border/30 bg-card/50 group transition-all",
                        step.is_completed && "opacity-60"
                      )}
                    >
                      {/* Step node */}
                      <div 
                        className="absolute -left-4 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2"
                        style={{ 
                          borderColor: milestone.color,
                          backgroundColor: step.is_completed ? milestone.color : 'transparent'
                        }}
                      />

                      <button
                        onClick={() => toggleStepComplete.mutate({ id: step.id, roadmap_id: roadmapId, is_completed: !step.is_completed })}
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                          step.is_completed
                            ? "bg-foreground border-foreground"
                            : "border-border hover:border-foreground"
                        )}
                      >
                        {step.is_completed && <Check className="h-3 w-3 text-background" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium text-foreground",
                          step.is_completed && "line-through"
                        )}>
                          {step.title}
                        </p>
                      </div>

                      <Badge className={cn("text-xs", getDifficultyColor(step.difficulty))}>
                        {step.difficulty}
                      </Badge>

                      {step.resource_url && (
                        <a
                          href={step.resource_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setAddToTaskStep(step)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Task
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => deleteStep.mutate({ id: step.id, roadmap_id: roadmapId })}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add step button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-4 text-muted-foreground"
                    onClick={() => setAddStepMilestone(milestone.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Step
                  </Button>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}

      {/* Add milestone button */}
      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={() => setAddMilestoneOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Milestone
      </Button>

      <AddMilestoneModal
        open={addMilestoneOpen}
        onOpenChange={setAddMilestoneOpen}
        roadmapId={roadmapId}
        position={milestones.length}
      />

      {addStepMilestone && (
        <AddStepModal
          open={!!addStepMilestone}
          onOpenChange={(open) => !open && setAddStepMilestone(null)}
          roadmapId={roadmapId}
          milestoneId={addStepMilestone}
          position={milestones.find(m => m.id === addStepMilestone)?.steps?.length || 0}
        />
      )}

      {addToTaskStep && (
        <AddToTaskModal
          open={!!addToTaskStep}
          onOpenChange={(open) => !open && setAddToTaskStep(null)}
          step={addToTaskStep}
        />
      )}
    </div>
  );
}
