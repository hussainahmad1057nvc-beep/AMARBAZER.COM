import { StorageFile, Product, SellerStore } from '../types';

const STORAGE_KEY = 'amarbazar_custom_storage_files';
const PURCHASED_STORAGE_KEY = 'amarbazar_purchased_storage_plans';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export interface FirebaseStoragePlan {
  id: string;
  nameBn: string;
  nameEn: string;
  totalGb: number;
  firestoreDbGb: number;
  storageGb: number;
  priceBdt: number;
  billingCycle: string;
  badgeBn?: string;
  badgeEn?: string;
  descriptionBn: string;
  descriptionEn: string;
  featuresBn: string[];
  featuresEn: string[];
}

export const FIREBASE_STORAGE_PLANS: FirebaseStoragePlan[] = [
  {
    id: 'spark_free',
    nameBn: 'ফায়ারবেস স্পার্ক (ফ্রি টিয়ার)',
    nameEn: 'Firebase Spark (Free Tier)',
    totalGb: 5,
    firestoreDbGb: 1,
    storageGb: 5,
    priceBdt: 0,
    billingCycle: 'লাইফটাইম ফ্রি',
    badgeBn: 'ফ্রি প্ল্যান',
    badgeEn: 'Free Plan',
    descriptionBn: 'নতুন বিক্রেতা ও প্রাথমিক পণ্য ক্যাটালগের জন্য বিনামূল্যে লাইভ ক্লাউড স্টোরেজ।',
    descriptionEn: 'Default free cloud storage for new stores and initial product catalogs.',
    featuresBn: [
      '৫ জিবি ফায়ারবেস ফাইল ও মিডিয়া স্টোরেজ',
      '১ জিবি ফায়ারস্টোর নো-এসকিউএল ডাটাবেজ',
      'রিয়েলটাইম স্ন্যাপশট লাইভ সিঙ্ক',
      'অটো ব্যাকআপ ও সিকিউর এনক্রিপশন'
    ],
    featuresEn: [
      '5 GB Firebase Cloud File & Media Storage',
      '1 GB Firestore NoSQL Live Database',
      'Real-time Snapshots Multi-Device Sync',
      'Encrypted Storage & Automatic Cloud Sync'
    ]
  },
  {
    id: 'blaze_15gb',
    nameBn: 'ফায়ারবেস ব্লেজ প্রো (১৫ জিবি)',
    nameEn: 'Firebase Blaze Pro (15 GB)',
    totalGb: 15,
    firestoreDbGb: 5,
    storageGb: 15,
    priceBdt: 490,
    billingCycle: 'মাসিক',
    badgeBn: 'সবচেয়ে জনপ্রিয়',
    badgeEn: 'Most Popular',
    descriptionBn: 'মাঝারি শপের জন্য হাই-স্পিড মিডিয়া, হাজারো পণ্যের ছবি ও কাস্টমার ইনভয়েস স্টোরেজ।',
    descriptionEn: 'Ideal for growing stores with thousands of product photos and invoice memos.',
    featuresBn: [
      '১৫ জিবি আল্ট্রা-ফাস্ট ফায়ারবেস ক্লাউড স্টোরেজ',
      '৫ জিবি ডেডিকেটেড ফায়ারস্টোর ডাটা স্পেস',
      'সীমাহীন ব্যান্ডউইথ ও সিডিএন এজ ক্যাশিং',
      'স্বয়ংক্রিয় দৈনিক ডাটাবেজ ব্যাকআপ'
    ],
    featuresEn: [
      '15 GB Ultra-Fast Firebase Cloud Storage',
      '5 GB Dedicated Firestore Data Space',
      'Unlimited Bandwidth & CDN Edge Caching',
      'Automated Daily Database Snapshots'
    ]
  },
  {
    id: 'blaze_50gb',
    nameBn: 'ফায়ারবেস ব্লেজ বিজনেস (৫০ জিবি)',
    nameEn: 'Firebase Blaze Business (50 GB)',
    totalGb: 50,
    firestoreDbGb: 15,
    storageGb: 50,
    priceBdt: 1250,
    billingCycle: 'মাসিক',
    badgeBn: 'হাই ক্যাপাসিটি',
    badgeEn: 'High Capacity',
    descriptionBn: 'লার্জ মাল্টি-ক্যাটাগরি ই-কমার্স শপ ও দ্রুতগতির হাই-রেজোলিউশন ছবি ও অডিও সাপোর্ট।',
    descriptionEn: 'Built for high-volume stores requiring massive image libraries and instant access.',
    featuresBn: [
      '৫০ জিবি ফায়ারবেস ক্লাউড মিডিয়া ও ফাইল স্পেস',
      '১৫ জিবি ডেডিকেটেড ফায়ারস্টোর নো-এসকিউএল কোটা',
      'প্রায়োরিটি ক্লাউড সাপোর্ট ও এসএলএ ৯৯.৯৯%',
      'ইনভয়েস ও অডিও নোটের আনলিমিটেড লাইভ ফাইল স্টোর'
    ],
    featuresEn: [
      '50 GB Firebase Cloud Media & Files',
      '15 GB Dedicated Firestore NoSQL Quota',
      'Priority Cloud Support with 99.99% SLA',
      'Live Invoice & Audio Memo Storage'
    ]
  },
  {
    id: 'blaze_100gb',
    nameBn: 'ফায়ারবেস এন্টারপ্রাইজ (১০০ জিবি)',
    nameEn: 'Firebase Enterprise (100 GB)',
    totalGb: 100,
    firestoreDbGb: 30,
    storageGb: 100,
    priceBdt: 2400,
    billingCycle: 'মাসিক',
    badgeBn: 'এন্টারপ্রাইজ',
    badgeEn: 'Enterprise',
    descriptionBn: 'বৃহৎ ব্র্যান্ড এবং মাল্টি-স্টোর চেইনের জন্য কর্পোরেট মেমোরি ও আল্ট্রা সিকিউর বাকেট।',
    descriptionEn: 'For corporate brands and enterprise multi-location store chains.',
    featuresBn: [
      '১০০ জিবি সুপার ফায়ারবেস ক্লাউড স্টোরেজ',
      '৩০ জিবি ফায়ারস্টোর এন্টারপ্রাইজ ডাটাবেজ',
      'কাস্টম সাব-ডোমেন ও প্রাইভেট ক্লাউড বাকেট',
      '২৪/৭ ডেডিকেটেড ডেটাবেজ কনসালটেন্ট সাপোর্ট'
    ],
    featuresEn: [
      '100 GB Super Firebase Cloud Storage',
      '30 GB Firestore Enterprise Database',
      'Custom Sub-domain & Private Cloud Bucket',
      '24/7 Dedicated Database Consultant Support'
    ]
  }
];

