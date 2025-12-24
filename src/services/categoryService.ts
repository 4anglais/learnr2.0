import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  DocumentData 
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  created_at: string;
}

const COLLECTION_NAME = 'categories';

const mapDocToCategory = (doc: DocumentData): Category => {
  const data = doc.data();
  // Helper to safely convert dates
  const toIso = (val: any) => {
    if (!val) return null;
    if (val.toDate) return val.toDate().toISOString(); // Firestore Timestamp
    if (val instanceof Date) return val.toISOString();
    return val;
  };

  return {
    id: doc.id,
    ...data,
    created_at: toIso(data.created_at) || new Date().toISOString(),
  } as Category;
};

export const categoryService = {
  async fetchCategories(userId: string): Promise<Category[]> {
    if (!userId) throw new Error('User ID is required');

    const q = query(
      collection(db, COLLECTION_NAME),
      where('user_id', '==', userId),
      orderBy('created_at', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDocToCategory);
  },

  async createCategory(userId: string, input: { name: string; color: string; icon?: string }): Promise<Category> {
    if (!userId) throw new Error('User ID is required');

    const now = new Date();
    const data = {
      user_id: userId,
      name: input.name,
      color: input.color,
      icon: input.icon || null,
      created_at: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);

    return {
      id: docRef.id,
      ...data,
      created_at: now.toISOString(),
    } as Category;
  },

  async createDefaultCategories(userId: string): Promise<void> {
    const DEFAULT_CATEGORIES = [
      { name: 'Homework', color: '#8b5cf6', icon: '📚' },
      { name: 'Exam Prep', color: '#ef4444', icon: '📝' },
      { name: 'Projects', color: '#22c55e', icon: '🎯' },
      { name: 'Reading', color: '#f59e0b', icon: '📖' },
      { name: 'Revision', color: '#0ea5e9', icon: '🔄' },
    ];

    const promises = DEFAULT_CATEGORIES.map(cat => 
      this.createCategory(userId, cat)
    );

    await Promise.all(promises);
  }
};
