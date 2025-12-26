import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRoadmaps } from '@/hooks/useRoadmaps';

interface AddStepModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roadmapId: string;
  milestoneId: string;
  position: number;
}

export default function AddStepModal({ open, onOpenChange, roadmapId, milestoneId, position }: AddStepModalProps) {
  const { createStep } = useRoadmaps();
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [resourceUrl, setResourceUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createStep.mutateAsync({
      roadmap_id: roadmapId,
      milestone_id: milestoneId,
      title: title.trim(),
      difficulty,
      resource_url: resourceUrl.trim() || undefined,
      position,
    });

    setTitle('');
    setDifficulty('beginner');
    setResourceUrl('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Step</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Learn React Hooks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resourceUrl">Resource URL (optional)</Label>
            <Input
              id="resourceUrl"
              type="url"
              placeholder="https://..."
              value={resourceUrl}
              onChange={(e) => setResourceUrl(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createStep.isPending}>
              {createStep.isPending ? 'Adding...' : 'Add Step'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
