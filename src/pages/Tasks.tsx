import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import TaskCard from '@/components/tasks/TaskCard';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, CheckCircle2 } from 'lucide-react';
import { isToday, isFuture, parseISO } from 'date-fns';

type FilterType = 'all' | 'today' | 'upcoming' | 'completed' | 'high-priority';
type SortType = 'due-date' | 'priority' | 'created';

export default function Tasks() {
  const { tasks, isLoading } = useTasks();
  const { categories } = useCategories();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('due-date');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTasks = tasks
    .filter((task) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!task.title.toLowerCase().includes(query) && 
            !task.description?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all' && task.category_id !== categoryFilter) {
        return false;
      }

      // Status filter
      switch (filter) {
        case 'today':
          return task.due_date && isToday(parseISO(task.due_date)) && !task.is_completed;
        case 'upcoming':
          return task.due_date && isFuture(parseISO(task.due_date)) && !task.is_completed;
        case 'completed':
          return task.is_completed;
        case 'high-priority':
          return task.priority === 'high' && !task.is_completed;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'due-date':
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'priority': {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

  const pendingTasks = filteredTasks.filter((t) => !t.is_completed);
  const completedTasks = filteredTasks.filter((t) => t.is_completed);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground">Manage all your tasks in one place</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="gradient-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due-date">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="created">Created</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="high-priority">Priority</TabsTrigger>
            <TabsTrigger value="completed">Done</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Task List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No tasks found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery ? 'Try adjusting your search' : 'Create your first task to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateModalOpen(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filter !== 'completed' && pendingTasks.length > 0 && (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}

            {completedTasks.length > 0 && (filter === 'all' || filter === 'completed') && (
              <div className="space-y-3">
                {filter === 'all' && pendingTasks.length > 0 && (
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Completed ({completedTasks.length})
                  </h3>
                )}
                {completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        )}
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