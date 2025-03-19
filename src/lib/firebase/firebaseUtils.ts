import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Firestore functions
export const addDocument = (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), data);

export const getDocuments = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateDocument = (collectionName: string, id: string, data: any) =>
  updateDoc(doc(db, collectionName, id), data);

export const deleteDocument = (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// User Management
export interface User {
  uid: string;
  email: string;
  displayName: string;
  points: number;
  createdAt: Timestamp;
}

export async function createUserProfile(user: any) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      points: 1000, // Starting points
      createdAt: Timestamp.now(),
    });
  }
}

export async function updateUserPoints(uid: string, points: number) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { points });
}

// Quiz Management
export interface Quiz {
  id: string;
  title: string;
  type: 'weekly' | 'race-weekend' | 'historical';
  questions: QuizQuestion[];
  startDate: Timestamp;
  endDate: Timestamp;
  pointsPerQuestion: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'general' | 'drivers' | 'teams' | 'circuits' | 'history';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  imageUrl?: string;
}

export async function getActiveQuizzes(type?: Quiz['type']) {
  const now = Timestamp.now();
  let quizQuery = query(
    collection(db, 'quizzes'),
    where('startDate', '<=', now),
    where('endDate', '>=', now)
  );

  if (type) {
    quizQuery = query(quizQuery, where('type', '==', type));
  }
  
  const quizSnap = await getDocs(quizQuery);
  return quizSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
}

// Prediction Management
export interface Prediction {
  id: string;
  eventName: string;
  description: string;
  category: 'race' | 'qualifying' | 'sprint' | 'practice';
  type: 'winner' | 'podium' | 'fastest-lap' | 'pole-position' | 'constructor' | 'safety-car' | 'red-flag';
  options: PredictionOption[];
  startDate: Timestamp;
  endDate: Timestamp;
  result?: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  raceWeekend: string;
  circuit: string;
}

export interface PredictionOption {
  text: string;
  odds: number;
  description?: string;
  imageUrl?: string;
}

export interface UserBet {
  uid: string;
  predictionId: string;
  selectedOption: number;
  amount: number;
  timestamp: Timestamp;
  result?: 'won' | 'lost';
  pointsWon?: number;
}

export interface UserStats {
  totalBets: number;
  winningBets: number;
  totalPointsWon: number;
  totalPointsLost: number;
  favoriteCategory: string;
  bestCircuit: string;
}

export async function placeBet(bet: Omit<UserBet, 'timestamp'>) {
  const betRef = doc(collection(db, 'bets'));
  await setDoc(betRef, {
    ...bet,
    timestamp: Timestamp.now(),
  });
}

export async function getLeaderboard(limit: number = 10) {
  const usersQuery = query(
    collection(db, 'users'),
    orderBy('points', 'desc'),
    limit(limit)
  );
  
  const usersSnap = await getDocs(usersQuery);
  return usersSnap.docs.map(doc => doc.data() as User);
}

export async function getActivePredictions(raceWeekend?: string) {
  const now = Timestamp.now();
  let predictionsQuery = query(
    collection(db, 'predictions'),
    where('startDate', '<=', now),
    where('endDate', '>=', now),
    where('status', '==', 'active')
  );

  if (raceWeekend) {
    predictionsQuery = query(predictionsQuery, where('raceWeekend', '==', raceWeekend));
  }
  
  const predictionsSnap = await getDocs(predictionsQuery);
  return predictionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prediction));
}

export async function getUserProfile(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return null;
    }
    return userDoc.data() as User;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function getUserBettingHistory(uid: string): Promise<(UserBet & { prediction: Prediction })[]> {
  try {
    const betsQuery = query(
      collection(db, 'bets'),
      where('uid', '==', uid),
      orderBy('timestamp', 'desc')
    );
    
    const betsSnapshot = await getDocs(betsQuery);
    const bets = await Promise.all(
      betsSnapshot.docs.map(async (betDoc) => {
        const bet = betDoc.data() as UserBet;
        const predictionDoc = await getDoc(doc(db, 'predictions', bet.predictionId));
        const prediction = predictionDoc.data() as Prediction;
        return { ...bet, prediction };
      })
    );
    
    return bets;
  } catch (error) {
    console.error('Error fetching betting history:', error);
    return [];
  }
}

export async function getUserStats(uid: string): Promise<UserStats> {
  try {
    const betsQuery = query(
      collection(db, 'bets'),
      where('uid', '==', uid)
    );
    
    const betsSnapshot = await getDocs(betsQuery);
    const bets = betsSnapshot.docs.map(doc => doc.data() as UserBet);
    
    const stats: UserStats = {
      totalBets: bets.length,
      winningBets: bets.filter(bet => bet.result === 'won').length,
      totalPointsWon: bets.reduce((sum, bet) => sum + (bet.pointsWon || 0), 0),
      totalPointsLost: bets.reduce((sum, bet) => sum + (bet.result === 'lost' ? bet.amount : 0), 0),
      favoriteCategory: '', // Calculate based on most bet category
      bestCircuit: '', // Calculate based on highest win rate circuit
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalBets: 0,
      winningBets: 0,
      totalPointsWon: 0,
      totalPointsLost: 0,
      favoriteCategory: '',
      bestCircuit: '',
    };
  }
}
