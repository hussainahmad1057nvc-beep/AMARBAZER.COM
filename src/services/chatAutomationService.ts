export interface QuickReplyOption {
  id: string;
  question: string;
  questionBn: string;
  answer: string;
  answerBn: string;
  category?: 'order' | 'delivery' | 'payment' | 'return' | 'product' | 'general';
}

export interface KeywordTrigger {
  id: string;
  keywords: string[]; // e.g. ['দাম', 'price', 'koto', 'মূল্য']
  response: string;
  responseBn: string;
}

export interface ChatAutomationConfig {
  userId: string;
  role: 'admin' | 'seller' | 'customer';
  isAutoReplyEnabled: boolean;
  welcomeMessage: string;
  welcomeMessageBn: string;
  awayMessage: string;
  awayMessageBn: string;
  onlineStatus: 'online' | 'away' | 'busy';
  quickOptions: QuickReplyOption[];
  keywordTriggers: KeywordTrigger[];
}

const DEFAULT_ADMIN_CONFIG: ChatAutomationConfig = {
  userId: 'usr-admin-1',
  role: 'admin',
  isAutoReplyEnabled: true,
  welcomeMessage: 'Welcome to AmarBazar 24/7 Official Support Helpline! How may we assist you today?',
  welcomeMessageBn: 'আমারবাজার ২৪/৭ অফিশিয়াল সাপোর্ট হেল্পলাইনে আপনাকে স্বাগতম! কীভাবে আপনাকে সাহায্য করতে পারি?',
  awayMessage: 'Our agents are currently reviewing tickets. We will respond within 5-10 minutes.',
  awayMessageBn: 'আমাদের সাপোর্ট টিম এই মুহূর্তে টিকিটগুলো রিভিউ করছে। খুব দ্রুতই উত্তর দেওয়া হবে।',
  onlineStatus: 'online',
  quickOptions: [
    {
      id: 'opt-admin-1',
      question: 'Where is my order & tracking status?',
      questionBn: 'আমার অর্ডার ও ট্র্যাকিং স্ট্যাটাস জানতে চাই',
      answer: 'You can track your order in real-time from the Tracking Support tab or by providing your Order ID (e.g. BD-2026-XXXX) right here in this chat.',
      answerBn: 'আপনি হেডার বা বটম ন্যাভের "ট্র্যাকিং" অপশন থেকে অথবা এই চ্যাটে আপনার অর্ডার নম্বর (যেমন: BD-2026-XXXX) লিখে সরাসরি স্ট্যাটাস জানতে পারেন।',
      category: 'order'
    },
    {
      id: 'opt-admin-2',
      question: 'How does the 7-day Return & Refund policy work?',
      questionBn: '৭ দিনের রিটার্ন ও রিফান্ড পলিসি কীভাবে কাজ করে?',
      answer: 'If the delivered product is defective or does not match the description, you can report it within 7 days. Our admin team will arrange a free reverse pickup and immediate refund.',
      answerBn: 'পণ্য ভাঙা, ক্ষতিগ্রস্ত বা অমিল হলে ৭ দিনের মধ্যে চ্যাটে ছবিসহ রিপোর্ট করুন। আমাদের টিম ফ্রি পিকআপ করে তাৎক্ষণিক রিফান্ড নিশ্চিত করবে।',
      category: 'return'
    },
    {
      id: 'opt-admin-3',
      question: 'Report a seller or security inquiry',
      questionBn: 'কোনো বিক্রেতা বা পণ্য নিয়ে অভিযোগ / রিপোর্ট করতে চাই',
      answer: 'Please provide the seller name, order ID, and details of the complaint. Our compliance team will investigate and take strict action within 2 hours.',
      answerBn: 'অনুগ্রহ করে বিক্রেতার নাম ও অর্ডার নম্বর লিখে বিস্তারিত অভিযোগ জানান। আমাদের কমপ্লায়েন্স টিম দ্রুত তদন্ত করে ব্যবস্থা গ্রহণ করবে।',
      category: 'general'
    },
    {
      id: 'opt-admin-4',
      question: 'What are the accepted payment methods?',
      questionBn: 'পেমেন্ট পদ্ধতিসমূহ কী কী?',
      answer: 'We accept Cash-on-Delivery (COD), bKash, Nagad, Rocket, Credit/Debit cards, and AmarBazar Wallet balance.',
      answerBn: 'ক্যাশ অন ডেলিভারি (COD), বিকাশ, নগদ, রকেট, ব্যাংক কার্ড এবং আমারবাজার ওয়ালেটের মাধ্যমে সম্পূর্ণ নিরাপদ পেমেন্ট করতে পারেন।',
      category: 'payment'
    }
  ],
  keywordTriggers: [
    {
      id: 'kw-1',
      keywords: ['অর্ডার', 'order', 'ট্র্যাকিং', 'tracking', 'পার্সেল', 'parcel', 'কবে পাব'],
      response: 'To check your order progress, please type your Order ID (e.g. BD-2026-8912) or open the Track tab.',
      responseBn: 'অর্ডারের বর্তমান অবস্থান জানতে আপনার অর্ডার নম্বরটি (যেমন: BD-2026-8912) লিখুন অথবা ট্র্যাকিং ট্যাব দেখুন।'
    },
    {
      id: 'kw-2',
      keywords: ['রিফান্ড', 'refund', 'রিটার্ন', 'return', 'টাকা ফেরত', 'বদলাব'],
      response: 'Our 7-day easy return policy covers damaged or incorrect items. Share photos here for instant review.',
      responseBn: 'পণ্য ফেরত বা পরিবর্তনের জন্য ৭ দিনের মধ্যে পণ্যের স্পষ্ট ছবি ও অর্ডার আইডি এখানে শেয়ার করুন।'
    },
    {
      id: 'kw-3',
      keywords: ['বিকাশ', 'bkash', 'নগদ', 'nagad', 'পেমেন্ট', 'payment'],
      response: 'Payment via bKash & Nagad is 100% verified automatically with Transaction ID OTP verification.',
      responseBn: 'বিকাশ ও নগদ পেমেন্টে কোনো সমস্যা হলে ট্রানজেকশন আইডি (TrxID) এখানে লিখে দিন, আমরা ভেরিফাই করছি।'
    }
  ]
};

