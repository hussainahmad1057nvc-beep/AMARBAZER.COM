import { Category } from '../types';

export interface SubSubCategory {
  id: string;
  name: string;
  nameBn: string;
  nameAr?: string;
  count?: number;
}

export interface SubCategory {
  id: string;
  name: string;
  nameBn: string;
  nameAr?: string;
  emoji?: string;
  subcategories?: SubSubCategory[];
  subCategories?: SubSubCategory[];
  subSubCategories?: SubSubCategory[];
}

export interface MainCategory {
  id: string;
  name: string;
  nameBn: string;
  nameAr?: string;
  icon: string;
  emoji?: string;
  image: string;
  productCount?: number;
  subcategories: SubCategory[];
  subCategories: SubCategory[];
}

export const CATEGORY_EMOJIS: Record<string, string> = {
  'cat-1': '📱',
  'cat-2': '👕',
  'cat-3': '👗',
  'cat-4': '📦',
  'cat-5': '👟',
  'cat-6': '⌚',
  'cat-7': '💄',
  'cat-8': '🍼',
  'cat-9': '🧸',
  'cat-10': '⚽',
  'cat-11': '💊',
  'cat-12': '📚',
  'cat-spices': '🌶️',
  'cat-gur': '🌴',
  'cat-honey': '🍯',
  'cat-flour': '🥣',
  'cat-chola': '🧆',
  'cat-daal': '🍲',
  'cat-oil-ghee': '🧈',
  'cat-rice': '🌾',
  'cat-tea-coffee': '☕',
  'cat-dry-fruits': '🥜',
  'cat-dairy-milk': '🥛',
  'cat-snacks': '🍪',
  'cat-beverages': '🥤',
  'cat-fruits': '🍎',
  'cat-vegetables': '🥦',
  'cat-fish-meat': '🥩',
  'cat-cleaning': '🧼',
  'cat-kitchen': '🍳',
  'cat-fast-food': '🍔',
  'cat-pizza-pasta': '🍕',
  'cat-bakery': '🥐',
  'cat-frozen': '🧊',
  'cat-combo': '🎁',
  'cat-pet-care': '🐱',
  'cat-gardening': '🪴',
  'cat-automotive': '🚗'
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Electronics',
    nameBn: 'ইলেকট্রনিক্স',
    nameAr: 'إلكترونيات وأجهزة ذكية',
    icon: 'Smartphone',
    emoji: '📱',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-11', name: 'Smartphones & Mobile', nameBn: 'স্মার্টফোন ও মোবাইল', nameAr: 'هواتف ذكية وجوالات' },
      { id: 'sub-12', name: 'Laptops & Computers', nameBn: 'ল্যাপটপ ও কম্পিউটার', nameAr: 'حواسيب محمولة وأجهزة كمبيوتر' },
      { id: 'sub-13', name: 'Audio & Headphones', nameBn: 'হেডফোন ও অডিও', nameAr: 'سماعات وأجهزة صوت' },
      { id: 'sub-14', name: 'Smart Home & TV', nameBn: 'স্মার্ট টিভি ও হোম', nameAr: 'تلفزيونات وأجهزة منزلية ذكية' }
    ],
    productCount: 11
  },
  {
    id: 'cat-2',
    name: 'Clothing',
    nameBn: 'পোশাক',
    nameAr: 'أزياء وملابس',
    icon: 'Shirt',
    emoji: '👕',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-21', name: 'Men\'s Panjabi & Kurta', nameBn: 'পুরুষের পাঞ্জাবি ও কুর্তা', nameAr: 'بنجابي وكورتا للرجال' },
      { id: 'sub-22', name: 'Casual T-Shirts & Polos', nameBn: 'টি-শার্ট ও পোলো শার্ট', nameAr: 'تي شيرت وبولو' },
      { id: 'sub-23', name: 'Formal Shirts & Pants', nameBn: 'ফর্মাল শার্ট ও প্যান্ট', nameAr: 'قمصان وسراويل رسمية' },
      { id: 'sub-24', name: 'Jackets & Hoodies', nameBn: 'জ্যাকেট ও হুডি', nameAr: 'سترات وهوديز' }
    ],
    productCount: 7
  },
  {
    id: 'cat-3',
    name: 'Saree & Ethnic',
    nameBn: 'শাড়ি ও এথনিক',
    nameAr: 'ساري وملابس تقليدية',
    icon: 'Shirt',
    emoji: '👗',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-31', name: 'Dhakai Jamdani Sarees', nameBn: 'ঢাকাই জামদানি শাড়ি' },
      { id: 'sub-32', name: 'Rajshahi Pure Silk', nameBn: 'রাজশাহী সিল্ক শাড়ি' },
      { id: 'sub-33', name: 'Tangail Handloom Sarees', nameBn: 'টাঙ্গাইল তাঁতের শাড়ি' },
      { id: 'sub-34', name: 'Salwar Kameez & Kurtis', nameBn: 'সালওয়ার কামিজ ও কুর্তি' }
    ],
    productCount: 7
  },
  {
    id: 'cat-spices',
    name: 'Spices & Masala',
    nameBn: 'মসলাপাতি ও গুঁড়া',
    nameAr: 'بهارات وتوابل',
    icon: 'Package',
    emoji: '🌶️',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-sp-1', name: 'Turmeric & Chili Powder', nameBn: 'হলুদ ও মরিচ গুঁড়া' },
      { id: 'sub-sp-2', name: 'Coriander & Cumin', nameBn: 'জিরা ও ধনিয়া গুঁড়া' },
      { id: 'sub-sp-3', name: 'Whole Garam Masala', nameBn: 'এলাচ, দারুচিনি ও গরম মসলা' },
      { id: 'sub-sp-4', name: 'Biryani & Meat Masala', nameBn: 'বিরিয়ানি ও মাংসের স্পেশাল মসলা' }
    ],
    productCount: 8
  },
  {
    id: 'cat-honey',
    name: 'Pure Organic Honey',
    nameBn: 'খাঁটি মধু',
    nameAr: 'عسل طبيعي نقي',
    icon: 'Package',
    emoji: '🍯',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-hn-1', name: 'Sundarbans Natural Honey', nameBn: 'সুন্দরবনের খলিসা ও পদ্ম মধু' },
      { id: 'sub-hn-2', name: 'Mustard Flower Honey', nameBn: 'সরিষা ফুলের খাঁটি মধু' },
      { id: 'sub-hn-3', name: 'Black Seed Honey', nameBn: 'কালোজিরা ফুলের মধু' },
      { id: 'sub-hn-4', name: 'Comb Honey', nameBn: 'চাকসহ কাঁচা মধু' }
    ],
    productCount: 5
  },
  {
    id: 'cat-gur',
    name: 'Jaggery & Natural Sugar',
    nameBn: 'খেজুরের গুড় ও চিনি',
    nameAr: 'دبس وسكر طبيعي',
    icon: 'Package',
    emoji: '🌴',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-gur-1', name: 'Jessore Patali Gur', nameBn: 'যশোরের খাঁটি পাটালি গুড়' },
      { id: 'sub-gur-2', name: 'Nolen Jhol Gur', nameBn: 'নলেন ঝোলা গুড়' },
      { id: 'sub-gur-3', name: 'Sugarcane Organic Gur', nameBn: 'আখের দেশি লাল গুড়' },
      { id: 'sub-gur-4', name: 'Brown Sugar', nameBn: 'অপরিশোধিত লাল চিনি' }
    ],
    productCount: 4
  },
  {
    id: 'cat-flour',
    name: 'Flour, Atta & Suji',
    nameBn: 'আটা, ময়দা ও সুজি',
    nameAr: 'طحين ودقيق وسميد',
    icon: 'Package',
    emoji: '🥣',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-fl-1', name: 'Whole Wheat Red Atta', nameBn: 'খাঁটি লাল গমের আটা' },
      { id: 'sub-fl-2', name: 'Special White Maida', nameBn: 'স্পেশাল সাদা ময়দা' },
      { id: 'sub-fl-3', name: 'Fine Grain Suji', nameBn: 'মিহি সুজি' },
      { id: 'sub-fl-4', name: 'Besan & Gram Flour', nameBn: 'খাঁটি ছোলার বেসন' }
    ],
    productCount: 6
  },
  {
    id: 'cat-chola',
    name: 'Chickpeas & Chola',
    nameBn: 'ছোলা, বুট ও মটর',
    nameAr: 'حمص وبقوليات',
    icon: 'Package',
    emoji: '🧆',
    image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-ch-1', name: 'Deshi Brown Chickpeas', nameBn: 'দেশি লাল ছোলা' },
      { id: 'sub-ch-2', name: 'Kabuli Chana (White)', nameBn: 'বড় সাদা কাবলি বুট' },
      { id: 'sub-ch-3', name: 'Dabli & Green Peas', nameBn: 'চটপটির ডাবলি ও মটর' },
      { id: 'sub-ch-4', name: 'Roasted Salted Chola', nameBn: 'ভাজা মুচমুচে ছোলা' }
    ],
    productCount: 4
  },
  {
    id: 'cat-daal',
    name: 'Lentils & Pulses (Daal)',
    nameBn: 'ডাল ও ডালজাতীয় শস্য',
    nameAr: 'عدس وبقوليات مجففة',
    icon: 'Package',
    emoji: '🍲',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-dl-1', name: 'Red Masoor Dal', nameBn: 'দেশি লাল মসুর ডাল' },
      { id: 'sub-dl-2', name: 'Moong Dal (Yellow)', nameBn: 'ভাজা সোনালী মুগ ডাল' },
      { id: 'sub-dl-3', name: 'Chana Dal (Booter Dal)', nameBn: 'ছোলার ডাল / বুটের ডাল' },
      { id: 'sub-dl-4', name: 'Khesari & Arhar Dal', nameBn: 'খেসারি ও অড়হর ডাল' }
    ],
    productCount: 6
  },
  {
    id: 'cat-oil-ghee',
    name: 'Mustard Oil & Pure Ghee',
    nameBn: 'তেল ও খাঁটি গাওয়া ঘি',
    nameAr: 'زيوت وسمن بلدي',
    icon: 'Package',
    emoji: '🧈',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-og-1', name: 'Cold-Pressed Mustard Oil', nameBn: 'কাঠের ঘানির সরিষার তেল' },
      { id: 'sub-og-2', name: 'Pure Bilona Cow Ghee', nameBn: 'খাঁটি দেশি গাওয়া ঘি' },
      { id: 'sub-og-3', name: 'Refined Soybean Oil', nameBn: 'পরিশোধিত সয়াবিন তেল' },
      { id: 'sub-og-4', name: 'Extra Virgin Olive Oil', nameBn: 'অলিভ অয়েল' }
    ],
    productCount: 6
  },
  {
    id: 'cat-rice',
    name: 'Aromatic Rice & Grains',
    nameBn: 'চাল ও সুগন্ধি পোলাও',
    nameAr: 'أرز فاخر وحبوب',
    icon: 'Package',
    emoji: '🌾',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-rc-1', name: 'Chinigura Polao Rice', nameBn: 'দিনাজপুরের চিনিগুঁড়া চাল' },
      { id: 'sub-rc-2', name: 'Miniket Premium Rice', nameBn: 'প্রিমিয়াম মিনিকেট চাল' },
      { id: 'sub-rc-3', name: 'Nazirshail Rice', nameBn: 'চিকন নাজিরশাইল চাল' },
      { id: 'sub-rc-4', name: 'Kalijira Aromatic Rice', nameBn: 'কালোজিরা সুবাসিত চাল' }
    ],
    productCount: 5
  },
  {
    id: 'cat-tea-coffee',
    name: 'Tea & Coffee',
    nameBn: 'চা ও কফি',
    nameAr: 'شاي وقهوة',
    icon: 'Coffee',
    emoji: '☕',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-tc-1', name: 'Sreemangal Black Tea', nameBn: 'শ্রীমঙ্গলের প্রিমিয়াম ব্ল্যাক টি' },
      { id: 'sub-tc-2', name: 'Green Tea & Herbal', nameBn: 'গ্রিন টি ও হারবাল চা' },
      { id: 'sub-tc-3', name: 'Instant Coffee & Beans', nameBn: 'ইনস্ট্যান্ট কফি ও বিচি' },
      { id: 'sub-tc-4', name: 'Masala Tea Packs', nameBn: 'মসলা চা ব্যাগ' }
    ],
    productCount: 4
  },
  {
    id: 'cat-dry-fruits',
    name: 'Dry Fruits, Nuts & Dates',
    nameBn: 'খেজুর ও কাজুবাদাম',
    nameAr: 'تمور ومكسرات',
    icon: 'Package',
    emoji: '🥜',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-df-1', name: 'Medina Ajwa & Maryam Dates', nameBn: 'মদিনার আজওয়া ও মরিয়ম খেজুর' },
      { id: 'sub-df-2', name: 'Cashews & Almonds', nameBn: 'কাজুবাদাম ও কাঠবাদাম' },
      { id: 'sub-df-3', name: 'Pistachio & Walnut', nameBn: 'পেস্তাবাদাম ও আখরোট' },
      { id: 'sub-df-4', name: 'Raisins & Apricots', nameBn: 'কিশমিশ ও এপ্রিকট' }
    ],
    productCount: 5
  },
  {
    id: 'cat-dairy-milk',
    name: 'Dairy, Milk & Eggs',
    nameBn: 'দুধ, ডিম ও দুগ্ধজাত',
    nameAr: 'حليب وألبان وبيض',
    icon: 'Package',
    emoji: '🥛',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-dm-1', name: 'Fresh Pasteurised Milk', nameBn: 'খাঁটি তরল দুধ' },
      { id: 'sub-dm-2', name: 'Full Cream Milk Powder', nameBn: 'গুঁড়ো দুধ' },
      { id: 'sub-dm-3', name: 'Farm Fresh Eggs', nameBn: 'ফার্মের লাল ও সাদা ডিম' },
      { id: 'sub-dm-4', name: 'Butter, Cheese & Paneer', nameBn: 'মাখন, চিজ ও পনির' }
    ],
    productCount: 4
  },
  {
    id: 'cat-snacks',
    name: 'Snacks & Biscuits',
    nameBn: 'স্ন্যাক্স ও বিস্কুট',
    nameAr: 'وجبات خفيفة وبسكويت',
    icon: 'Package',
    emoji: '🍪',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-sn-1', name: 'Toast & Cream Biscuits', nameBn: 'টোস্ট ও ক্রিম বিস্কুট' },
      { id: 'sub-sn-2', name: 'Spicy Chanachur & Nimki', nameBn: 'ঝাল চানাচুর ও নিমকি' },
      { id: 'sub-sn-3', name: 'Potato Chips & Crackers', nameBn: 'পটেটো চিপস ও ক্র্যাকার্স' },
      { id: 'sub-sn-4', name: 'Chocolates & Cookies', nameBn: 'চকলেট ও কুকিজ' }
    ],
    productCount: 5
  },
  {
    id: 'cat-beverages',
    name: 'Beverages & Soft Drinks',
    nameBn: 'শরবত ও কোমল পানীয়',
    nameAr: 'مشروبات وعصائر',
    icon: 'Package',
    emoji: '🥤',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-bv-1', name: 'Fruit Juices & Nectars', nameBn: 'আম ও কমলার তাজা জুস' },
      { id: 'sub-bv-2', name: 'Rooh Afza & Syrups', nameBn: 'রূহ আফজা ও শরবত' },
      { id: 'sub-bv-3', name: 'Carbonated Soft Drinks', nameBn: 'কোল্ড ড্রিংকস' },
      { id: 'sub-bv-4', name: 'Mineral Water', nameBn: 'বিশুদ্ধ মিনারেল ওয়াটার' }
    ],
    productCount: 4
  },
  {
    id: 'cat-fruits',
    name: 'Fresh Fruits',
    nameBn: 'তাজা ফলমূল',
    nameAr: 'فواكه طازجة',
    icon: 'Package',
    emoji: '🍎',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-fr-1', name: 'Rajshahi Mangoes & Litchi', nameBn: 'রাজশাহীর আম ও লিচু' },
      { id: 'sub-fr-2', name: 'Apples, Oranges & Grapes', nameBn: 'আপেল, মাল্টা ও আঙুর' },
      { id: 'sub-fr-3', name: 'Bananas & Papaya', nameBn: 'কলা ও পাকা পেঁপে' },
      { id: 'sub-fr-4', name: 'Pomegranate & Guava', nameBn: 'বেদানা ও থাই পেয়ারা' }
    ],
    productCount: 4
  },
  {
    id: 'cat-vegetables',
    name: 'Fresh Vegetables',
    nameBn: 'শাকসবজি',
    nameAr: 'خضروات طازجة',
    icon: 'Package',
    emoji: '🥦',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-vg-1', name: 'Potato, Onion & Garlic', nameBn: 'আলু, পেঁয়াজ, রসুন ও আদা' },
      { id: 'sub-vg-2', name: 'Green Chilies & Tomatoes', nameBn: 'কাঁচামরিচ ও পাকা টমেটো' },
      { id: 'sub-vg-3', name: 'Leafy Greens (Shak)', nameBn: 'পালং, লাল ও কলমি শাক' },
      { id: 'sub-vg-4', name: 'Gourd & Cauliflower', nameBn: 'লাউ, ফুলকপি ও বাঁধাকপি' }
    ],
    productCount: 4
  },
  {
    id: 'cat-fish-meat',
    name: 'Fish & Meat',
    nameBn: 'মাছ ও মাংস',
    nameAr: 'أسماك ولحوم طازجة',
    icon: 'Package',
    emoji: '🥩',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-fm-1', name: 'Padma River Hilsa (Ilish)', nameBn: 'পদ্মার তাজা ইলিশ মাছ' },
      { id: 'sub-fm-2', name: 'Rui, Katla & Prawns', nameBn: 'রুই, কাতলা ও গলদা চিংড়ি' },
      { id: 'sub-fm-3', name: 'Fresh Deshi Chicken', nameBn: 'দেশি মুরগি ও ব্রয়লার' },
      { id: 'sub-fm-4', name: 'Mutton & Premium Beef', nameBn: 'খাসি ও গরুর মাংস' }
    ],
    productCount: 4
  },
  {
    id: 'cat-cleaning',
    name: 'Cleaning & Household',
    nameBn: 'ক্লিনিং ও হাউজহোল্ড',
    nameAr: 'منظفات وأدوات منزلية',
    icon: 'Package',
    emoji: '🧼',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-cl-1', name: 'Detergent & Fabric Softener', nameBn: 'ডিটারজেন্ট ও ফেব্রিক কন্ডিশনার' },
      { id: 'sub-cl-2', name: 'Dishwash Bar & Liquid', nameBn: 'ডিশওয়াশ বার ও লিকুইড' },
      { id: 'sub-cl-3', name: 'Floor Cleaner & Toiletries', nameBn: 'ফ্লোর ক্লিনার ও হারপিক' },
      { id: 'sub-cl-4', name: 'Handwash & Sanitizer', nameBn: 'হ্যান্ডওয়াশ ও জীবানুনাশক' }
    ],
    productCount: 4
  },
  {
    id: 'cat-kitchen',
    name: 'Home & Kitchen',
    nameBn: 'গৃহস্থালি ও রান্নাঘর',
    nameAr: 'أدوات المطبخ والمنزل',
    icon: 'Package',
    emoji: '🍳',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-kt-1', name: 'Non-stick Fry Pans & Pots', nameBn: 'নন-স্টিক ফ্রাই প্যান ও পাতিল' },
      { id: 'sub-kt-2', name: 'Blenders & Grinders', nameBn: 'ব্লেন্ডার ও মিক্সার' },
      { id: 'sub-kt-3', name: 'Rice Cookers & Ovens', nameBn: 'রাইস কুকার ও মাইক্রোওয়েভ' },
      { id: 'sub-kt-4', name: 'Water Filters & Purifiers', nameBn: 'পানির ফিল্টার ও পিউরিফায়ার' }
    ],
    productCount: 5
  },
  {
    id: 'cat-4',
    name: 'Grocery Products',
    nameBn: 'গ্রোসারি ও নিত্যপণ্য',
    nameAr: 'مواد تموينية وبقالة',
    icon: 'Package',
    emoji: '📦',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-41', name: 'Mustard Oil & Pure Ghee', nameBn: 'খাটি সরিষার তেল ও ঘি' },
      { id: 'sub-42', name: 'Sundarbans Natural Honey', nameBn: 'সুন্দরবনের খাঁটি মধু' },
      { id: 'sub-43', name: 'Aromatic Rice & Pulses', nameBn: 'সুগন্ধি চাল ও ডাল' },
      { id: 'sub-44', name: 'Spices & Seasonings', nameBn: 'গুঁড়া মসলা ও রান্নার উপকরণ' }
    ],
    productCount: 5
  },
  {
    id: 'cat-5',
    name: 'Shoes',
    nameBn: 'জুতা ও স্যান্ডেল',
    nameAr: 'أحذية وصنادل',
    icon: 'Footprints',
    emoji: '👟',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-51', name: 'Men\'s Leather Shoes', nameBn: 'পুরুষের চামড়ার জুতা' },
      { id: 'sub-52', name: 'Sports Running Sneakers', nameBn: 'স্পোর্টস জুতা ও স্নিকার্স' },
      { id: 'sub-53', name: 'Comfort Leather Sandals', nameBn: 'আরামদায়ক লেদার স্যান্ডেল' }
    ],
    productCount: 7
  },
  {
    id: 'cat-6',
    name: 'Watches',
    nameBn: 'ঘড়ি',
    nameAr: 'ساعات وإكسسوارات',
    icon: 'Tag',
    emoji: '⌚',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-61', name: 'Smart Watches', nameBn: 'স্মার্ট ওয়াচ' },
      { id: 'sub-62', name: 'Luxury Chronograph Watches', nameBn: 'লাক্সারি ক্রনোগ্রাফ ঘড়ি' },
      { id: 'sub-63', name: 'Leather Strap Watches', nameBn: 'লেদার বেল্ট ঘড়ি' }
    ],
    productCount: 3
  },
  {
    id: 'cat-7',
    name: 'Cosmetics',
    nameBn: 'কসমেটিক্স ও রূপচর্চা',
    nameAr: 'مستحضرات التجميل والعناية',
    icon: 'Heart',
    emoji: '💄',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-71', name: 'Sunscreens & Lotions', nameBn: 'সানস্ক্রিন ও ময়েশ্চারাইজার' },
      { id: 'sub-72', name: 'Lipsticks & Makeup', nameBn: 'লিপস্টিক ও মেকআপ' },
      { id: 'sub-73', name: 'Hair Care Serums', nameBn: 'চুলের সিরাম ও শ্যাম্পু' }
    ],
    productCount: 4
  },
  {
    id: 'cat-8',
    name: 'Baby Care',
    nameBn: 'বেবি কেয়ার',
    nameAr: 'عناية بالطفل وحفاضات',
    icon: 'Heart',
    emoji: '🍼',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-81', name: 'Baby Pant Diapers', nameBn: 'বাচ্চাদের প্যান্ট ডায়াপার' },
      { id: 'sub-82', name: 'Baby Wipes & Skincare', nameBn: 'বেবি ওয়াইপ্স ও তেল' },
      { id: 'sub-83', name: 'Feeding Bottles & Accessories', nameBn: 'ফিডার ও বেবি কিট' }
    ],
    productCount: 4
  },
  {
    id: 'cat-9',
    name: 'Toys',
    nameBn: 'খেলনা',
    nameAr: 'ألعاب أطفال',
    icon: 'Gamepad2',
    emoji: '🧸',
    image: 'https://images.unsplash.com/photo-1537655780520-1e392edd816a?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-91', name: 'Educational Toys & Puzzles', nameBn: 'শিক্ষণীয় খেলনা ও পাজল' },
      { id: 'sub-92', name: 'RC Cars & Vehicles', nameBn: 'রিমোট কন্ট্রোল গাড়ি' },
      { id: 'sub-93', name: 'Building Blocks & Legos', nameBn: 'বিল্ডিং ব্লক ও লেগো' }
    ],
    productCount: 3
  },
  {
    id: 'cat-10',
    name: 'Sports',
    nameBn: 'খেলাধুলা',
    nameAr: 'رياضة ولياقة بدنية',
    icon: 'Activity',
    emoji: '⚽',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-101', name: 'Cricket Gear & Bats', nameBn: 'ক্রিকেট ব্যাট ও সরঞ্জাম' },
      { id: 'sub-102', name: 'Football & Accessories', nameBn: 'ফুটবল ও গোলকিপার গ্লাভস' },
      { id: 'sub-103', name: 'Fitness Gear & Dumbbells', nameBn: 'জিম ও ফিটনেস সামগ্রী' }
    ],
    productCount: 3
  },
  {
    id: 'cat-11',
    name: 'Medicine',
    nameBn: 'ওষুধ ও ফার্মেসি',
    nameAr: 'أدوية وصيدلية',
    icon: 'Activity',
    emoji: '💊',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-111', name: 'OTC General Medicines', nameBn: 'নিত্যদিনের সাধারণ ওষুধ' },
      { id: 'sub-112', name: 'First Aid Kits & Bandages', nameBn: 'ফার্স্ট এইড কিট ও গজ' },
      { id: 'sub-113', name: 'Supplements & Vitamin D3', nameBn: 'ভিটামিন ও সাপ্লিমেন্ট' }
    ],
    productCount: 3
  },
  {
    id: 'cat-12',
    name: 'Books',
    nameBn: 'বই ও স্টেশনারি',
    nameAr: 'كتب وقرطاسية',
    icon: 'BookOpen',
    emoji: '📚',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-121', name: 'Islamic Books & Novels', nameBn: 'ইসলামিক বই ও উপন্যাস' },
      { id: 'sub-122', name: 'Poetry & Literature', nameBn: 'কবিতা ও সাহিত্য সমগ্র' },
      { id: 'sub-123', name: 'Stationery & Notebooks', nameBn: 'স্টেশনারি ও খাতা' }
    ],
    productCount: 3
  },
  {
    id: 'cat-fast-food',
    name: 'Fast Food & Burgers',
    nameBn: 'ফাস্টফুড ও বার্গার',
    nameAr: 'وجبات سريعة وبرغر',
    icon: 'Package',
    emoji: '🍔',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-ff-1', name: 'Crispy Fried Chicken & Wings', nameBn: 'ফ্রাইড চিকেন ও উইংস' },
      { id: 'sub-ff-2', name: 'Gourmet Beef & Chicken Burgers', nameBn: 'বিফ ও চিকেন বার্গার' },
      { id: 'sub-ff-3', name: 'French Fries & Dips', nameBn: 'ফ্রেঞ্চ ফ্রাই ও সস' },
      { id: 'sub-ff-4', name: 'Club Sandwiches & Wraps', nameBn: 'ক্লাব স্যান্ডউইচ ও রোল' }
    ],
    productCount: 4
  },
  {
    id: 'cat-pizza-pasta',
    name: 'Pizza & Pasta',
    nameBn: 'পিজ্জা ও পাস্তা',
    nameAr: 'بيتزا وباستا',
    icon: 'Package',
    emoji: '🍕',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-pz-1', name: 'Loaded Cheese Pizza', nameBn: 'চীজ বাস্ট ও মিট লাভার্স পিজ্জা' },
      { id: 'sub-pz-2', name: 'Creamy Alfredo Pasta', nameBn: 'হোয়াইট সস ও পাস্তা' },
      { id: 'sub-pz-3', name: 'Spicy Naga Pasta', nameBn: 'ঝাল নাগা ও স্প্যাগেটি' }
    ],
    productCount: 3
  },
  {
    id: 'cat-bakery',
    name: 'Bakery & Sweets',
    nameBn: 'বেকারি ও মিষ্টি',
    nameAr: 'مخبوزات وحلويات',
    icon: 'Package',
    emoji: '🥐',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-bk-1', name: 'Fresh Milk Bread & Buns', nameBn: 'তাজা মিল্ক ব্রেড ও বান' },
      { id: 'sub-bk-2', name: 'Birthday & Pastry Cakes', nameBn: 'কেক ও পেস্ট্রি' },
      { id: 'sub-bk-3', name: 'Traditional Bengali Sweets', nameBn: 'রসগোল্লা, চমচম ও মিষ্টি' }
    ],
    productCount: 4
  },
  {
    id: 'cat-frozen',
    name: 'Frozen Foods',
    nameBn: 'ফ্রোজেন ফুড',
    nameAr: 'أطعمة مجمدة',
    icon: 'Package',
    emoji: '🧊',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-fz-1', name: 'Plain & Flaky Parathas', nameBn: 'ফ্রোজেন পরোটা ও রুটি' },
      { id: 'sub-fz-2', name: 'Chicken Nuggets & Sausages', nameBn: 'চিকেন নাগেটস ও সসেজ' },
      { id: 'sub-fz-3', name: 'Singara, Samosa & Rolls', nameBn: 'সিঙ্গারা ও সমুচা' }
    ],
    productCount: 4
  },
  {
    id: 'cat-combo',
    name: 'Combo Deals & Offers',
    nameBn: 'কম্বো অফার ও প্যাকেজ',
    nameAr: 'عروض كومبو وباقات',
    icon: 'Package',
    emoji: '🎁',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-cb-1', name: 'Monthly Grocery Saver Pack', nameBn: 'মাসিক বাজার সেভার প্যাক' },
      { id: 'sub-cb-2', name: 'Ramadan & Festival Combos', nameBn: 'রমজান ও উৎসব স্পেশাল কম্বো' },
      { id: 'sub-cb-3', name: 'Duo & Family Bundles', nameBn: 'ফ্যামিলি বান্ডেল অফার' }
    ],
    productCount: 5
  },
  {
    id: 'cat-pet-care',
    name: 'Pet Care & Food',
    nameBn: 'পোষা প্রাণীর খাদ্য ও যত্ন',
    nameAr: 'طعام وعناية بالحيوانات الأليفة',
    icon: 'Heart',
    emoji: '🐱',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-pt-1', name: 'Cat Food & Treats', nameBn: 'বিড়ালের ড্রাই ও ওয়েট ফুড' },
      { id: 'sub-pt-2', name: 'Dog Food & Chew Bones', nameBn: 'কুকুরের খাবার' },
      { id: 'sub-pt-3', name: 'Cat Litter & Grooming', nameBn: 'ক্যাট লিটার ও শ্যাম্পু' }
    ],
    productCount: 3
  },
  {
    id: 'cat-gardening',
    name: 'Gardening & Plants',
    nameBn: 'বাগান ও চারাগাছ',
    nameAr: 'نباتات وحدائق',
    icon: 'Package',
    emoji: '🪴',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-gd-1', name: 'Live Indoor Plants', nameBn: 'ইনডোর গাছ ও ক্যাকটাস' },
      { id: 'sub-gd-2', name: 'Flower & Vegetable Seeds', nameBn: 'ফুল ও সবজির বীজ' },
      { id: 'sub-gd-3', name: 'Ceramic Pots & Organic Soil', nameBn: 'টব ও জৈব সার' }
    ],
    productCount: 3
  },
  {
    id: 'cat-automotive',
    name: 'Car & Bike Accessories',
    nameBn: 'গাড়ি ও বাইক গ্যাজেট',
    nameAr: 'إكسسوارات سيارات ودراجات',
    icon: 'Package',
    emoji: '🚗',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-au-1', name: 'Mobile Holders & Car Chargers', nameBn: 'মোবাইল হোল্ডার ও ফাস্ট কার চার্জার' },
      { id: 'sub-au-2', name: 'Car Perfume & Air Freshener', nameBn: 'কার পারফিউম ও ফ্রেশনার' },
      { id: 'sub-au-3', name: 'Bike Helmet & Rain Coats', nameBn: 'বাইকার হেলমেট ও রেইনকোট' }
    ],
    productCount: 3
  }
];

export const ALL_FRONTEND_CATEGORIES = INITIAL_CATEGORIES;

export const SHWAPNO_DETAILED_CATEGORIES: MainCategory[] = INITIAL_CATEGORIES.map(cat => {
  const subs: SubCategory[] = cat.subcategories.map(sub => ({
    id: sub.id,
    name: sub.name,
    nameBn: sub.nameBn,
    nameAr: sub.nameAr,
    emoji: CATEGORY_EMOJIS[cat.id] || '✨',
    subcategories: [],
    subCategories: [],
    subSubCategories: []
  }));

  return {
    id: cat.id,
    name: cat.name,
    nameBn: cat.nameBn,
    nameAr: cat.nameAr,
    icon: cat.icon,
    emoji: CATEGORY_EMOJIS[cat.id] || '✨',
    image: cat.image,
    productCount: cat.productCount,
    subcategories: subs,
    subCategories: subs
  };
});
