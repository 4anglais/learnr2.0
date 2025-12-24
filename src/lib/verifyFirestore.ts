import { db, auth } from '../integrations/firebase/config';
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';

export const verifyFirestoreIntegration = async () => {
  const user = auth.currentUser;

  if (!user) {
    console.error("❌ No user logged in. Please log in first.");
    return;
  }

  console.log(`🚀 Starting Firestore verification for user: ${user.uid}`);

  try {
    // 1. Create User Document
    console.log("Creating User Document...");
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      name: user.displayName || 'Test User',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      username: `user_${user.uid.substring(0, 5)}` // Fallback username
    }, { merge: true });
    console.log("✅ User document created/updated successfully.");

    // 2. Create Category Document
    console.log("Creating Category Document...");
    const categoriesRef = collection(db, 'categories');
    const categoryDoc = await addDoc(categoriesRef, {
      user_id: user.uid,
      name: 'Test Category',
      color: '#FF5733',
      icon: '📝',
      created_at: serverTimestamp()
    });
    console.log(`✅ Category document created with ID: ${categoryDoc.id}`);

    // 3. Create Task Document
    console.log("Creating Task Document...");
    const tasksRef = collection(db, 'tasks');
    const taskDoc = await addDoc(tasksRef, {
      user_id: user.uid,
      title: 'Test Task',
      description: 'This is a test task to verify Firestore.',
      completed: false,
      priority: 'medium',
      category_id: categoryDoc.id,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    console.log(`✅ Task document created with ID: ${taskDoc.id}`);

    // 4. Test Error Handling (Invalid User ID)
    console.log("Testing Error Handling (Security Rules)...");
    try {
      await addDoc(tasksRef, {
        user_id: 'wrong_user_id', // This should fail if rules are correct
        title: 'Illegal Task',
        completed: false,
        priority: 'low',
        created_at: serverTimestamp()
      });
      console.warn("⚠️ SECURITY WARNING: Created a task with wrong user_id! Security rules might be too permissive.");
    } catch (error) {
      console.log("✅ Expected Error caught:", error);
      console.log("This confirms that security rules are blocking invalid writes (or all writes).");
    }

    console.log("🎉 Firestore verification script finished.");

  } catch (error) {
    console.error("❌ Firestore verification failed:", error);
    if (JSON.stringify(error).includes("permission-denied")) {
        console.error("💡 NOTE: If you got 'permission-denied', check your firestore.rules.");
    }
  }
};