const DEFAULT_SELLER_CONFIG: ChatAutomationConfig = {
  userId: 'usr-seller-1',
  role: 'seller',
  isAutoReplyEnabled: true,
  welcomeMessage: 'Hello! Welcome to our official store on AmarBazar BD. Let us know what you are looking for.',
  welcomeMessageBn: 'আসসালামু আলাইকুম! আমাদের অফিশিয়াল স্টোরে স্বাগতম। আপনি কোন পণ্যটি খুঁজছেন আমাদের জানান।',
  awayMessage: 'We are currently preparing customer orders. We will get back to you shortly.',
  awayMessageBn: 'আমরা পার্সেল প্যাকেজিং ও ডিসপ্যাচে ব্যস্ত আছি। খুব দ্রুতই উত্তর দেওয়া হবে।',
  onlineStatus: 'online',
  quickOptions: [
    {
      id: 'opt-seller-1',
      question: 'Is this item currently in stock and ready to ship?',
      questionBn: 'পণ্যটি কি স্টকে আছে এবং দ্রুত ডেলিভারি দেওয়া যাবে?',
      answer: 'Yes, 100% in stock and tested! Orders placed before 4 PM are handed over to the courier on the same day.',
      answerBn: 'জি, পণ্যটি আমাদের স্টকে শতভাগ প্রস্তুত আছে! দুপুর ৪টার আগে অর্ডার দিলে আজকেই কুরিয়ারে বুকিং হবে।',
      category: 'product'
    },
    {
      id: 'opt-seller-2',
      question: 'What is the delivery time and shipping charge?',
      questionBn: 'ডেলিভারি সময় এবং ডেলিভারি চার্জ কত?',
      answer: 'Inside Dhaka delivery takes 24 hours (৳60). Outside Dhaka takes 48-72 hours (৳120). Cash on delivery available!',
      answerBn: 'ঢাকার ভেতরে ২৪ ঘণ্টা (চার্জ ৬০ টাকা) এবং ঢাকার বাইরে ৪৮-৭২ ঘণ্টার মধ্যে (চার্জ ১২০ টাকা) হোম ডেলিভারি পাবেন।',
      category: 'delivery'
    },
    {
      id: 'opt-seller-3',
      question: 'Can I check the product before making payment?',
      questionBn: 'ডেলিভারিম্যানের সামনে পণ্য চেক করে টাকা দিতে পারব কি?',
      answer: 'Yes! You can inspect the package in front of the delivery agent before paying the cash on delivery amount.',
      answerBn: 'জি অবশ্যই! ক্যাশ অন ডেলিভারিতে ডেলিভারিম্যানের সামনে পার্সেলটি চেক করে মূল্য পরিশোধ করতে পারবেন।',
      category: 'payment'
    },
    {
      id: 'opt-seller-4',
      question: 'Is there any discount or wholesale pricing for multiple quantities?',
      questionBn: 'পাইকারি বা একাধিক পণ্য অর্ডারে কোনো বিশেষ ডিসকাউন্ট আছে কি?',
      answer: 'Yes, automatic bulk discounts apply when ordering 2 or more units. Feel free to place bulk order!',
      answerBn: 'জি, ২ বা ততোধিক পরিমাণ যোগ করলে স্বয়ংক্রিয়ভাবে বাল্ক ডিসকাউন্ট যুক্ত হয়।',
      category: 'product'
    }
  ],
  keywordTriggers: [
    {
      id: 'kw-s-1',
      keywords: ['দাম', 'price', 'koto', 'মূল্য', 'দাম কত'],
      response: 'All prices shown on the product page are final discounted prices with VAT included.',
      responseBn: 'প্রোডাক্ট পেজে উল্লেখিত মূল্যই ভ্যাটসহ ডিসকাউন্টেড রেগুলার প্রাইস। বাল্ক অর্ডারে আরও ছাড় রয়েছে।'
    },
    {
      id: 'kw-s-2',
      keywords: ['ডেলিভারি', 'delivery', 'কুরিয়ার', 'courier', 'কতদিন'],
      response: 'Delivery inside Dhaka is 24 hours (৳60), outside Dhaka is 48 hours (৳120).',
      responseBn: 'ঢাকার ভেতরে ২৪ ঘণ্টা এবং ঢাকার বাইরে ৪৮ ঘণ্টার মধ্যে ক্যাশ অন ডেলিভারি পৌঁছে দেওয়া হয়।'
    },
    {
      id: 'kw-s-3',
      keywords: ['অরিজিনাল', 'original', 'ওয়ারেন্টি', 'warranty', 'গ্যারান্টি'],
      response: 'All products in our store are 100% genuine with authentic brand warranty & 7 days replacement guarantee.',
      responseBn: 'আমাদের স্টোরের প্রতিটি পণ্য শতভাগ অরিজিনাল এবং ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টিযুক্ত।'
    }
  ]
};