// Initial mock files to provide a rich, realistic cloud storage state
const DEFAULT_FILES: StorageFile[] = [
  {
    id: 'file-img-1',
    name: 'rajshahi_himsagar_mango_hd.jpg',
    url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    sizeBytes: 3.4 * 1024 * 1024,
    formattedSize: '3.40 MB',
    category: 'image',
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-15 11:20 AM',
    associatedWith: 'Product: Rajshahi Himsagar Mango',
    sellerId: 'sel-1'
  },
  {
    id: 'file-img-2',
    name: 'smart_watch_ultra_pro_titanium.webp',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    sizeBytes: 2.1 * 1024 * 1024,
    formattedSize: '2.10 MB',
    category: 'image',
    mimeType: 'image/webp',
    uploadedAt: '2026-08-16 02:45 PM',
    associatedWith: 'Product: Ultra Smart Watch',
    sellerId: 'sel-1'
  },
  {
    id: 'file-img-3',
    name: 'dhaka_tech_store_banner_4k.jpg',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    sizeBytes: 5.8 * 1024 * 1024,
    formattedSize: '5.80 MB',
    category: 'image',
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-10 09:12 AM',
    associatedWith: 'Store Banner: Dhaka Tech Store',
    sellerId: 'sel-1'
  },
  {
    id: 'file-pdf-1',
    name: 'trade_license_gov_bd_2026.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sizeBytes: 1.85 * 1024 * 1024,
    formattedSize: '1.85 MB',
    category: 'pdf',
    mimeType: 'application/pdf',
    uploadedAt: '2026-08-01 04:30 PM',
    associatedWith: 'Legal: Trade License (ঢাকা উত্তর সিটি)',
    sellerId: 'sel-1'
  },
  {
    id: 'file-pdf-2',
    name: 'tax_return_certificate_etin.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sizeBytes: 2.4 * 1024 * 1024,
    formattedSize: '2.40 MB',
    category: 'pdf',
    mimeType: 'application/pdf',
    uploadedAt: '2026-08-05 01:10 PM',
    associatedWith: 'Legal: e-TIN / Tax Certificate',
    sellerId: 'sel-1'
  },
  {
    id: 'file-pdf-3',
    name: 'order_memo_inv_98412.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sizeBytes: 680 * 1024,
    formattedSize: '680 KB',
    category: 'pdf',
    mimeType: 'application/pdf',
    uploadedAt: '2026-08-18 06:14 PM',
    associatedWith: 'Invoice: Order #ORD-83921',
    sellerId: 'sel-1'
  },
  {
    id: 'file-audio-1',
    name: 'customer_voice_order_memo.mp3',
    url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg',
    sizeBytes: 1.4 * 1024 * 1024,
    formattedSize: '1.40 MB',
    category: 'audio',
    mimeType: 'audio/mpeg',
    uploadedAt: '2026-08-17 08:22 PM',
    associatedWith: 'Customer Chat: Voice Note (Karim)',
    sellerId: 'sel-1'
  },
  {
    id: 'file-data-1',
    name: 'firestore_products_collection_sync.json',
    url: '#',
    sizeBytes: 420 * 1024,
    formattedSize: '420 KB',
    category: 'data',
    mimeType: 'application/json',
    uploadedAt: '2026-08-18 10:00 AM',
    associatedWith: 'Firebase: Firestore Live Products Catalog',
    sellerId: 'sel-1'
  }
];

