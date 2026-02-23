
import type { User } from './types';
import { db } from './firebase/clientApp';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// In a real app, you would get this from your authentication state.
const CURRENT_USER_ID = 'user-6';

export async function getUsers(): Promise<User[]> {
  try {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return userList;
  } catch (error) {
    console.error("Error fetching users: ", error);
    // Returning an empty array in case of an error, so the app doesn't crash.
    return [];
  }
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const userRef = doc(db, 'users', CURRENT_USER_ID);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() } as User;
        } else {
            console.log("Current user not found in database!");
            return null;
        }
    } catch(error) {
        console.error("Error fetching current user: ", error);
        return null;
    }
}
