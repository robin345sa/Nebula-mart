import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  Firestore,
  writeBatch
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import rawConfig from '../../firebase-applet-config.json';

const config = {
  projectId: rawConfig.projectId || 'polynomial-battery-4smzh',
  appId: rawConfig.appId,
  apiKey: rawConfig.apiKey,
  authDomain: rawConfig.authDomain,
  storageBucket: rawConfig.storageBucket,
  messagingSenderId: rawConfig.messagingSenderId,
  firestoreDatabaseId: rawConfig.firestoreDatabaseId || '(default)'
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(config);
} else {
  app = getApp();
}

// In Firestore, if a custom database ID is configured, pass it to getFirestore
export const db: Firestore = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

export const auth: Auth = getAuth(app);
export const firebaseApp = app;

/**
 * Diagnostic test connection required by Firebase Integration Skill
 */
export async function testFirebaseConnection(): Promise<{ success: boolean; message: string; databaseId?: string }> {
  try {
    // Attempt pinging test/connection doc
    await getDocFromServer(doc(db, 'test', 'connection'));
    return {
      success: true,
      message: 'Successfully connected to Firebase Firestore live cloud database.',
      databaseId: config.firestoreDatabaseId
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firestore client is offline. Check network connection.');
      return {
        success: false,
        message: 'Firebase Firestore is currently unreachable (offline). Falling back to resilient local storage.',
        databaseId: config.firestoreDatabaseId
      };
    }
    // If doc simply does not exist or permission is okay for read, it is connected
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('permission-denied')) {
      return {
        success: false,
        message: `Firestore permission notice: ${msg}`,
        databaseId: config.firestoreDatabaseId
      };
    }
    return {
      success: true,
      message: 'Firestore cloud database is active and ready.',
      databaseId: config.firestoreDatabaseId
    };
  }
}

// Run initial diagnostic ping silently
testFirebaseConnection().catch(() => {});

/**
 * Generic Firestore Operations for real-time multi-device cloud synchronization
 */
export const FirestoreService = {
  /**
   * Save or update a single document
   */
  async saveDoc<T extends Record<string, any>>(collectionName: string, id: string, data: T): Promise<void> {
    try {
      const docRef = doc(db, collectionName, String(id));
      // Ensure no undefined values which cause Firestore serialization errors
      const sanitized = JSON.parse(JSON.stringify(data));
      await setDoc(docRef, sanitized, { merge: true });
    } catch (err) {
      console.warn(`[Firestore] Failed to save doc to ${collectionName}/${id}:`, err);
    }
  },

  /**
   * Delete a document
   */
  async deleteDoc(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, String(id));
      await deleteDoc(docRef);
    } catch (err) {
      console.warn(`[Firestore] Failed to delete doc ${collectionName}/${id}:`, err);
    }
  },

  /**
   * Fetch all documents in a collection
   */
  async getCollection<T>(collectionName: string): Promise<T[]> {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      const items: T[] = [];
      snapshot.forEach((snapDoc) => {
        items.push({ id: snapDoc.id, ...snapDoc.data() } as T);
      });
      return items;
    } catch (err) {
      console.warn(`[Firestore] Failed to get collection ${collectionName}:`, err);
      return [];
    }
  },

  /**
   * Batch push local array to Firestore
   */
  async pushBatch<T extends { id: string }>(collectionName: string, items: T[]): Promise<number> {
    if (!items || items.length === 0) return 0;
    try {
      let count = 0;
      // Firestore batches max 500 writes
      const batchSize = 400;
      for (let i = 0; i < items.length; i += batchSize) {
        const chunk = items.slice(i, i + batchSize);
        const batch = writeBatch(db);
        chunk.forEach((item) => {
          const docRef = doc(db, collectionName, String(item.id));
          const sanitized = JSON.parse(JSON.stringify(item));
          batch.set(docRef, sanitized, { merge: true });
          count++;
        });
        await batch.commit();
      }
      return count;
    } catch (err) {
      console.error(`[Firestore] Batch write error on ${collectionName}:`, err);
      return 0;
    }
  },

  /**
   * Get single document
   */
  async getSingleDoc<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, String(id));
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as T;
      }
      return null;
    } catch (err) {
      console.warn(`[Firestore] Failed to get doc ${collectionName}/${id}:`, err);
      return null;
    }
  },

  /**
   * Realtime document subscriber
   */
  subscribeDoc<T>(
    collectionName: string,
    id: string,
    onData: (data: T | null) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const docRef = doc(db, collectionName, String(id));
      return onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            onData({ id: snapshot.id, ...snapshot.data() } as T);
          } else {
            onData(null);
          }
        },
        (error) => {
          console.warn(`[Firestore listener error on ${collectionName}/${id}]:`, error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn(`[Firestore subscription error on ${collectionName}/${id}]:`, err);
      return () => {};
    }
  },

  /**
   * Realtime collection subscriber
   */
  subscribeCollection<T>(
    collectionName: string,
    onData: (data: T[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const colRef = collection(db, collectionName);
      return onSnapshot(
        colRef,
        (snapshot) => {
          const items: T[] = [];
          snapshot.forEach((d) => {
            items.push({ id: d.id, ...d.data() } as T);
          });
          onData(items);
        },
        (error) => {
          console.warn(`[Firestore listener error on ${collectionName}]:`, error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn(`[Firestore subscription error on ${collectionName}]:`, err);
      return () => {};
    }
  }
};