export const storageManager = {
  getFiles(sellerId?: string): StorageFile[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (sellerId) {
            return parsed.filter((f: StorageFile) => !f.sellerId || f.sellerId === sellerId);
          }
          return parsed;
        }
      }
    } catch (e) {}

    // First time setup
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FILES));
    } catch (e) {}
    return DEFAULT_FILES;
  },

  saveFiles(files: StorageFile[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch (e) {}
  },

  addFile(file: Omit<StorageFile, 'id' | 'uploadedAt' | 'formattedSize'>): StorageFile {
    const files = this.getFiles();
    const newFile: StorageFile = {
      ...file,
      id: `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      uploadedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      formattedSize: formatBytes(file.sizeBytes)
    };
    const updated = [newFile, ...files];
    this.saveFiles(updated);
    return newFile;
  },

  deleteFile(id: string): StorageFile[] {
    const files = this.getFiles();
    const updated = files.filter(f => f.id !== id);
    this.saveFiles(updated);
    return updated;
  },

  // Save purchased or upgraded Firebase storage plan for a store
  savePurchasedPlan(sellerId: string, planId: string, customGb?: number, txnId?: string): { success: boolean; totalGb: number; plan: FirebaseStoragePlan | null } {
    try {
      let limitGb = 5;
      let matchedPlan = FIREBASE_STORAGE_PLANS.find(p => p.id === planId) || null;
      if (matchedPlan) {
        limitGb = matchedPlan.totalGb;
      } else if (customGb && customGb > 0) {
        limitGb = customGb;
      }

      const storedMap = this.getAllPurchasedPlans();
      storedMap[sellerId] = {
        sellerId,
        planId,
        customGb: customGb || limitGb,
        totalGb: limitGb,
        purchasedAt: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        txnId: txnId || `TXN-FBS-${Date.now()}`,
        status: 'active'
      };

      localStorage.setItem(PURCHASED_STORAGE_KEY, JSON.stringify(storedMap));

      // Also trigger a storage event so all components react immediately
      window.dispatchEvent(new CustomEvent('amarbazar_storage_quota_updated', {
        detail: { sellerId, totalGb: limitGb, planId }
      }));

      return { success: true, totalGb: limitGb, plan: matchedPlan };
    } catch (e) {
      console.error('Error saving purchased plan:', e);
      return { success: false, totalGb: 5, plan: null };
    }
  },

  getAllPurchasedPlans(): Record<string, any> {
    try {
      const data = localStorage.getItem(PURCHASED_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {};
  },

  getPurchasedPlan(sellerId?: string): { totalGb: number; planId: string; expiryDate?: string; status?: string } | null {
    if (!sellerId) return null;
    const all = this.getAllPurchasedPlans();
    return all[sellerId] || null;
  },

  getEffectiveStorageLimit(sellerId?: string, storePlan?: string, storeCustomLimit?: number): number {
    // 1. Check if an explicit purchased storage record exists
    if (sellerId) {
      const purchased = this.getPurchasedPlan(sellerId);
      if (purchased && purchased.totalGb > 0) {
        return purchased.totalGb;
      }
    }

    // 2. Check store's custom cloudStorageLimitGb
    if (storeCustomLimit && storeCustomLimit > 0) {
      return storeCustomLimit;
    }

    // 3. Check store's cloudSubscriptionPlan
    if (storePlan === 'firebase_subscription' || storePlan === 'gcs_subscription') {
      return 15;
    } else if (storePlan && storePlan !== 'none') {
      return 15;
    }

    // 4. Default Firebase Free Spark Tier limit (5 GB)
    return 5;
  },

  // Calculate live database memory size (Firestore collections: Products, Orders, Categories, Users, Messages)
  estimateFirestoreDatabaseSize(sellerId?: string): {
    totalBytes: number;
    formattedSize: string;
    collections: {
      name: string;
      nameBn: string;
      count: number;
      sizeBytes: number;
      formattedSize: string;
    }[];
  } {
    let productsBytes = 0;
    let productsCount = 0;
    let ordersBytes = 0;
    let ordersCount = 0;
    let categoriesBytes = 0;
    let categoriesCount = 0;
    let messagesBytes = 0;
    let messagesCount = 0;

    try {
      // 1. Products in localStorage/store
      const storedProds = localStorage.getItem('amarbazar_products_store');
      if (storedProds) {
        const prods = JSON.parse(storedProds);
        if (Array.isArray(prods)) {
          const sellerProds = sellerId ? prods.filter((p: any) => p.sellerId === sellerId) : prods;
          productsCount = sellerProds.length;
          // Each product JSON string size + 500 bytes Firestore indexing overhead
          productsBytes = new Blob([JSON.stringify(sellerProds)]).size + (productsCount * 512);
        }
      }
    } catch (e) {}

    // Fallback baseline for products if not in localStorage yet
    if (productsBytes === 0) {
      productsCount = 12;
      productsBytes = 480 * 1024; // ~480 KB
    }

    try {
      // 2. Orders
      const storedOrders = localStorage.getItem('amarbazar_orders_store');
      if (storedOrders) {
        const ords = JSON.parse(storedOrders);
        if (Array.isArray(ords)) {
          const sellerOrds = sellerId ? ords.filter((o: any) => o.sellerId === sellerId) : ords;
          ordersCount = sellerOrds.length;
          ordersBytes = new Blob([JSON.stringify(sellerOrds)]).size + (ordersCount * 256);
        }
      }
    } catch (e) {}

    if (ordersBytes === 0) {
      ordersCount = 8;
      ordersBytes = 160 * 1024; // ~160 KB
    }

    try {
      // 3. Categories
      const storedCats = localStorage.getItem('amarbazar_categories_store');
      if (storedCats) {
        const cats = JSON.parse(storedCats);
        if (Array.isArray(cats)) {
          categoriesCount = cats.length;
          categoriesBytes = new Blob([JSON.stringify(cats)]).size + 1024;
        }
      }
    } catch (e) {}

    if (categoriesBytes === 0) {
      categoriesCount = 10;
      categoriesBytes = 45 * 1024; // ~45 KB
    }

    // 4. Chat & Messages & Activity Logs
    messagesCount = 24;
    messagesBytes = 95 * 1024; // ~95 KB

    const totalBytes = productsBytes + ordersBytes + categoriesBytes + messagesBytes;

    return {
      totalBytes,
      formattedSize: formatBytes(totalBytes),
      collections: [
        {
          name: 'products',
          nameBn: 'পণ্য ক্যাটালগ (Products)',
          count: productsCount,
          sizeBytes: productsBytes,
          formattedSize: formatBytes(productsBytes)
        },
        {
          name: 'orders',
          nameBn: 'অর্ডার রেকর্ডস (Orders)',
          count: ordersCount,
          sizeBytes: ordersBytes,
          formattedSize: formatBytes(ordersBytes)
        },
        {
          name: 'categories',
          nameBn: 'ক্যাটাগরি ও ট্যাগস (Categories)',
          count: categoriesCount,
          sizeBytes: categoriesBytes,
          formattedSize: formatBytes(categoriesBytes)
        },
        {
          name: 'messages',
          nameBn: 'চ্যাট ও হিস্টোরি (Chat & Logs)',
          count: messagesCount,
          sizeBytes: messagesBytes,
          formattedSize: formatBytes(messagesBytes)
        }
      ]
    };
  },

  calculateStats(files: StorageFile[], totalGb: number = 5, sellerId?: string) {
    const totalBytes = totalGb * 1024 * 1024 * 1024;
    const filesBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    
    // Calculate live Firestore Database footprint
    const firestoreDb = this.estimateFirestoreDatabaseSize(sellerId);
    const usedBytes = filesBytes + firestoreDb.totalBytes;
    const freeBytes = Math.max(0, totalBytes - usedBytes);

    const usedMb = usedBytes / (1024 * 1024);
    const totalMb = totalBytes / (1024 * 1024);
    const freeMb = freeBytes / (1024 * 1024);

    const usedGb = usedBytes / (1024 * 1024 * 1024);
    const freeGb = freeBytes / (1024 * 1024 * 1024);

    const percentage = totalBytes > 0 ? parseFloat(((usedBytes / totalBytes) * 100).toFixed(2)) : 0;

    const breakdown: Record<string, { sizeBytes: number; formattedSize: string; count: number }> = {
      firestore: { sizeBytes: firestoreDb.totalBytes, formattedSize: firestoreDb.formattedSize, count: firestoreDb.collections.length },
      image: { sizeBytes: 0, formattedSize: '0 MB', count: 0 },
      pdf: { sizeBytes: 0, formattedSize: '0 MB', count: 0 },
      audio: { sizeBytes: 0, formattedSize: '0 MB', count: 0 },
      document: { sizeBytes: 0, formattedSize: '0 MB', count: 0 },
      data: { sizeBytes: 0, formattedSize: '0 MB', count: 0 },
    };

    files.forEach(f => {
      const cat = f.category || 'data';
      if (!breakdown[cat]) {
        breakdown[cat] = { sizeBytes: 0, formattedSize: '0 MB', count: 0 };
      }
      breakdown[cat].sizeBytes += f.sizeBytes || 0;
      breakdown[cat].count += 1;
    });

    Object.keys(breakdown).forEach(k => {
      breakdown[k].formattedSize = formatBytes(breakdown[k].sizeBytes);
    });

    return {
      usedBytes,
      freeBytes,
      totalBytes,
      usedMb: parseFloat(usedMb.toFixed(2)),
      freeMb: parseFloat(freeMb.toFixed(2)),
      totalMb: parseFloat(totalMb.toFixed(2)),
      usedGb: parseFloat(usedGb.toFixed(3)),
      freeGb: parseFloat(freeGb.toFixed(2)),
      totalGb,
      formattedUsed: formatBytes(usedBytes),
      formattedFree: formatBytes(freeBytes),
      formattedTotal: `${totalGb} GB`,
      percentage: Math.max(0.1, percentage),
      count: files.length,
      breakdown,
      firestoreDb
    };
  }
};
