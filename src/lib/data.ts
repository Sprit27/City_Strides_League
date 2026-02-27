
import type { User } from './types';
import { db, auth } from './firebase/clientApp';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, increment, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';

// Helper to get the current authenticated user
function getCurrentAuthUser(): Promise<AuthUser | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function getUsers(): Promise<User[]> {
  try {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() } as User;
    });
    return userList;
  } catch (error) {
    console.error("Error fetching users: ", error);
    return [];
  }
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const authUser = await getCurrentAuthUser();
        if (!authUser) {
            return null;
        }

        const userRef = doc(db, 'users', authUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() } as User;
        } else {
            // Auto-create profile if it doesn't exist (e.g. first time Google login)
             const name = authUser.displayName || "Runner";
             const newUser: Omit<User, 'id'> = {
                name,
                avatarUrl: authUser.photoURL || "https://images.unsplash.com/photo-1623991991743-86f9db94ea35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBjaXR5fGVufDB8fHx8MTc3MTc1NzkwMHww&ixlib=rb-4.1.0&q=80&w=1080",
                weeklyStats: { distance: 0, avgSpeed: 0, pace: 0 },
            };
            await setDoc(userRef, newUser);
            return { id: authUser.uid, ...newUser };
        }
    } catch(error) {
        console.error("Error fetching current user: ", error);
        return null;
    }
}

export async function saveRun(runData: {
  distance: number;
  avgSpeed: number;
  pace: number;
  duration: number;
  timestamp: Date;
}): Promise<void> {
  try {
    const authUser = await getCurrentAuthUser();
    if (!authUser) {
      throw new Error('User not authenticated');
    }

    const userRef = doc(db, 'users', authUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User profile not found');
    }

    const currentUser = userSnap.data() as Omit<User, 'id'>;
    const currentStats = currentUser.weeklyStats;

    // Update weekly stats - keep the best/longest values
    const newStats = {
      distance: Math.max(currentStats.distance, runData.distance),
      avgSpeed: Math.max(currentStats.avgSpeed, runData.avgSpeed),
      pace: currentStats.pace === 0 ? runData.pace : Math.min(currentStats.pace, runData.pace)
    };

    // Update user's weekly stats
    await updateDoc(userRef, {
      'weeklyStats.distance': newStats.distance,
      'weeklyStats.avgSpeed': newStats.avgSpeed,
      'weeklyStats.pace': newStats.pace
    });

    // Save run to runs collection for history
    await addDoc(collection(db, 'runs'), {
      userId: authUser.uid,
      userName: currentUser.name,
      distance: runData.distance,
      avgSpeed: runData.avgSpeed,
      pace: runData.pace,
      duration: runData.duration,
      timestamp: runData.timestamp
    });

    console.log('Run saved successfully');
  } catch (error) {
    console.error('Error saving run:', error);
    throw error;
  }
}
