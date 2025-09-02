'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  studentId?: string;
  role: 'student' | 'staff' | 'admin';
  department?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile({ ...userDoc.data(), uid: user.uid } as UserProfile);
          } else {
            console.log('No user profile found in Firestore for:', user.uid);
            // If no profile exists, create a basic one
            const basicProfile: UserProfile = {
              uid: user.uid,
              email: user.email!,
              name: user.displayName || 'User',
              role: 'student',
              createdAt: new Date()
            };
            await setDoc(doc(db, 'users', user.uid), basicProfile);
            setUserProfile(basicProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Set basic profile from auth user if Firestore fails
          setUserProfile({
            uid: user.uid,
            email: user.email!,
            name: user.displayName || 'User',
            role: 'student',
            createdAt: new Date()
          });
        }
      } else {
        setUserProfile(null);
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(user, { displayName: userData.name });
      
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name: userData.name || '',
        studentId: userData.studentId,
        role: userData.role || 'student',
        department: userData.department,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      setUserProfile(userProfile);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};