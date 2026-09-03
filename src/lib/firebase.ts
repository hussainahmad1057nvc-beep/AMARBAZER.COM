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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
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
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
}

// Utility to recursively sanitize objects for Firestore (omits undefined values which throw FirebaseError)
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined || data === null) return data;
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (err) {
    console.warn('sanitizeForFirestore serialization notice:', err);
    return data;
  }
}

// Utility to normalize products received from Firestore or API, ensuring images array and required fields are always valid
export function normalizeProduct(p: any): Product {
  const defaultImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
  let validImages: string[] = [];
  if (Array.isArray(p?.images) && p.images.length > 0) {
    validImages = p.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
  } else if (typeof p?.images === 'string' && p.images.trim().length > 0) {
    validImages = [p.images.trim()];
  } else if (typeof p?.image === 'string' && p.image.trim().length > 0) {
    validImages = [p.image.trim()];
  }
  if (validImages.length === 0) {
    validImages = [defaultImg];
  }

  const priceNum = Number(p?.price) > 0 ? Number(p.price) : 100;
  const titleText = (p?.title && String(p.title).trim()) || (p?.titleBn && String(p.titleBn).trim()) || 'Product';
  const titleBnText = (p?.titleBn && String(p.titleBn).trim()) || (p?.title && String(p.title).trim()) || 'পণ্য';

  return {
    ...p,
    id: p?.id || `prod-${Date.now()}`,
    title: titleText,
    titleBn: titleBnText,
    price: priceNum,
    discountPrice: p?.discountPrice ? Number(p.discountPrice) : undefined,
    images: validImages,
    stock: p?.stock !== undefined && !isNaN(Number(p.stock)) ? Number(p.stock) : 20,
    isApproved: p?.isApproved !== false,
    categoryId: p?.categoryId || 'cat-1',
    categoryName: p?.categoryName || 'General',
    variants: Array.isArray(p?.variants) ? p.variants : [],
    variantPrices: p?.variantPrices || {},
    bulkOffers: Array.isArray(p?.bulkOffers) ? p.bulkOffers : [],
    comboItems: Array.isArray(p?.comboItems) ? p.comboItems : []
  };
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
        list.push(normalizeProduct({ ...d, id: docSnap.id }));
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return [];
    }
  },

  async insertProduct(product: Product): Promise<Product> {
    const path = `products/${product.id}`;
    try {
      const sanitized = sanitizeForFirestore(product);
      await setDoc(doc(db, 'products', product.id), sanitized);
      // If it was in deleted_products, clean it up
      try {
        await deleteDoc(doc(db, 'deleted_products', product.id));
      } catch {}
      console.log('[Firestore] Product saved to live cloud:', product.id);
      return product;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      return product;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const path = `products/${id}`;
    try {
      const docRef = doc(db, 'products', id);
      const sanitized = sanitizeForFirestore(updates);
      await setDoc(docRef, sanitized, { merge: true });
      // If it was in deleted_products, clean it up
      try {
        await deleteDoc(doc(db, 'deleted_products', id));
      } catch {}
      const snap = await getDoc(docRef);
      return { ...snap.data(), id } as Product;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      return { ...updates, id } as Product;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const path = `products/${id}`;
    try {
      // 1. Delete actual product document
      await deleteDoc(doc(db, 'products', id));
      // 2. Mark in deleted_products collection so ALL connected devices instantly sync this deletion
      await setDoc(doc(db, 'deleted_products', id), {
        id,
        deletedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  async getDeletedProductIds(): Promise<string[]> {
    const path = 'deleted_products';
    try {
      const snap = await getDocs(collection(db, path));
      const ids: string[] = [];
      snap.forEach(docSnap => {
        ids.push(docSnap.id);
      });
      return ids;
    } catch (err) {
      return [];
    }
  },

  subscribeToDeletedProducts(callback: (deletedIds: string[]) => void): Unsubscribe {
    const path = 'deleted_products';
    try {
      return onSnapshot(
        collection(db, path),
        (snap) => {
          const ids: string[] = [];
          snap.forEach(docSnap => {
            ids.push(docSnap.id);
          });
          callback(ids);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
    }
  },

  subscribeToProducts(callback: (products: Product[]) => void): Unsubscribe {
    const path = 'products';
    try {
      return onSnapshot(
        collection(db, path),
        (snap) => {
          const prods: Product[] = [];
          snap.forEach(docSnap => {
            prods.push(normalizeProduct({ ...docSnap.data(), id: docSnap.id }));
          });
          callback(prods);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
    }
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
      return [];
    }
  },

  async insertSeller(seller: SellerStore): Promise<SellerStore> {
    const path = `sellers/${seller.id}`;
    try {
      const sanitized = sanitizeForFirestore(seller);
      await setDoc(doc(db, 'sellers', seller.id), sanitized);
      return seller;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      return seller;
    }
  },

  async updateSeller(id: string, updates: Partial<SellerStore>): Promise<SellerStore> {
    const path = `sellers/${id}`;
    try {
      const docRef = doc(db, 'sellers', id);
      const sanitized = sanitizeForFirestore(updates);
      await setDoc(docRef, sanitized, { merge: true });
      const snap = await getDoc(docRef);
      return { ...snap.data(), id } as SellerStore;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      return { ...updates, id } as SellerStore;
    }
  },

  subscribeToSellers(callback: (sellers: SellerStore[]) => void): Unsubscribe {
    const path = 'sellers';
    try {
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
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
    }
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
      return [];
    }
  },

  async insertCategory(category: Category): Promise<Category> {
    const path = `categories/${category.id}`;
    try {
      const sanitized = sanitizeForFirestore(category);
      await setDoc(doc(db, 'categories', category.id), sanitized);
      try {
        await deleteDoc(doc(db, 'deleted_categories', category.id));
      } catch {}
      return category;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      return category;
    }
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const path = `categories/${id}`;
    try {
      const sanitized = sanitizeForFirestore(updates);
      await updateDoc(doc(db, 'categories', id), sanitized);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  async deleteCategory(id: string): Promise<void> {
    const path = `categories/${id}`;
    try {
      await deleteDoc(doc(db, 'categories', id));
      await setDoc(doc(db, 'deleted_categories', id), {
        id,
        deletedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  subscribeToCategories(callback: (categories: Category[]) => void): Unsubscribe {
    const path = 'categories';
    try {
      return onSnapshot(
        collection(db, path),
        (snap) => {
          const list: Category[] = [];
          snap.forEach(docSnap => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Category);
          });
          callback(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
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
      return [];
    }
  },

  async insertOrder(order: Partial<Order>): Promise<Order> {
    const id = order.id || `ord-${Date.now()}`;
    const fullOrder = { ...order, id } as Order;
    const path = `orders/${id}`;
    try {
      const sanitized = sanitizeForFirestore(fullOrder);
      await setDoc(doc(db, 'orders', id), sanitized);
      return fullOrder;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      return fullOrder;
    }
  },

  async deleteOrder(id: string): Promise<void> {
    const path = `orders/${id}`;
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  subscribeToOrders(callback: (orders: Order[]) => void): Unsubscribe {
    const path = 'orders';
    try {
      return onSnapshot(
        collection(db, path),
        (snap) => {
          const list: Order[] = [];
          snap.forEach(docSnap => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Order);
          });
          callback(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
    }
  },

  async updateOrderStatus(id: string, status: string, note?: string): Promise<Order | null> {
    const path = `orders/${id}`;
    try {
      const docRef = doc(db, 'orders', id);
      const updates = sanitizeForFirestore({ 
        status, 
        trackingStatus: status === 'delivered' ? 'Delivered' : status === 'shipped' ? 'Handed to Courier' : 'Order Processing',
        ...(note ? { adminNote: note } : {}) 
      });
      await updateDoc(docRef, updates);
      const snap = await getDoc(docRef);
      return { ...snap.data(), id } as Order;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
      return null;
    }
  },

  // USERS
  async getUsers(): Promise<User[]> {
    const path = 'users';
    try {
      const snap = await getDocs(collection(db, path));
      const list: User[] = [];
      snap.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as User);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return [];
    }
  },

  async getUserById(id: string): Promise<User | null> {
    const path = `users/${id}`;
    try {
      const snap = await getDoc(doc(db, 'users', id));
      if (snap.exists()) {
        return { ...snap.data(), id: snap.id } as User;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  },

  async findUser(query: string): Promise<User | null> {
    if (!query) return null;
    const cleanQ = query.trim().toLowerCase();
    const cleanDigits = cleanQ.replace(/[^0-9]/g, '');

    try {
      const users = await this.getUsers();
      const found = users.find(u => {
        const uName = (u.username || '').toLowerCase();
        const uEmail = (u.email || '').toLowerCase();
        const uPhone = (u.phone || '').replace(/[^0-9]/g, '');
        return uName === cleanQ || uEmail === cleanQ || (cleanDigits && uPhone.includes(cleanDigits)) || (cleanQ === 'admin' && u.role === 'admin') || (cleanQ === 'seller' && u.role === 'seller') || (cleanQ === 'customer' && u.role === 'customer');
      });
      return found || null;
    } catch (err) {
      return null;
    }
  },

  async insertUser(user: User): Promise<User> {
    const path = `users/${user.id}`;
    try {
      const sanitized = sanitizeForFirestore(user);
      await setDoc(doc(db, 'users', user.id), sanitized);
      return user;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      return user;
    }
  },

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const path = `users/${id}`;
    try {
      const sanitized = sanitizeForFirestore(updates);
      await setDoc(doc(db, 'users', id), sanitized, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  async deleteUser(id: string): Promise<void> {
    const path = `users/${id}`;
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  subscribeToUsers(callback: (users: User[]) => void): Unsubscribe {
    const path = 'users';
    try {
      return onSnapshot(
        collection(db, path),
        (snap) => {
          const list: User[] = [];
          snap.forEach(docSnap => {
            list.push({ ...docSnap.data(), id: docSnap.id } as User);
          });
          callback(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
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
      return null;
    }
  },

  async saveSettings(settings: Partial<SystemSettings>): Promise<void> {
    const path = 'settings/general';
    try {
      const sanitized = sanitizeForFirestore(settings);
      await setDoc(doc(db, 'settings', 'general'), sanitized, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  subscribeToSettings(callback: (settings: SystemSettings) => void): Unsubscribe {
    const path = 'settings/general';
    try {
      return onSnapshot(
        doc(db, 'settings', 'general'),
        (snap) => {
          if (snap.exists()) {
            callback(snap.data() as SystemSettings);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
    }
  },

  // AUTO-SEEDING INITIAL DATA TO FIRESTORE
  async seedInitialDataIfEmpty(initialData: {
    products?: Product[];
    categories?: Category[];
    sellers?: SellerStore[];
    users?: User[];
    settings?: SystemSettings;
  }): Promise<void> {
    try {
      // 1. Seed Settings if not present
      const currentSettings = await this.getSettings();
      if (!currentSettings && initialData.settings) {
        await this.saveSettings(initialData.settings);
      }

      // 2. Seed Users if collection is empty
      const existingUsers = await this.getUsers();
      if (existingUsers.length === 0 && initialData.users && initialData.users.length > 0) {
        for (const u of initialData.users) {
          await this.insertUser(u);
        }
      } else if (initialData.users) {
        // Ensure default admin exists in Firestore
        const adminExists = existingUsers.some(u => u.username === 'admin' || u.role === 'admin');
        if (!adminExists) {
          const defaultAdmin = initialData.users.find(u => u.username === 'admin');
          if (defaultAdmin) await this.insertUser(defaultAdmin);
        }
      }

      // 3. Seed Categories if empty
      const existingCats = await this.getCategories();
      if (existingCats.length === 0 && initialData.categories && initialData.categories.length > 0) {
        for (const cat of initialData.categories) {
          await this.insertCategory(cat);
        }
      }

      // 4. Seed Sellers if empty
      const existingSellers = await this.getSellers();
      if (existingSellers.length === 0 && initialData.sellers && initialData.sellers.length > 0) {
        for (const sel of initialData.sellers) {
          await this.insertSeller(sel);
        }
      }

      // 5. Products are strictly clean - NO auto-seeding of mock products
      await this.saveSettings({ ...(currentSettings || {}), hasSeededProducts: true } as any);
    } catch (e) {
      console.warn('Firestore auto-seed notice:', e);
    }
  }
};
