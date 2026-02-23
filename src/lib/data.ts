
import type { User } from './types';
import { db, auth } from './firebase/clientApp';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
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
    const authUser = await getCurrentAuthUser();
    const currentUserId = authUser?.uid;

    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => {
        const user = { id: doc.id, ...doc.data() } as User;
        if (user.id === currentUserId) {
            return { ...user, name: "You" };
        }
        return user;
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
            console.warn(`User document not found for uid: ${authUser.uid}`);
            // Let's create a record for them if they exist in auth but not firestore
            // This can happen if the doc was deleted manually.
             const name = authUser.displayName || "New User";
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
