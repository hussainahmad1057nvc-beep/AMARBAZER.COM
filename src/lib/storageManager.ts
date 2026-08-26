import { StorageFile, Product, SellerStore } from '../types';
import { safeStorage } from './safeStorage';

const STORAGE_KEY = 'amarbazar_custom_storage_files';
const PURCHASED_STORAGE_KEY = 'amarbazar_purchased_storage_plans';

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${val} ${sizes[i] || 'B'}`;
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
    totalGb: 1,
    firestoreDbGb: 1,
    storageGb: 5,
    priceBdt: 0,
    billingCycle: 'লাইফটাইম ফ্রি',
    badgeBn: 'ফ্রি প্ল্যান',
    badgeEn: 'Free Plan',
    descriptionBn: 'নতুন বিক্রেতা ও প্রাথমিক পণ্য ক্যাটালগের জন্য বিনামূল্যে ১ জিবি লাইভ ডাটাবেজ স্টোরেজ।',
    descriptionEn: 'Default free 1 GB cloud database storage for new stores and initial product catalogs.',
    featuresBn: [
      '১ জিবি ফায়ারস্টোর নো-এসকিউএল ডাটাবেজ স্পেস',
      '৫ জিবি ক্লাউড ফাইল ও মিডিয়া বাকেট',
      'রিয়েলটাইম স্ন্যাপশট লাইভ সিঙ্ক',
      'অটো ব্যাকআপ ও সিকিউর এনক্রিপশন'
    ],
    featuresEn: [
      '1 GB Firestore NoSQL Live Database',
      '5 GB Firebase Cloud File & Media Storage',
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

export const storageManager = {
  // Extract genuine live files dynamically from actual store products, banners, and manual uploads
  getFiles(sellerId?: string): StorageFile[] {
    const filesMap = new Map<string, StorageFile>();

    // 1. Read manual uploads from safeStorage
    try {
      const saved = safeStorage.getJSON<StorageFile[]>(STORAGE_KEY, []);
      if (Array.isArray(saved)) {
        saved.forEach(f => {
          if (!sellerId || !f.sellerId || f.sellerId === sellerId) {
            filesMap.set(f.id, f);
          }
        });
      }
    } catch (e) {}

    // 2. Read real products from store and extract actual real product media assets
    try {
      const storedProds = safeStorage.getJSON<Product[]>('amarbazar_products_store', []);
      const deletedIds = new Set(safeStorage.getJSON<string[]>('amarbazar_deleted_product_ids', []));

      if (Array.isArray(storedProds)) {
        storedProds
          .filter(p => !deletedIds.has(p.id))
          .filter(p => !sellerId || p.sellerId === sellerId)
          .forEach(p => {
            const prodImages: string[] = Array.isArray(p.images) ? p.images : (p as any).image ? [(p as any).image] : [];
            const prodTitle = p.title || (p as any).name || p.titleBn || 'product';

            prodImages.forEach((imgUrl, idx) => {
              if (imgUrl && typeof imgUrl === 'string' && imgUrl.length > 5) {
                const isBase64 = imgUrl.startsWith('data:');
                const calculatedSize = isBase64 ? Math.round(imgUrl.length * 0.75) : (idx === 0 ? 320 * 1024 : 260 * 1024);
                const fileId = `media-prod-${p.id}-${idx}`;
                if (!filesMap.has(fileId)) {
                  filesMap.set(fileId, {
                    id: fileId,
                    name: `${prodTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 22)}_${idx === 0 ? 'main' : `gallery_${idx}`}.jpg`,
                    url: imgUrl,
                    sizeBytes: calculatedSize,
                    formattedSize: formatBytes(calculatedSize),
                    category: 'image',
                    mimeType: 'image/jpeg',
                    uploadedAt: p.createdAt || '2026-08-20 10:00 AM',
                    associatedWith: `Product: ${prodTitle}`,
                    sellerId: p.sellerId
                  });
                }
              }
            });
          });
      }
    } catch (e) {}

    // 3. Read real store branding assets (Banner & Logo)
    try {
      const storedSellers = safeStorage.getJSON<SellerStore[]>('amarbazar_sellers_store', []);
      if (Array.isArray(storedSellers)) {
        const targetSeller = sellerId 
          ? storedSellers.find(s => s.id === sellerId || s.sellerId === sellerId)
          : storedSellers[0];

        if (targetSeller) {
          if (targetSeller.bannerUrl && targetSeller.bannerUrl.length > 5) {
            const isBase64 = targetSeller.bannerUrl.startsWith('data:');
            const size = isBase64 ? Math.round(targetSeller.bannerUrl.length * 0.75) : 480 * 1024;
            const fileId = `media-banner-${targetSeller.id}`;
            if (!filesMap.has(fileId)) {
              filesMap.set(fileId, {
                id: fileId,
                name: `store_banner_${targetSeller.id}.jpg`,
                url: targetSeller.bannerUrl,
                sizeBytes: size,
                formattedSize: formatBytes(size),
                category: 'image',
                mimeType: 'image/jpeg',
                uploadedAt: targetSeller.createdAt || '2026-08-01 12:00 PM',
                associatedWith: `Store Banner: ${targetSeller.storeName || targetSeller.name}`,
                sellerId: targetSeller.id
              });
            }
          }

          if (targetSeller.logoUrl && targetSeller.logoUrl.length > 5) {
            const isBase64 = targetSeller.logoUrl.startsWith('data:');
            const size = isBase64 ? Math.round(targetSeller.logoUrl.length * 0.75) : 150 * 1024;
            const fileId = `media-logo-${targetSeller.id}`;
            if (!filesMap.has(fileId)) {
              filesMap.set(fileId, {
                id: fileId,
                name: `store_logo_${targetSeller.id}.jpg`,
                url: targetSeller.logoUrl,
                sizeBytes: size,
                formattedSize: formatBytes(size),
                category: 'image',
                mimeType: 'image/jpeg',
                uploadedAt: targetSeller.createdAt || '2026-08-01 12:00 PM',
                associatedWith: `Store Logo: ${targetSeller.storeName || targetSeller.name}`,
                sellerId: targetSeller.id
              });
            }
          }
        }
      }
    } catch (e) {}

    return Array.from(filesMap.values());
  },

  saveFiles(files: StorageFile[]) {
    try {
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch (e) {}
  },

  addFile(file: Omit<StorageFile, 'id' | 'uploadedAt' | 'formattedSize'>): StorageFile {
    const currentManualFiles = safeStorage.getJSON<StorageFile[]>(STORAGE_KEY, []);
    const newFile: StorageFile = {
      ...file,
      id: `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      uploadedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      formattedSize: formatBytes(file.sizeBytes)
    };
    const updated = [newFile, ...currentManualFiles];
    this.saveFiles(updated);
    return newFile;
  },

  deleteFile(id: string): StorageFile[] {
    const currentManualFiles = safeStorage.getJSON<StorageFile[]>(STORAGE_KEY, []);
    const updated = currentManualFiles.filter(f => f.id !== id);
    this.saveFiles(updated);
    return this.getFiles();
  },

  // Save purchased or upgraded Firebase storage plan for a store
  savePurchasedPlan(sellerId: string, planId: string, customGb?: number, txnId?: string): { success: boolean; totalGb: number; plan: FirebaseStoragePlan | null } {
    try {
      let limitGb = 1;
      const matchedPlan = FIREBASE_STORAGE_PLANS.find(p => p.id === planId) || null;
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

      safeStorage.setItem(PURCHASED_STORAGE_KEY, JSON.stringify(storedMap));

      // Trigger a live storage update event across the app
      window.dispatchEvent(new CustomEvent('amarbazar_storage_quota_updated', {
        detail: { sellerId, totalGb: limitGb, planId }
      }));

      return { success: true, totalGb: limitGb, plan: matchedPlan };
    } catch (e) {
      console.error('Error saving purchased plan:', e);
      return { success: false, totalGb: 1, plan: null };
    }
  },

  getAllPurchasedPlans(): Record<string, any> {
    try {
      return safeStorage.getJSON<Record<string, any>>(PURCHASED_STORAGE_KEY, {});
    } catch (e) {
      return {};
    }
  },

  getPurchasedPlan(sellerId?: string): { totalGb: number; planId: string; expiryDate?: string; status?: string } | null {
    if (!sellerId) return null;
    const all = this.getAllPurchasedPlans();
    return all[sellerId] || null;
  },

  // Determine the real, accurate storage limit based on the connected database and active subscription
  getEffectiveStorageLimit(sellerId?: string, storePlan?: string, storeCustomLimit?: number, storageType?: string): number {
    // 1. Check if an explicit purchased storage plan exists
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

    // 3. Check store's cloud subscription plan
    if (storePlan === 'firebase_subscription' || storePlan === 'gcs_subscription') {
      return 15;
    } else if (storePlan && storePlan !== 'none') {
      return 15;
    }

    // 4. If connected to custom third-party database (Supabase, MongoDB, Neon, MySQL, etc.)
    if (storageType && storageType !== 'central' && storageType !== 'firebase') {
      if (storageType === 'supabase') return 1; // 1 GB Supabase free tier
      if (storageType === 'mongodb') return 0.512; // 512 MB Atlas free M0
      if (storageType === 'neon') return 0.5; // 500 MB
      if (storageType === 'mysql') return 1;
    }

    // 5. Default Firebase Free Spark Tier (1 GB Firestore Database / 5 GB Storage)
    return 1;
  },

  // Calculate live database memory size (Firestore collections: Products, Orders, Categories, Store Config, Settings)
  estimateFirestoreDatabaseSize(sellerId?: string, storageType?: string): {
    totalBytes: number;
    formattedSize: string;
    databaseName: string;
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
    let storeConfigBytes = 0;
    let settingsBytes = 0;

    // 1. Products in real storage
    try {
      const storedProds = safeStorage.getJSON<Product[]>('amarbazar_products_store', []);
      const deletedIds = new Set(safeStorage.getJSON<string[]>('amarbazar_deleted_product_ids', []));
      if (Array.isArray(storedProds)) {
        const activeProds = storedProds
          .filter(p => !deletedIds.has(p.id))
          .filter(p => !sellerId || p.sellerId === sellerId);
        productsCount = activeProds.length;
        productsBytes = new Blob([JSON.stringify(activeProds)]).size;
      }
    } catch (e) {}

    // 2. Orders in real storage
    try {
      const storedOrders = safeStorage.getJSON<any[]>('amarbazar_orders_store', []);
      if (Array.isArray(storedOrders)) {
        const activeOrders = storedOrders.filter(o => !sellerId || o.sellerId === sellerId);
        ordersCount = activeOrders.length;
        ordersBytes = new Blob([JSON.stringify(activeOrders)]).size;
      }
    } catch (e) {}

    // 3. Categories in real storage
    try {
      const storedCats = safeStorage.getJSON<any[]>('amarbazar_categories_store', []);
      if (Array.isArray(storedCats)) {
        categoriesCount = storedCats.length;
        categoriesBytes = new Blob([JSON.stringify(storedCats)]).size;
      }
    } catch (e) {}

    // 4. Store Config & Settings
    try {
      const storedSellers = safeStorage.getJSON<SellerStore[]>('amarbazar_sellers_store', []);
      const matchedSeller = sellerId 
        ? storedSellers.find(s => s.id === sellerId || s.sellerId === sellerId)
        : storedSellers[0];
      if (matchedSeller) {
        storeConfigBytes = new Blob([JSON.stringify(matchedSeller)]).size;
      }
      const settings = safeStorage.getJSON<any>('amarbazar_system_settings_store', {});
      settingsBytes = new Blob([JSON.stringify(settings)]).size;
    } catch (e) {}

    const totalDbRecordsBytes = productsBytes + ordersBytes + categoriesBytes + storeConfigBytes + settingsBytes;

    let dbName = 'Firebase Firestore';
    if (storageType && storageType !== 'central' && storageType !== 'firebase') {
      if (storageType === 'supabase') dbName = 'Supabase PostgreSQL';
      else if (storageType === 'mongodb') dbName = 'MongoDB Atlas';
      else if (storageType === 'neon') dbName = 'Neon PostgreSQL';
      else if (storageType === 'mysql') dbName = 'MySQL Database';
      else if (storageType === 'google_cloud') dbName = 'Google Cloud Firestore';
      else dbName = `${storageType.toUpperCase()} Database`;
    }

    return {
      totalBytes: totalDbRecordsBytes,
      formattedSize: formatBytes(totalDbRecordsBytes),
      databaseName: dbName,
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
          name: 'store_profile',
          nameBn: 'স্টোর ও কনফিগ (Store Profile)',
          count: 1,
          sizeBytes: storeConfigBytes + settingsBytes,
          formattedSize: formatBytes(storeConfigBytes + settingsBytes)
        }
      ]
    };
  },

  calculateStats(files: StorageFile[], totalGb: number = 1, sellerId?: string, storageType?: string) {
    const totalBytes = totalGb * 1024 * 1024 * 1024;
    const filesBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    
    // Calculate live connected Database footprint
    const firestoreDb = this.estimateFirestoreDatabaseSize(sellerId, storageType);
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
      image: { sizeBytes: 0, formattedSize: '0 B', count: 0 },
      pdf: { sizeBytes: 0, formattedSize: '0 B', count: 0 },
      audio: { sizeBytes: 0, formattedSize: '0 B', count: 0 },
      document: { sizeBytes: 0, formattedSize: '0 B', count: 0 },
      data: { sizeBytes: 0, formattedSize: '0 B', count: 0 },
    };

    files.forEach(f => {
      const cat = f.category || 'data';
      if (!breakdown[cat]) {
        breakdown[cat] = { sizeBytes: 0, formattedSize: '0 B', count: 0 };
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
      formattedTotal: totalGb < 1 ? `${Math.round(totalGb * 1024)} MB` : `${totalGb} GB`,
      percentage: Math.max(0.05, percentage),
      count: files.length,
      breakdown,
      firestoreDb
    };
  }
};