class ChatAutomationService {
  private getStorageKey(userId: string): string {
    return `amarbazar_chat_automation_${userId}`;
  }

  public getConfig(userId: string, role: 'admin' | 'seller' | 'customer' = 'seller'): ChatAutomationConfig {
    try {
      const saved = localStorage.getItem(this.getStorageKey(userId));
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load chat automation config:', e);
    }

    // Default template depending on role
    if (role === 'admin' || userId === 'usr-admin-1') {
      return { ...DEFAULT_ADMIN_CONFIG, userId };
    }
    return { ...DEFAULT_SELLER_CONFIG, userId, role };
  }

  public saveConfig(config: ChatAutomationConfig): void {
    try {
      localStorage.setItem(this.getStorageKey(config.userId), JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save chat automation config:', e);
    }
  }

  public findAutomatedAnswer(
    messageText: string,
    recipientId: string,
    recipientRole: 'admin' | 'seller' | 'customer' = 'seller',
    language: 'bn' | 'en' = 'bn'
  ): string | null {
    const config = this.getConfig(recipientId, recipientRole);
    if (!config.isAutoReplyEnabled) return null;

    const cleanInput = messageText.trim().toLowerCase();

    // 1. Check exact question match in quick options
    for (const opt of config.quickOptions) {
      if (
        cleanInput.includes(opt.question.toLowerCase()) ||
        cleanInput.includes(opt.questionBn.toLowerCase())
      ) {
        return language === 'bn' ? opt.answerBn : opt.answer;
      }
    }

    // 2. Check keyword triggers
    for (const trig of config.keywordTriggers) {
      const matched = trig.keywords.some(kw => cleanInput.includes(kw.toLowerCase()));
      if (matched) {
        return language === 'bn' ? trig.responseBn : trig.response;
      }
    }

    return null;
  }
}

export const chatAutomationService = new ChatAutomationService();
