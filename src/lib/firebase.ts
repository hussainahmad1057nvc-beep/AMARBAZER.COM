import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Category, Order, SellerStore, User, SystemSettings } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/* Connect to default or specified Firestore database */
export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

// Test server connection as specified in the skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is currently offline or connecting...');
    }
    return false;
  }
}

// Immediately test connection in background
testFirestoreConnection().catch(() => {});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Clean helper database interface for AmarBazar components
export const firebaseDb = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    const path = 'products';
    try {
      const snap = await getDocs(collection(db, path));
      const list: Product[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        list.push({ ...d, id: docSnap.id } as Product);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  },

  async insertProduct(product: Product): Promise<Product> {
    const path = `products/${product.id}`;
    try {
      await setDoc(doc(db, 'products', product.id), product);
      return product;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const path = `products/${id}`;
    try {
      const docRef = doc(db, 'products', id);
      await setDoc(docRef, updates, { merge: true });
      const snap = await getDoc(docRef);
      return { ...snap.data(), id } as Product;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const path = `products/${id}`;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  subscribeToProducts(callback: (products: Product[]) => void): Unsubscribe {
    const path = 'products';
    return onSnapshot(
      collection(db, path),
      (snap) => {
        const prods: Product[] = [];
        snap.forEach(docSnap => {
          prods.push({ ...docSnap.data(), id: docSnap.id } as Product);
        });
        callback(prods);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  // SELLERS
  async getSellers(): Promise<SellerStore[]> {
    const path = 'sellers';
    try {
      const snap = await getDocs(collection(db, path));
      const list: SellerStore[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as SellerStore);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  },

  async insertSeller(seller: SellerStore): Promise<SellerStore> {
    const path = `sellers/${seller.id}`;
    try {
      await setDoc(doc(db, 'sellers', seller.id), seller);
      return seller;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  async updateSeller(id: string, updates: Partial<SellerStore>): Promise<SellerStore> {
    const path = `sellers/${id}`;
    try {
      const docRef = doc(db, 'sellers', id);
      await setDoc(docRef, updates, { merge: true });
      const snap = await getDoc(docRef);
      return { ...snap.data(), id } as SellerStore;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  subscribeToSellers(callback: (sellers: SellerStore[]) => void): Unsubscribe {
    const path = 'sellers';
    return onSnapshot(
      collection(db, path),
      (snap) => {
        const sellers: SellerStore[] = [];
        snap.forEach(docSnap => {
          sellers.push({ ...docSnap.data(), id: docSnap.id } as SellerStore);
        });
        callback(sellers);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    const path = 'categories';
    try {
      const snap = await getDocs(collection(db, path));
      const list: Category[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Category);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  },

  async insertCategory(category: Category): Promise<Category> {
    const path = `categories/${category.id}`;
    try {
      await setDoc(doc(db, 'categories', category.id), category);
      return category;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  // ORDERS
  async getOrders(): Promise<Order[]> {
    const path = 'orders';
    try {
      const snap = await getDocs(collection(db, path));
      const list: Order[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Order);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  },

  async insertOrder(order: Partial<Order>): Promise<Order> {
    const id = order.id || `ord-${Date.now()}`;
    const fullOrder = { ...order, id } as Order;
    const path = `orders/${id}`;
    try {
      await setDoc(doc(db, 'orders', id), fullOrder);
      return fullOrder;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  async updateOrderStatus(id: string, status: string, note?: string): Promise<Order> {
    const path = `orders/${id}`;
    try {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { 
        status, 
        trackingStatus: status === 'delivered' ? 'Delivered' : status === 'shipped' ? 'Handed to Courier' : 'Order Processing',
        ...(note ? { adminNote: note } : {}) 
      });
      const snap = await getDoc(docRef);
      return { ...snap.data(), id } as Order;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // USERS
  async insertUser(user: User): Promise<User> {
    const path = `users/${user.id}`;
    try {
      await setDoc(doc(db, 'users', user.id), user);
      return user;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  // SETTINGS
  async getSettings(): Promise<SystemSettings | null> {
    const path = 'settings/general';
    try {
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (snap.exists()) {
        return snap.data() as SystemSettings;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  },

  async saveSettings(settings: Partial<SystemSettings>): Promise<void> {
    const path = 'settings/general';
    try {
      await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
};
