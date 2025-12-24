import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';

// Interfaces matching the application needs
export interface Task {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  is_completed: boolean;
  completed_at: string | null;
  reminder_at: string | null;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    color: string;
    icon: string | null;
  } | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  category_id?: string;
  reminder_at?: string;
}

const COLLECTION_NAME = 'tasks';

// Helper to convert Firestore document to Task object
const mapDocToTask = (doc: DocumentData): Task => {
  const data = doc.data();
  
  // Helper to convert Timestamp or Date or String to ISO String
  const toIso = (val: any): string | null => {
    if (!val) return null;
    if (val instanceof Timestamp) return val.toDate().toISOString();
    if (val instanceof Date) return val.toISOString();
    return val; // Assume it's already a string
  };

  return {
    id: doc.id,
    ...data,
    created_at: toIso(data.created_at) || new Date().toISOString(),
    updated_at: toIso(data.updated_at) || new Date().toISOString(),
    due_date: toIso(data.due_date),
    completed_at: toIso(data.completed_at),
    reminder_at: toIso(data.reminder_at),
  } as Task;
};

export const taskService = {
  /**
   * Fetch all tasks for a specific user
   */
  async fetchTasks(userId: string): Promise<Task[]> {
    if (!userId) throw new Error('User ID is required');

    const q = query(
      collection(db, COLLECTION_NAME),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDocToTask);
  },

  /**
   * Create a new task for a user
   */
  async createTask(userId: string, input: CreateTaskInput): Promise<Task> {
    if (!userId) throw new Error('User ID is required');

    const now = new Date();
    
    const taskData = {
      user_id: userId,
      title: input.title,
      description: input.description || null,
      due_date: input.due_date ? new Date(input.due_date) : null, // Store as Timestamp/Date
      priority: input.priority || 'medium',
      category_id: input.category_id || null,
      reminder_at: input.reminder_at ? new Date(input.reminder_at) : null,
      is_completed: false,
      completed_at: null,
      created_at: now,
      updated_at: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), taskData);

    return {
      id: docRef.id,
      ...taskData,
      // Convert dates back to strings for the return value
      due_date: input.due_date || null,
      reminder_at: input.reminder_at || null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      completed_at: null,
    } as Task;
  },

  /**
   * Update an existing task
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    if (!taskId) throw new Error('Task ID is required');

    const taskRef = doc(db, COLLECTION_NAME, taskId);
    
    // Convert string dates back to Date objects if they are in the updates
    // This is optional depending on how we want to store them, but consistency is key.
    // Since `createTask` stores them as Date objects, we should probably do the same here.
    // However, the `updates` object comes from the UI with potentially string dates.
    
    const updateData: any = {
      ...updates,
      updated_at: new Date(),
    };

    // If specific date fields are present, ensure they are Date objects for Firestore
    // or keep them as strings if that's the decision. 
    // Let's stick to Date objects for storage as per `createTask`.
    if (updates.due_date) updateData.due_date = new Date(updates.due_date);
    if (updates.reminder_at) updateData.reminder_at = new Date(updates.reminder_at);
    if (updates.completed_at) updateData.completed_at = new Date(updates.completed_at);

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    await updateDoc(taskRef, updateData);
  },

  /**
   * Toggle task completion status
   */
  async toggleComplete(taskId: string, isCompleted: boolean): Promise<void> {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    
    await updateDoc(taskRef, {
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date() : null,
      updated_at: new Date(),
    });
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await deleteDoc(taskRef);
  }
};
