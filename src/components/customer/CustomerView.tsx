import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ShoppingBag, ShoppingCart, Flame, Star, Heart, ShieldCheck, Store, 
  Truck, Tag, Sparkles, Eye, MapPin, Search, ChevronDown, 
  ChevronLeft, ChevronRight, Plus, Minus, Check, X, Clock, Phone, 
  Smartphone, Map, HelpCircle, MessageSquare, ThumbsUp, Share2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Language } from '../../types';
import { SHWAPNO_DETAILED_CATEGORIES, MainCategory, SubCategory, SubSubCategory, CATEGORY_EMOJIS, INITIAL_CATEGORIES } from '../../data/categoriesData';

interface CustomerViewProps {
  onOpenProduct: (product: Product) => void;
  onBuyNow: (product: Product, quantity: number, variants: Record<string, string>) => void;
}

const CAMPAIGN_BANNERS = {
  all: {
    badge: {
      en: 'SUMMER CELEBRATION',
      bn: 'সামার উৎসব অফার'
    },
    title: {
      en: 'Summer Fest - Freshness Delivered!',
      bn: 'সামার ফেস্ট - তরতাজা সতেজ অফার!'
    },
    description: {
      en: 'Beat the heat with premium Rajshahi Himsagar mangoes, sweet green coconuts, cold beverages, and 100% organic products direct to your doorstep!',
      bn: 'গ্রীষ্মের গরমে সতেজ থাকুন! রাজশাহীর মিষ্টি আম, ডাব এবং ঠান্ডা ড্রিংকস সহ ১০০% খাঁটি ও অর্গানিক পণ্য সরাসরি পৌঁছে যাবে আপনার ঘরে।'
    },
    gradient: 'from-amber-500 via-orange-500 to-red-600',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
    accentColor: '#fb923c'
  },
  unilever: {
    badge: {
      en: 'UNILEVER SAVINGS',
      bn: 'ইউনিলিভার মেগা অফার'
    },
    title: {
      en: 'Deals on Unilever - Stock & Save Fest!',
      bn: 'ইউনিলিভার শপিং ফেস্ট - সুপার ছাড়!'
    },
    description: {
      en: 'Keep your home clean and your family protected! Save big with exciting discounts and cashbacks on Surf Excel, Lux, Vim, and Lifebuoy soaps.',
      bn: 'সার্ফ এক্সেল, লাক্স সাবান, ভিম লিকুইড এবং লাইফবয় জীবাণুনাশক পণ্যে পাচ্ছেন আকর্ষণীয় ডিসকাউন্ট এবং নিশ্চিত ক্যাশব্যাক অফার।'
    },
    gradient: 'from-[#005a9c] via-[#059669] to-[#047857]',
    image: 'https://images.unsplash.com/photo-1607006342411-92fc0a41d08c?auto=format&fit=crop&w=600&q=80',
    accentColor: '#10b981'
  },
  bogo: {
    badge: {
      en: 'BLOCKBUSTER DEALS',
      bn: 'বিশাল ধামাকা অফার'
    },
    title: {
      en: 'Great Deals - Premium Brands Mega Discount!',
      bn: 'বিশাল ডিলস - গ্যাজেট ও লাইফস্টাইলে মহা ছাড়!'
    },
    description: {
      en: 'Save up to ৳6,000+ on premium Walton 4K Smart TVs, Samsung official phones, Baseus chargers, and handcrafted traditional Dhaka Jamdani sarees!',
      bn: 'ওয়ালটন ৫টিভি, স্যামসাং স্মার্টফোন, বাসিউস পাওয়ার ব্যাংক এবং ঢাকার ঐতিহ্যবাহী জামদানি শাড়িতে পাচ্ছেন সর্বকালের সেরা আকর্ষণীয় ডিল!'
    },
    gradient: 'from-[#bf1e2e] via-[#4c0519] to-indigo-950',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80',
    accentColor: '#da1c24'
  },
  summer: {
    badge: {
      en: 'BUY MORE SAVE MORE',
      bn: 'বেশি কিনুন বেশি বাঁচান'
    },
    title: {
      en: 'Grocery Essentials - Family Pack Mega Savings!',
      bn: 'বেশি কিনুন বেশি বাঁচান - নিত্যপ্রয়োজনীয় ফ্যামিলি প্যাক!'
    },
    description: {
      en: 'Stock your kitchen with 5 Liters of wooden-milled Pure Mustard Oil and 1kg Sundarbans Natural Honey at unmatched prices for maximum household budget savings.',
      bn: 'কাঠের ঘানির খাঁটি সরিষার তেল ৫ লিটার এবং সুন্দরবনের মধু ১ কেজির ফ্যামিলি প্যাকে সাশ্রয় করুন আকর্ষণীয় ছাড়ের মাধ্যমে।'
    },
    gradient: 'from-amber-600 via-yellow-600 to-amber-900',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    accentColor: '#f59e0b'
  }
};

interface CampaignTimerProps {
  campaign: any;
  campaignKey: string;
  language: Language;
}

const CampaignTimer: React.FC<CampaignTimerProps> = ({ campaign, campaignKey, language }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 1, hours: 15, minutes: 28, seconds: 47 });

  useEffect(() => {
    const targetVal = campaign?.timerEndsAt;
    
    const getTargetTimestamp = (val: string | undefined | null) => {
      const defaultDays = campaign?.timerDays !== undefined ? campaign.timerDays : 1;
      const defaultHours = campaign?.timerHours !== undefined ? campaign.timerHours : 15;
      const defaultMinutes = campaign?.timerMinutes !== undefined ? campaign.timerMinutes : 28;
      const defaultSeconds = campaign?.timerSeconds !== undefined ? campaign.timerSeconds : 47;

      if (!val) {
        const d = new Date();
        d.setDate(d.getDate() + defaultDays);
        d.setHours(d.getHours() + defaultHours);
        d.setMinutes(d.getMinutes() + defaultMinutes);
        d.setSeconds(d.getSeconds() + defaultSeconds);
        return d.getTime();
      }
      
      const numHours = Number(val);
      if (!isNaN(numHours) && numHours > 0) {
        if (numHours > 10000000000) {
          return numHours;
        }
        const cacheKey = `campaign_timer_start_${campaignKey}_${numHours}`;
        let startStr = localStorage.getItem(cacheKey);
        let startTime = Date.now();
        if (startStr) {
          startTime = Number(startStr);
        } else {
          localStorage.setItem(cacheKey, String(startTime));
        }
        return startTime + (numHours * 60 * 60 * 1000);
      }

      const parsed = Date.parse(val);
      if (!isNaN(parsed)) {
        return parsed;
      }

      const d = new Date();
      d.setDate(d.getDate() + defaultDays);
      d.setHours(d.getHours() + defaultHours);
      d.setMinutes(d.getMinutes() + defaultMinutes);
      d.setSeconds(d.getSeconds() + defaultSeconds);
      return d.getTime();
    };

    const targetTime = getTargetTimestamp(targetVal);

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const secondsTotal = Math.floor(diff / 1000);
      const days = Math.floor(secondsTotal / (3600 * 24));
      const hours = Math.floor((secondsTotal % (3600 * 24)) / 3600);
      const minutes = Math.floor((secondsTotal % 3600) / 60);
      const seconds = secondsTotal % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [campaign, campaignKey]);

  return (
    <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 bg-black/75 backdrop-blur-md rounded-full px-1 py-[1.5px] sm:px-1.5 sm:py-[2.5px] border border-white/10 flex items-center space-x-0.5 sm:space-x-1 shadow-md z-20">
      <span className="text-[6px] xs:text-[6.5px] sm:text-[9px] font-black text-amber-300 uppercase tracking-wider flex items-center shrink-0">
        <Clock className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 mr-0.5 text-amber-300 animate-pulse shrink-0" />
        <span className="hidden md:inline">{language === 'bn' ? 'অফার শেষ:' : 'ENDS IN:'}</span>
      </span>

      <div className="flex items-center space-x-0.5 text-[6px] xs:text-[7px] sm:text-[9px] font-bold tracking-normal shrink-0 font-mono text-white">
        {/* Days */}
        <span className="bg-[#da1c24] px-[2px] py-[1px] sm:px-1 sm:py-0.5 rounded-[2px] sm:rounded inline-flex items-center justify-center min-w-[8px] sm:min-w-[12px]">
          {String(timeLeft.days).padStart(2, '0')}
          <span className="text-[4.5px] sm:text-[6.5px] uppercase font-bold text-white/85 ml-[1px]">{language === 'bn' ? 'দিন' : 'd'}</span>
        </span>
        <span className="text-amber-400 font-bold text-[5px] sm:text-[8px]">:</span>

        {/* Hours */}
        <span className="bg-[#da1c24] px-[2px] py-[1px] sm:px-1 sm:py-0.5 rounded-[2px] sm:rounded inline-flex items-center justify-center min-w-[8px] sm:min-w-[12px]">
          {String(timeLeft.hours).padStart(2, '0')}
          <span className="text-[4.5px] sm:text-[6.5px] uppercase font-bold text-white/85 ml-[1px]">{language === 'bn' ? 'ঘ' : 'h'}</span>
        </span>
        <span className="text-amber-400 font-bold text-[5px] sm:text-[8px]">:</span>

        {/* Minutes */}
        <span className="bg-[#da1c24] px-[2px] py-[1px] sm:px-1 sm:py-0.5 rounded-[2px] sm:rounded inline-flex items-center justify-center min-w-[8px] sm:min-w-[12px]">
          {String(timeLeft.minutes).padStart(2, '0')}
          <span className="text-[4.5px] sm:text-[6.5px] uppercase font-bold text-white/85 ml-[1px]">{language === 'bn' ? 'মি' : 'm'}</span>
        </span>
        <span className="text-amber-400 font-bold text-[5px] sm:text-[8px]">:</span>

        {/* Seconds */}
        <span className="bg-blue-600 px-[2px] py-[1px] sm:px-1 sm:py-0.5 rounded-[2px] sm:rounded inline-flex items-center justify-center min-w-[8px] sm:min-w-[12px] animate-pulse">
          {String(timeLeft.seconds).padStart(2, '0')}
          <span className="text-[4.5px] sm:text-[6.5px] uppercase font-bold text-white/85 ml-[1px]">{language === 'bn' ? 'সে' : 's'}</span>
        </span>
      </div>
    </div>
  );
};

export const CustomerView: React.FC<CustomerViewProps> = ({ onOpenProduct, onBuyNow }) => {
  const { 
    products, categories, language, currency, formatPrice, addToCart, cart, updateCartQuantity, 
    wishlist, toggleWishlist, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, 
    selectedSellerId, setSelectedSellerId, setActivePanel,
    setTrackingOrderId, activeCampaignTab: activeTab, setActiveCampaignTab: setActiveTab,
    shareProduct
  } = useApp();

  const selectedSellerName = useMemo(() => {
    if (!selectedSellerId) return '';
    const matched = products.find(p => p.sellerId === selectedSellerId);
    return matched ? matched.sellerName : 'Outlet Store';
  }, [products, selectedSellerId]);

  const categoryRowRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollLeftRef = useRef<number>(0);

  // Merge full standard categories with any dynamic categories from database
  const allCategoriesList = useMemo(() => {
    const dict: Record<string, { id: string; name: string; nameBn?: string; emoji?: string; icon?: string }> = {};
    INITIAL_CATEGORIES.forEach(cat => {
      dict[cat.id] = { ...cat };
    });
    (categories || []).forEach(cat => {
      dict[cat.id] = { ...(dict[cat.id] || {}), ...cat };
    });
    return Object.values(dict);
  }, [categories]);

  const scrollCategory = (direction: 'left' | 'right') => {
    if (categoryRowRef.current) {
      const scrollAmount = 240;
      categoryRowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const el = categoryRowRef.current;
    if (!el) return;

    let animationId: number;
    let lastTime = performance.now();

    const scroll = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      if (!isHoveredRef.current && !isDraggingRef.current && el) {
        // Continuous smooth auto-scroller
        const speed = 0.035;
        let nextScroll = el.scrollLeft + delta * speed;

        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > 0 && nextScroll >= halfWidth) {
          nextScroll -= halfWidth;
        }
        el.scrollLeft = nextScroll;
      }

      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [allCategoriesList]);

  const [dynamicCampaigns, setDynamicCampaigns] = useState(() => {
    try {
      const saved = localStorage.getItem('market_campaigns');
      if (saved) {
        const parsed = JSON.parse(saved);
        const banners: any = {};
        parsed.forEach((c: any) => {
          banners[c.id] = {
            id: c.id,
            badge: {
              en: c.name || '',
              bn: c.nameBn || ''
            },
            title: {
              en: c.tagline || '',
              bn: c.taglineBn || ''
            },
            description: {
              en: c.description || '',
              bn: c.descriptionBn || ''
            },
            gradient: c.gradient || 'from-amber-500 via-orange-500 to-red-600',
            image: c.image || '',
            accentColor: c.accentColor || '#fb923c',
            isActive: c.isActive !== false,
            showBanner: c.showBanner !== false,
            showBadge: c.showBadge !== false,
            showImage: c.showImage !== false,
            showTagline: c.showTagline !== false,
            showDescription: c.showDescription !== false,
            adImage: c.adImage || '',
            showTimer: c.showTimer !== false,
            timerEndsAt: c.timerEndsAt || '',
            timerDays: c.timerDays !== undefined ? c.timerDays : 1,
            timerHours: c.timerHours !== undefined ? c.timerHours : 15,
            timerMinutes: c.timerMinutes !== undefined ? c.timerMinutes : 28,
            timerSeconds: c.timerSeconds !== undefined ? c.timerSeconds : 47,
            filterKeyword: c.filterKeyword || ''
          };
        });
        return banners;
      }
    } catch (e) {
      console.error('Error parsing market_campaigns:', e);
    }

    // Fallback if no local storage
    const banners: any = {};
    Object.entries(CAMPAIGN_BANNERS).forEach(([key, value]: [string, any]) => {
      banners[key] = {
        id: key,
        badge: value.badge,
        title: value.title,
        description: value.description,
        gradient: value.gradient,
        image: value.image,
        accentColor: value.accentColor,
        isActive: true,
        showBanner: true,
        showBadge: true,
        showImage: true,
        showTagline: true,
        showDescription: true,
        adImage: '',
        showTimer: true,
        timerEndsAt: '',
        timerDays: 1,
        timerHours: 15,
        timerMinutes: 28,
        timerSeconds: 47,
        filterKeyword: ''
      };
    });
    return banners;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('market_campaigns');
        if (saved) {
          const parsed = JSON.parse(saved);
          const banners: any = {};
          parsed.forEach((c: any) => {
            banners[c.id] = {
              id: c.id,
              badge: {
                en: c.name || '',
                bn: c.nameBn || ''
              },
              title: {
                en: c.tagline || '',
                bn: c.taglineBn || ''
              },
              description: {
                en: c.description || '',
                bn: c.descriptionBn || ''
              },
              gradient: c.gradient || 'from-amber-500 via-orange-500 to-red-600',
              image: c.image || '',
              accentColor: c.accentColor || '#fb923c',
              isActive: c.isActive !== false,
              showBanner: c.showBanner !== false,
              showBadge: c.showBadge !== false,
              showImage: c.showImage !== false,
              showTagline: c.showTagline !== false,
              showDescription: c.showDescription !== false,
              adImage: c.adImage || '',
              showTimer: c.showTimer !== false,
              timerEndsAt: c.timerEndsAt || '',
              timerDays: c.timerDays !== undefined ? c.timerDays : 1,
              timerHours: c.timerHours !== undefined ? c.timerHours : 15,
              timerMinutes: c.timerMinutes !== undefined ? c.timerMinutes : 28,
              timerSeconds: c.timerSeconds !== undefined ? c.timerSeconds : 47,
              filterKeyword: c.filterKeyword || ''
            };
          });
          setDynamicCampaigns(banners);
        }
      } catch (e) {
        console.error('Error handling storage change:', e);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Selected subcategory or special filter tab

  // Handle active tab switching if the selected tab becomes deactivated
  useEffect(() => {
    const activeTabs = Object.entries(dynamicCampaigns)
      .filter(([_, value]: [string, any]) => value && value.isActive !== false)
      .map(([key]) => ({ id: key, isActive: true }));

    const isCurrentActive = activeTabs.some(t => t.id === activeTab);
    if (!isCurrentActive && activeTabs.length > 0) {
      setActiveTab(activeTabs[0].id as any);
    }
  }, [dynamicCampaigns, activeTab]);
  const [sortOption, setSortOption] = useState<'newest' | 'price-low' | 'price-high' | 'rating'>('newest');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('Dhaka');
  const [showLocationDropdown, setShowLocationDropdown] = useState<boolean>(false);
  
  // Custom states for Help Box
  const [showHelpChat, setShowHelpChat] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: 'আসসালামু আলাইকুম! অমরবাজার অনলাইন অ্যাসিস্ট্যান্ট-এ আপনাকে স্বাগতম। আপনি কি কোনো নির্দিষ্ট পণ্য খুঁজছেন?' }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState<boolean>(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');
  const [hoveredMainId, setHoveredMainId] = useState<string | null>(null);
  const [hoveredSubId, setHoveredSubId] = useState<string | null>(null);

  // Active campaigns list memo
  const activeCampaigns = useMemo(() => {
    return Object.entries(dynamicCampaigns)
      .filter(([key, value]: [string, any]) => value && value.isActive !== false && value.showBanner !== false)
      .map(([key, value]: [string, any]) => ({ key, ...value }));
  }, [dynamicCampaigns]);

  // Current active slide index for campaign banner carousel
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Sync current slide with the selected category tab
  useEffect(() => {
    const idx = activeCampaigns.findIndex(c => c.key === activeTab);
    if (idx !== -1) {
      setCurrentSlideIndex(idx);
    }
  }, [activeTab, activeCampaigns]);

  // Auto-scrolling interval for the campaign carousel (rolls to the left every 5 seconds)
  useEffect(() => {
    if (activeCampaigns.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % activeCampaigns.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeCampaigns]);

  // Districts for Location Selector
  const BANGLADESH_DISTRICTS = [
    'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Gazipur', 'Narayanganj', 'Comilla'
  ];

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let botResponse = 'দুঃখিত, আমি আপনার প্রশ্নটি ভালো করে বুঝতে পারিনি। অনুগ্রহ করে আমাদের হেল্পলাইন ১৬৪৬৯ নাম্বারে যোগাযোগ করুন।';
      const q = userMsg.toLowerCase();
      if (q.includes('honey') || q.includes('মধু')) {
        botResponse = 'আমাদের এখানে "Pure Khalisha Honey Sundarbans" স্টক আছে! এটি ১০০% অর্গানিক এবং সুন্দরবনের খাঁটি মধু।';
      } else if (q.includes('offer') || q.includes('ছাড়') || q.includes('discount')) {
        botResponse = 'ইউনিলিভার স্টক সেভ ফেস্টে সার্ফ এক্সেল, লাক্স ও অন্যান্য পণ্যে আকর্ষণীয় ক্যাশব্যাক ও বিশাল ছাড় চলছে!';
      } else if (q.includes('delivery') || q.includes('ডেলিভারি')) {
        botResponse = 'আমাদের ফাস্ট এক্সপ্রেস ডেলিভারির মাধ্যমে মাত্র ২ ঘণ্টায় আপনার ঠিকানায় পণ্য পৌঁছে যাবে!';
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 80000); // Fast simulation
    
    // Quick fallback
    setChatMessages(prev => [...prev, { sender: 'bot', text: 'আমি আপনার অনুরোধটি প্রসেস করছি... অনুগ্রহ করে একটু অপেক্ষা করুন।' }]);
  };

  // Helper to determine if a category is selected (supports mapping to DB categories)
  const isSidebarSelected = (mainCat: MainCategory) => {
    if (selectedCategory === mainCat.id) return true;
    return mainCat.subCategories?.some(sub => 
      selectedCategory === sub.id || 
      sub.subSubCategories?.some(subSub => selectedCategory === subSub.id)
    ) || false;
  };

  // Flat list of all category levels for simple search/filter integrations
  const flatCategories = useMemo(() => {
    const list: { id: string; name: string; nameBn: string; emoji: string }[] = [];
    
    // Add dynamically managed categories
    categories.forEach(cat => {
      list.push({ 
        id: cat.id, 
        name: cat.name, 
        nameBn: cat.nameBn || cat.name, 
        emoji: cat.emoji || '🛍️' 
      });
      cat.subcategories?.forEach(sub => {
        list.push({ 
          id: sub.id, 
          name: `${cat.name} → ${sub.name}`, 
          nameBn: `${cat.nameBn || cat.name} → ${sub.nameBn || sub.name}`, 
          emoji: cat.emoji || '🛍️' 
        });
      });
    });

    // Fallback if categories is still loading
    if (list.length === 0) {
      SHWAPNO_DETAILED_CATEGORIES.forEach(main => {
        list.push({ id: main.id, name: main.name, nameBn: main.nameBn, emoji: main.emoji });
        main.subCategories?.forEach(sub => {
          list.push({ id: sub.id, name: `${main.name} → ${sub.name}`, nameBn: `${main.nameBn} → ${sub.nameBn}`, emoji: main.emoji });
          sub.subSubCategories?.forEach(subSub => {
            list.push({ id: subSub.id, name: `${main.name} → ${sub.name} → ${subSub.name}`, nameBn: `${main.nameBn} → ${sub.nameBn} → ${subSub.nameBn}`, emoji: main.emoji });
          });
        });
      });
    }

    return list;
  }, [categories]);

  // Filtered and sorted products list
  const filteredProducts = useMemo(() => {
    let list = products.filter(p => p.isApproved !== false);

    // Filter by outlet/seller
    if (selectedSellerId) {
      list = list.filter(p => p.sellerId === selectedSellerId);
    }

    // Category filter
    if (selectedCategory) {
      list = list.filter(p => {
        // Direct category ID match
        if (p.categoryId === selectedCategory) return true;

        // Matching with active categories object (including subcategories & dynamic names)
        const activeCat = categories.find(c => c.id === selectedCategory);
        if (activeCat) {
          if (p.categoryId === activeCat.id) return true;
          if (p.categoryName && (p.categoryName.toLowerCase() === activeCat.name.toLowerCase() || p.categoryName.toLowerCase() === (activeCat.nameBn || '').toLowerCase())) return true;
          if (p.subCategory && activeCat.subcategories?.some(s => s.name.toLowerCase() === p.subCategory?.toLowerCase() || s.nameBn?.toLowerCase() === p.subCategory?.toLowerCase() || s.id === p.subCategory)) return true;
        }

        // Check if selectedCategory is a Subcategory ID across all categories
        for (const c of categories) {
          const sub = c.subcategories?.find(s => s.id === selectedCategory);
          if (sub) {
            if (p.categoryId === c.id) {
              const sNameEn = sub.name.toLowerCase();
              const sNameBn = (sub.nameBn || '').toLowerCase();
              const pSub = (p.subCategory || '').toLowerCase();
              const pSubId = ((p as any).subCategoryId || '').toLowerCase();
              if (pSub === sNameEn || pSub === sNameBn || pSubId === sub.id.toLowerCase()) return true;

              const titleCombined = (p.title + ' ' + (p.titleBn || '')).toLowerCase();
              const pTags = (p.tags || []).map(t => t.toLowerCase());
              // Match any key words of the subcategory
              const keywords = [...sNameEn.split(/[\s,&/]+/), ...sNameBn.split(/[\s,&/]+/)].filter(w => w.length > 2);
              if (keywords.some(k => titleCombined.includes(k) || pTags.some(t => t.includes(k)))) {
                return true;
              }
              // If no specific subcategory is tagged on product, still show products from this parent category
              return true;
            }
          }
        }

        // Custom child/grandchild matching to make it look 100% functional
        const nameLower = (p.title + ' ' + (p.titleBn || '') + ' ' + (p.categoryName || '') + ' ' + (p.subCategory || '') + ' ' + p.brand).toLowerCase();
        const tagsLower = (p.tags || []).map(t => t.toLowerCase()).join(' ');

        if (selectedCategory === 'cat-1' || selectedCategory === 'electronics') {
          return p.categoryId === 'cat-1' || tagsLower.includes('phone') || tagsLower.includes('laptop') || tagsLower.includes('gadget') || tagsLower.includes('smart') || nameLower.includes('phone') || nameLower.includes('laptop') || nameLower.includes('tv') || nameLower.includes('headphone') || nameLower.includes('watch');
        }
        if (selectedCategory === 'cat-2' || selectedCategory === 'clothing') {
          return p.categoryId === 'cat-2' || tagsLower.includes('clothing') || tagsLower.includes('panjabi') || tagsLower.includes('shirt') || tagsLower.includes('t-shirt') || nameLower.includes('panjabi') || nameLower.includes('shirt') || nameLower.includes('polo') || nameLower.includes('পোশাক');
        }
        if (selectedCategory === 'cat-3' || selectedCategory === 'saree-ethnic') {
          return p.categoryId === 'cat-3' || tagsLower.includes('saree') || tagsLower.includes('jamdani') || tagsLower.includes('silk') || nameLower.includes('saree') || nameLower.includes('শাড়ি') || nameLower.includes('jamdani') || nameLower.includes('কাতান');
        }
        if (selectedCategory === 'cat-4' || selectedCategory === 'grocery-products') {
          return p.categoryId === 'cat-4' || tagsLower.includes('oil') || tagsLower.includes('rice') || tagsLower.includes('honey') || tagsLower.includes('ghee') || nameLower.includes('oil') || nameLower.includes('চাল') || nameLower.includes('মধু') || nameLower.includes('ঘি') || nameLower.includes('তেল') || nameLower.includes('মসলা');
        }
        if (selectedCategory === 'cat-5' || selectedCategory === 'shoes') {
          return p.categoryId === 'cat-5' || tagsLower.includes('shoe') || tagsLower.includes('sandal') || tagsLower.includes('sneaker') || nameLower.includes('shoe') || nameLower.includes('জুতা') || nameLower.includes('sandal') || nameLower.includes('sneaker');
        }
        if (selectedCategory === 'cat-6' || selectedCategory === 'watches') {
          return p.categoryId === 'cat-6' || tagsLower.includes('watch') || nameLower.includes('watch') || nameLower.includes('ঘড়ি') || nameLower.includes('chronograph');
        }
        if (selectedCategory === 'cat-7' || selectedCategory === 'cosmetics') {
          return p.categoryId === 'cat-7' || tagsLower.includes('cosmetics') || tagsLower.includes('cream') || tagsLower.includes('lipstick') || nameLower.includes('lipstick') || nameLower.includes('cream') || nameLower.includes('sunscreen') || nameLower.includes('কসমেটিক্স');
        }
        if (selectedCategory === 'cat-8' || selectedCategory === 'baby-care') {
          return p.categoryId === 'cat-8' || tagsLower.includes('baby') || tagsLower.includes('diaper') || nameLower.includes('baby') || nameLower.includes('diaper') || nameLower.includes('ডায়াপার') || nameLower.includes('বেবি');
        }
        if (selectedCategory === 'cat-9' || selectedCategory === 'toys') {
          return p.categoryId === 'cat-9' || tagsLower.includes('toy') || tagsLower.includes('puzzle') || nameLower.includes('toy') || nameLower.includes('খেলনা') || nameLower.includes('lego') || nameLower.includes('puzzle');
        }
        if (selectedCategory === 'cat-10' || selectedCategory === 'sports') {
          return p.categoryId === 'cat-10' || tagsLower.includes('sports') || tagsLower.includes('cricket') || tagsLower.includes('football') || nameLower.includes('bat') || nameLower.includes('ball') || nameLower.includes('cricket') || nameLower.includes('football') || nameLower.includes('খেলাধুলা');
        }
        if (selectedCategory === 'cat-11' || selectedCategory === 'medicine') {
          return p.categoryId === 'cat-11' || tagsLower.includes('medicine') || tagsLower.includes('health') || tagsLower.includes('tablet') || nameLower.includes('napa') || nameLower.includes('seclo') || nameLower.includes('vitamin') || nameLower.includes('ওষুধ') || nameLower.includes('ঔষধ');
        }
        if (selectedCategory === 'cat-12' || selectedCategory === 'books') {
          return p.categoryId === 'cat-12' || tagsLower.includes('book') || tagsLower.includes('stationery') || nameLower.includes('book') || nameLower.includes('বই') || nameLower.includes('novel') || nameLower.includes('উপন্যাস');
        }

        // New Grocery & Daily Essential Categories
        if (selectedCategory === 'cat-spices' || selectedCategory === 'spices' || selectedCategory === 'groceries-spices') {
          return p.categoryId === 'cat-spices' || tagsLower.includes('spice') || tagsLower.includes('masala') || tagsLower.includes('turmeric') || tagsLower.includes('chili') || tagsLower.includes('cumin') || tagsLower.includes('coriander') || nameLower.includes('মসলা') || nameLower.includes('হলুদ') || nameLower.includes('মরিচ') || nameLower.includes('জিরা') || nameLower.includes('ধনিয়া') || nameLower.includes('এলাচ') || nameLower.includes('গরম মসলা');
        }
        if (selectedCategory === 'cat-honey' || selectedCategory === 'honey' || selectedCategory === 'organic-honey') {
          return p.categoryId === 'cat-honey' || tagsLower.includes('honey') || tagsLower.includes('মধু') || nameLower.includes('honey') || nameLower.includes('মধু') || nameLower.includes('সুন্দরবন') || nameLower.includes('খলিসা');
        }
        if (selectedCategory === 'cat-gur' || selectedCategory === 'gur' || selectedCategory === 'jaggery') {
          return p.categoryId === 'cat-gur' || tagsLower.includes('gur') || tagsLower.includes('jaggery') || tagsLower.includes('sugar') || nameLower.includes('গুড়') || nameLower.includes('পাটালি') || nameLower.includes('নলেন') || nameLower.includes('jaggery') || nameLower.includes('চিনি');
        }
        if (selectedCategory === 'cat-flour' || selectedCategory === 'flour' || selectedCategory === 'atta' || selectedCategory === 'maida') {
          return p.categoryId === 'cat-flour' || tagsLower.includes('atta') || tagsLower.includes('maida') || tagsLower.includes('flour') || tagsLower.includes('besan') || tagsLower.includes('suji') || nameLower.includes('আটা') || nameLower.includes('ময়দা') || nameLower.includes('সুজি') || nameLower.includes('বেসন') || nameLower.includes('flour');
        }
        if (selectedCategory === 'cat-chola' || selectedCategory === 'chola' || selectedCategory === 'chickpeas') {
          return p.categoryId === 'cat-chola' || tagsLower.includes('chola') || tagsLower.includes('chickpea') || tagsLower.includes('kabuli') || nameLower.includes('ছোলা') || nameLower.includes('বুট') || nameLower.includes('ডাবলি') || nameLower.includes('কাবলি') || nameLower.includes('মটর');
        }
        if (selectedCategory === 'cat-daal' || selectedCategory === 'daal' || selectedCategory === 'dal' || selectedCategory === 'lentils') {
          return p.categoryId === 'cat-daal' || tagsLower.includes('dal') || tagsLower.includes('daal') || tagsLower.includes('lentil') || tagsLower.includes('masoor') || tagsLower.includes('moong') || nameLower.includes('ডাল') || nameLower.includes('মসুর') || nameLower.includes('মুগ') || nameLower.includes('বুটের ডাল');
        }
        if (selectedCategory === 'cat-oil-ghee' || selectedCategory === 'oil-ghee' || selectedCategory === 'oil' || selectedCategory === 'ghee') {
          return p.categoryId === 'cat-oil-ghee' || tagsLower.includes('oil') || tagsLower.includes('ghee') || tagsLower.includes('mustard') || nameLower.includes('তেল') || nameLower.includes('ঘি') || nameLower.includes('সরিষা') || nameLower.includes('সয়াবিন') || nameLower.includes('গাওয়া ঘি');
        }
        if (selectedCategory === 'cat-rice' || selectedCategory === 'rice' || selectedCategory === 'grain-rice') {
          return p.categoryId === 'cat-rice' || tagsLower.includes('rice') || tagsLower.includes('chinigura') || tagsLower.includes('polao') || nameLower.includes('চাল') || nameLower.includes('পোলাও') || nameLower.includes('মিনিকেট') || nameLower.includes('নাজিরশাইল') || nameLower.includes('চিনিগুঁড়া');
        }
        if (selectedCategory === 'cat-tea-coffee' || selectedCategory === 'tea-coffee' || selectedCategory === 'tea') {
          return p.categoryId === 'cat-tea-coffee' || tagsLower.includes('tea') || tagsLower.includes('coffee') || nameLower.includes('চা') || nameLower.includes('কফি') || nameLower.includes('ispahani') || nameLower.includes('nescafe');
        }
        if (selectedCategory === 'cat-dry-fruits' || selectedCategory === 'dry-fruits' || selectedCategory === 'dry-fruits-nuts' || selectedCategory === 'dry-fruits-dates') {
          return p.categoryId === 'cat-dry-fruits' || tagsLower.includes('date') || tagsLower.includes('nut') || tagsLower.includes('cashew') || tagsLower.includes('almond') || nameLower.includes('খেজুর') || nameLower.includes('বাদাম') || nameLower.includes('আজওয়া') || nameLower.includes('কাজুবাদাম') || nameLower.includes('কাঠবাদাম');
        }
        if (selectedCategory === 'cat-dairy-milk' || selectedCategory === 'dairy-milk' || selectedCategory === 'milk') {
          return p.categoryId === 'cat-dairy-milk' || tagsLower.includes('milk') || tagsLower.includes('dairy') || tagsLower.includes('egg') || tagsLower.includes('butter') || tagsLower.includes('cheese') || nameLower.includes('দুধ') || nameLower.includes('ডিম') || nameLower.includes('মাখন') || nameLower.includes('পনির') || nameLower.includes('দই');
        }
        if (selectedCategory === 'cat-snacks' || selectedCategory === 'snacks-biscuits' || selectedCategory === 'snacks') {
          return p.categoryId === 'cat-snacks' || tagsLower.includes('snack') || tagsLower.includes('biscuit') || tagsLower.includes('cookie') || tagsLower.includes('chanachur') || tagsLower.includes('chips') || nameLower.includes('বিস্কুট') || nameLower.includes('চানাচুর') || nameLower.includes('চিপস') || nameLower.includes('নিমকি');
        }
        if (selectedCategory === 'cat-beverages' || selectedCategory === 'beverages') {
          return p.categoryId === 'cat-beverages' || tagsLower.includes('drink') || tagsLower.includes('juice') || tagsLower.includes('beverage') || nameLower.includes('শরবত') || nameLower.includes('জুস') || nameLower.includes('পানি') || nameLower.includes('কোকা') || nameLower.includes('পানীয়');
        }
        if (selectedCategory === 'cat-fruits' || selectedCategory === 'fresh-fruits') {
          return p.categoryId === 'cat-fruits' || tagsLower.includes('fruit') || nameLower.includes('ফল') || nameLower.includes('আম') || nameLower.includes('আপেল') || nameLower.includes('কলা') || nameLower.includes('মাল্টা') || nameLower.includes('বেদানা');
        }
        if (selectedCategory === 'cat-vegetables' || selectedCategory === 'fresh-vegetables' || selectedCategory === 'fruits-veg') {
          return p.categoryId === 'cat-vegetables' || tagsLower.includes('vegetable') || nameLower.includes('শাক') || nameLower.includes('সবজি') || nameLower.includes('আলু') || nameLower.includes('পেঁয়াজ') || nameLower.includes('রসুন') || nameLower.includes('টমেটো');
        }
        if (selectedCategory === 'cat-fish-meat' || selectedCategory === 'meat-fish' || selectedCategory === 'fresh-fish') {
          return p.categoryId === 'cat-fish-meat' || tagsLower.includes('meat') || tagsLower.includes('fish') || tagsLower.includes('chicken') || tagsLower.includes('beef') || nameLower.includes('মাছ') || nameLower.includes('মাংস') || nameLower.includes('মুরগি') || nameLower.includes('খাসি') || nameLower.includes('গরু') || nameLower.includes('ইলিশ');
        }
        if (selectedCategory === 'cat-cleaning' || selectedCategory === 'home-cleaning') {
          return p.categoryId === 'cat-cleaning' || tagsLower.includes('cleaning') || tagsLower.includes('detergent') || tagsLower.includes('soap') || nameLower.includes('ডিটারজেন্ট') || nameLower.includes('সার্ফ এক্সেল') || nameLower.includes('পরিষ্কার') || nameLower.includes('সাবান') || nameLower.includes('হারপিক');
        }
        if (selectedCategory === 'cat-kitchen' || selectedCategory === 'home-kitchen') {
          return p.categoryId === 'cat-kitchen' || tagsLower.includes('kitchen') || tagsLower.includes('cooker') || tagsLower.includes('blender') || nameLower.includes('চুলা') || nameLower.includes('ব্লেন্ডার') || nameLower.includes('রান্নাঘর') || nameLower.includes('ফ্রাই প্যান') || nameLower.includes('কুকার');
        }

        if (selectedCategory === 'combo-deals' || selectedCategory === 'combo-package-builder') {
          return p.categoryId === 'combo-deals' || 
                 tagsLower.includes('combo') || tagsLower.includes('package') || tagsLower.includes('bundle') || tagsLower.includes('deal') ||
                 nameLower.includes('combo') || nameLower.includes('package') || nameLower.includes('bundle') || nameLower.includes('কম্বো') || nameLower.includes('প্যাকেজ') || nameLower.includes('অফার') || nameLower.includes('প্যাক') || nameLower.includes('duo');
        }
        if (selectedCategory === 'fast-food') {
          return p.categoryId === 'fast-food' ||
                 tagsLower.includes('fast food') || tagsLower.includes('burger') || tagsLower.includes('wings') || tagsLower.includes('fries') ||
                 nameLower.includes('burger') || nameLower.includes('fast food') || nameLower.includes('fried chicken') || nameLower.includes('wings') || nameLower.includes('french fries') || nameLower.includes('বার্গার') || nameLower.includes('ফাস্টফুড') || nameLower.includes('ফ্রাই');
        }
        if (selectedCategory === 'pizza-pasta') {
          return p.categoryId === 'pizza-pasta' ||
                 tagsLower.includes('pizza') || tagsLower.includes('pasta') ||
                 nameLower.includes('pizza') || nameLower.includes('pasta') || nameLower.includes('spaghetti') || nameLower.includes('alfredo') || nameLower.includes('পিজ্জা') || nameLower.includes('পাস্তা');
        }
        if (selectedCategory === 'cakes-pastry') {
          return p.categoryId === 'cakes-pastry' ||
                 tagsLower.includes('cake') || tagsLower.includes('pastry') || tagsLower.includes('bakery') ||
                 nameLower.includes('cake') || nameLower.includes('pastry') || nameLower.includes('cupcake') || nameLower.includes('birthday cake') || nameLower.includes('কেক') || nameLower.includes('পেস্ট্রি');
        }
        if (selectedCategory === 'sweets-desserts') {
          return p.categoryId === 'sweets-desserts' ||
                 tagsLower.includes('sweet') || tagsLower.includes('misti') || tagsLower.includes('dessert') ||
                 nameLower.includes('sweet') || nameLower.includes('misti') || nameLower.includes('chomchom') || nameLower.includes('rosogolla') || nameLower.includes('laddu') || nameLower.includes('barfi') || nameLower.includes('মিষ্টি') || nameLower.includes('চমচম') || nameLower.includes('রসগোল্লা') || nameLower.includes('লাড্ডু');
        }
        if (selectedCategory === 'restaurant-meals') {
          return p.categoryId === 'restaurant-meals' ||
                 tagsLower.includes('biryani') || tagsLower.includes('kacchi') || tagsLower.includes('restaurant') || tagsLower.includes('meal') ||
                 nameLower.includes('biryani') || nameLower.includes('kacchi') || nameLower.includes('khichuri') || nameLower.includes('platter') || nameLower.includes('kebab') || nameLower.includes('বিরিয়ানি') || nameLower.includes('কাচ্চি') || nameLower.includes('খিচুড়ি') || nameLower.includes('খাবার');
        }
        if (selectedCategory === 'ice-cream') {
          return tagsLower.includes('ice cream') || nameLower.includes('ice cream') || nameLower.includes('icecream') || nameLower.includes('kulfi') || nameLower.includes('আইসক্রিম') || nameLower.includes('কুলফি');
        }
        if (selectedCategory === 'chocolates-candy') {
          return tagsLower.includes('chocolate') || tagsLower.includes('candy') || nameLower.includes('chocolate') || nameLower.includes('candy') || nameLower.includes('চকলেট') || nameLower.includes('ক্যান্ডি');
        }
        if (selectedCategory === 'fruits-veg') {
          return p.categoryId === 'cat-3' && (
            p.tags?.some(t => t.toLowerCase().includes('fruit') || t.toLowerCase().includes('vegetable') || t.toLowerCase().includes('fresh')) ||
            nameLower.includes('carrot') || nameLower.includes('tomato') || nameLower.includes('onion') || nameLower.includes('potato') ||
            nameLower.includes('chili') || nameLower.includes('cucumber') || nameLower.includes('pepe') || nameLower.includes('dherosh') ||
            nameLower.includes('gourd') || nameLower.includes('শাক') || nameLower.includes('সবজি') || nameLower.includes('ফল') || nameLower.includes('lady finger')
          );
        }
        if (selectedCategory === 'fresh-fruits') {
          return p.categoryId === 'cat-3' && (
            p.tags?.some(t => t.toLowerCase().includes('fruit')) ||
            nameLower.includes('mango') || nameLower.includes('banana') || nameLower.includes('apple') || nameLower.includes('orange') ||
            nameLower.includes('ফল') || nameLower.includes('আম') || nameLower.includes('কলা') || nameLower.includes('মধু') || nameLower.includes('honey')
          );
        }
        if (selectedCategory === 'fresh-vegetables') {
          return p.categoryId === 'cat-3' && (
            p.tags?.some(t => t.toLowerCase().includes('vegetable')) ||
            nameLower.includes('carrot') || nameLower.includes('tomato') || nameLower.includes('onion') || nameLower.includes('garlic') ||
            nameLower.includes('ginger') || nameLower.includes('chili') || nameLower.includes('pepe') || nameLower.includes('chichinga') ||
            nameLower.includes('dherosh') || nameLower.includes('cucumber') || nameLower.includes('সবজি') || nameLower.includes('শাক') || nameLower.includes('lady finger')
          );
        }
        if (selectedCategory === 'dry-fruits') {
          return p.categoryId === 'cat-3' && (nameLower.includes('dry') || nameLower.includes('nuts') || nameLower.includes('dates') || nameLower.includes('খেজুর'));
        }
        if (selectedCategory === 'meat-fish') {
          return p.categoryId === 'cat-3' && (
            p.tags?.some(t => t.toLowerCase().includes('fish') || t.toLowerCase().includes('meat') || t.toLowerCase().includes('chicken')) ||
            nameLower.includes('chicken') || nameLower.includes('fish') || nameLower.includes('meat') || nameLower.includes('beef') ||
            nameLower.includes('mutton') || nameLower.includes('মাছ') || nameLower.includes('মাংস') || nameLower.includes('মুরগি')
          );
        }
        if (selectedCategory === 'chicken') {
          return p.categoryId === 'cat-3' && (nameLower.includes('chicken') || nameLower.includes('মুরগি') || nameLower.includes('পোল্ট্রি'));
        }
        if (selectedCategory === 'beef-mutton') {
          return p.categoryId === 'cat-3' && (nameLower.includes('beef') || nameLower.includes('mutton') || nameLower.includes('গরু') || nameLower.includes('খাসি'));
        }
        if (selectedCategory === 'fresh-fish') {
          return p.categoryId === 'cat-3' && (nameLower.includes('fish') || nameLower.includes('মাছ'));
        }
        if (selectedCategory === 'eggs') {
          return p.categoryId === 'cat-3' && (nameLower.includes('egg') || nameLower.includes('ডিম'));
        }
        if (selectedCategory === 'baby-food' || selectedCategory === 'baby-care') {
          return (p.categoryId === 'cat-3' || p.categoryId === 'baby-food' || p.categoryId === 'cat-10') && (nameLower.includes('baby') || nameLower.includes('cerelac') || nameLower.includes('nestle') || nameLower.includes('দুধ') || nameLower.includes('lactogen') || nameLower.includes('diaper') || nameLower.includes('ডায়াপার'));
        }
        if (selectedCategory === 'diapers') {
          return nameLower.includes('diaper') || nameLower.includes('pampers') || nameLower.includes('ডায়াপার');
        }
        if (selectedCategory === 'home-cleaning') {
          return (p.categoryId === 'cat-4' || p.categoryId === 'home-cleaning') && (
            nameLower.includes('clean') || nameLower.includes('wash') || nameLower.includes('detergent') ||
            nameLower.includes('surf excel') || nameLower.includes('soap') || nameLower.includes('lux') ||
            nameLower.includes('পরিষ্কার')
          );
        }
        if (selectedCategory === 'pet-care') {
          return nameLower.includes('pet') || nameLower.includes('dog') || nameLower.includes('cat') || nameLower.includes('whiskas') || nameLower.includes('খাবার');
        }
        if (selectedCategory === 'stationeries' || selectedCategory === 'cat-12') {
          return p.categoryId === 'cat-12' || nameLower.includes('pen') || nameLower.includes('notebook') || nameLower.includes('pencil') || nameLower.includes('paper') || nameLower.includes('book') || nameLower.includes('বই') || nameLower.includes('খাতা') || nameLower.includes('কলম');
        }
        if (selectedCategory === 'toys-sports' || selectedCategory === 'cat-10') {
          return p.categoryId === 'cat-10' || nameLower.includes('toy') || nameLower.includes('ball') || nameLower.includes('cricket') || nameLower.includes('football') || nameLower.includes('খেলনা');
        }
        if (selectedCategory === 'dry-fruits-nuts') {
          return p.categoryId === 'cat-3' && (nameLower.includes('nuts') || nameLower.includes('বাদাম') || nameLower.includes('cashew') || nameLower.includes('almond') || nameLower.includes('কাঠবাদাম'));
        }
        if (selectedCategory === 'dry-fruits-dates') {
          return p.categoryId === 'cat-3' && (nameLower.includes('dates') || nameLower.includes('খেজুর') || nameLower.includes('khejur') || nameLower.includes('mariam') || nameLower.includes('ajwa'));
        }
        if (selectedCategory === 'grain-rice') {
          return p.categoryId === 'cat-3' && (nameLower.includes('rice') || nameLower.includes('চাল') || nameLower.includes('chal') || nameLower.includes('miniket') || nameLower.includes('chinigura') || nameLower.includes('নাজিরশাইল'));
        }
        if (selectedCategory === 'organic-honey') {
          return p.categoryId === 'cat-3' && (nameLower.includes('honey') || nameLower.includes('মধু') || nameLower.includes('madhu'));
        }
        if (selectedCategory === 'oil-ghee') {
          return p.categoryId === 'cat-3' && (nameLower.includes('oil') || nameLower.includes('ghee') || nameLower.includes('তেল') || nameLower.includes('ঘি') || nameLower.includes('mustard'));
        }
        if (selectedCategory === 'groceries-spices') {
          return p.categoryId === 'cat-7' || (p.categoryId === 'cat-3' && (nameLower.includes('spice') || nameLower.includes('মসলা') || nameLower.includes('হলুদ') || nameLower.includes('মরিচ') || nameLower.includes('ধনিয়া') || nameLower.includes('জিরা') || nameLower.includes('powder')));
        }
        if (selectedCategory === 'dairy-milk') {
          return p.categoryId === 'cat-3' && (nameLower.includes('milk') || nameLower.includes('dairy') || nameLower.includes('butter') || nameLower.includes('cheese') || nameLower.includes('দুধ') || nameLower.includes('মাখন') || nameLower.includes('পনির') || nameLower.includes('দই') || nameLower.includes('yogurt'));
        }
        if (selectedCategory === 'tea-coffee') {
          return p.categoryId === 'cat-3' && (nameLower.includes('tea') || nameLower.includes('coffee') || nameLower.includes('চা') || nameLower.includes('কফি') || nameLower.includes('ispahani') || nameLower.includes('nescafe'));
        }
        if (selectedCategory === 'snacks-biscuits') {
          return p.categoryId === 'cat-3' && (nameLower.includes('biscuit') || nameLower.includes('cookie') || nameLower.includes('snacks') || nameLower.includes('chips') || nameLower.includes('চিপস') || nameLower.includes('বিস্কুট') || nameLower.includes('চানাচুর') || nameLower.includes('chanachur'));
        }
        if (selectedCategory === 'beverages') {
          return p.categoryId === 'cat-3' && (nameLower.includes('juice') || nameLower.includes('drink') || nameLower.includes('water') || nameLower.includes('soda') || nameLower.includes('কোকা') || nameLower.includes('পানি') || nameLower.includes('জুস'));
        }
        if (selectedCategory === 'cat-fast-food' || selectedCategory === 'fast-food') {
          return p.categoryId === 'cat-fast-food' || tagsLower.includes('fast food') || tagsLower.includes('burger') || tagsLower.includes('wings') || tagsLower.includes('fries') || nameLower.includes('burger') || nameLower.includes('fast food') || nameLower.includes('fried chicken') || nameLower.includes('wings') || nameLower.includes('french fries') || nameLower.includes('বার্গার') || nameLower.includes('ফাস্টফুড') || nameLower.includes('ফ্রাই');
        }
        if (selectedCategory === 'cat-pizza-pasta' || selectedCategory === 'pizza-pasta') {
          return p.categoryId === 'cat-pizza-pasta' || tagsLower.includes('pizza') || tagsLower.includes('pasta') || nameLower.includes('pizza') || nameLower.includes('pasta') || nameLower.includes('spaghetti') || nameLower.includes('alfredo') || nameLower.includes('পিজ্জা') || nameLower.includes('পাস্তা');
        }
        if (selectedCategory === 'cat-bakery' || selectedCategory === 'bakery' || selectedCategory === 'cakes-pastry') {
          return p.categoryId === 'cat-bakery' || (p.categoryId === 'cat-3' || p.categoryId === 'cakes-pastry') && (nameLower.includes('bread') || nameLower.includes('cake') || nameLower.includes('bun') || nameLower.includes('কেক') || nameLower.includes('পাউরুটি') || nameLower.includes('মিষ্টি') || nameLower.includes('sweet'));
        }
        if (selectedCategory === 'cat-frozen' || selectedCategory === 'frozen-food' || selectedCategory === 'frozen-foods') {
          return p.categoryId === 'cat-frozen' || nameLower.includes('frozen') || nameLower.includes('nugget') || nameLower.includes('পরাটা') || nameLower.includes('পরোটা') || nameLower.includes('সসেজ') || nameLower.includes('সমুচা');
        }
        if (selectedCategory === 'cat-combo' || selectedCategory === 'combo-deals' || selectedCategory === 'combo-package-builder') {
          return p.categoryId === 'cat-combo' || Boolean(p.isCombo) || tagsLower.includes('combo') || tagsLower.includes('package') || tagsLower.includes('bundle') || tagsLower.includes('deal') || nameLower.includes('combo') || nameLower.includes('package') || nameLower.includes('bundle') || nameLower.includes('কম্বো') || nameLower.includes('প্যাকেজ') || nameLower.includes('অফার');
        }
        if (selectedCategory === 'cat-pet-care' || selectedCategory === 'pet-care') {
          return p.categoryId === 'cat-pet-care' || nameLower.includes('pet') || nameLower.includes('dog') || nameLower.includes('cat') || nameLower.includes('whiskas') || nameLower.includes('খাবার') || nameLower.includes('বিড়াল');
        }
        if (selectedCategory === 'cat-gardening' || selectedCategory === 'gardening') {
          return p.categoryId === 'cat-gardening' || (p.categoryId === 'cat-4' && (nameLower.includes('plant') || nameLower.includes('seed') || nameLower.includes('soil') || nameLower.includes('টব') || nameLower.includes('বীজ') || nameLower.includes('গাছ')));
        }
        if (selectedCategory === 'cat-automotive' || selectedCategory === 'automotive') {
          return p.categoryId === 'cat-automotive' || (p.categoryId === 'cat-1' || p.categoryId === 'automotive') && (nameLower.includes('car') || nameLower.includes('bike') || nameLower.includes('charger') || nameLower.includes('holder') || nameLower.includes('গাড়ি') || nameLower.includes('বাইক'));
        }
        if (selectedCategory === 'sports-fitness' || selectedCategory === 'cat-10') {
          return (p.categoryId === 'cat-10' || p.categoryId === 'sports-fitness') && (nameLower.includes('sport') || nameLower.includes('bat') || nameLower.includes('ball') || nameLower.includes('cricket') || nameLower.includes('jersey') || nameLower.includes('খেলাধূলা'));
        }
        if (selectedCategory === 'sarees-ethnic') {
          return p.categoryId === 'cat-2' && (nameLower.includes('saree') || nameLower.includes('panjabi') || nameLower.includes('kurta') || nameLower.includes('শাড়ি') || nameLower.includes('পাঞ্জাবি') || nameLower.includes('সালোয়ার'));
        }
        if (selectedCategory === 'pickles-sauces') {
          return p.categoryId === 'cat-3' && (nameLower.includes('pickle') || nameLower.includes('sauce') || nameLower.includes('ketchup') || nameLower.includes('আচার') || nameLower.includes('সস'));
        }
        if (selectedCategory === 'home-kitchen') {
          return p.categoryId === 'cat-4' && (nameLower.includes('cooker') || nameLower.includes('blender') || nameLower.includes('kitchen') || nameLower.includes('pan') || nameLower.includes('চুলা') || nameLower.includes('ব্লেন্ডার'));
        }
        if (selectedCategory === 'watch-accessories') {
          return nameLower.includes('watch') || nameLower.includes('smartwatch') || nameLower.includes('ঘড়ি') || nameLower.includes('sunglass') || nameLower.includes('চশমা');
        }

        // Generic fallback: direct match on categoryId or categoryName
        if (selectedCategory && (p.categoryId === selectedCategory || p.categoryName?.toLowerCase() === selectedCategory.toLowerCase())) {
          return true;
        }

        return false;
      });
    }

    // Custom search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) || 
        (p.titleBn && p.titleBn.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (Array.isArray(p.tags) && p.tags.some(t => t && t.toLowerCase().includes(q)))
      );
    }

    // Special Filter Tabs
    const campaignData = dynamicCampaigns[activeTab];
    if (campaignData) {
      const keyword = (campaignData.filterKeyword || '').toLowerCase().trim();
      if (keyword) {
        list = list.filter(p => 
          (p.title && p.title.toLowerCase().includes(keyword)) || 
          (p.titleBn && p.titleBn.toLowerCase().includes(keyword)) ||
          (p.brand && p.brand.toLowerCase().includes(keyword)) ||
          (Array.isArray(p.tags) && p.tags.some(t => t && t.toLowerCase().includes(keyword))) ||
          (p.categoryId && p.categoryId.toLowerCase().includes(keyword))
        );
      } else {
        // Fallback default campaign logic
        if (activeTab === 'all') {
          // Show all products on the home page as requested, do not filter out products
        } else if (activeTab === 'unilever') {
          // UNILEVER-STOCK & SAVE: Only show Unilever brand items
          list = list.filter(p => (p.brand || '').toLowerCase() === 'unilever');
        } else if (activeTab === 'bogo') {
          // GREAT DEALS: Premium electronics and traditional boutique sarees with high value discounts
          list = list.filter(p => p.discountPrice && (p.price - p.discountPrice) >= 500);
        } else if (activeTab === 'summer') {
          // BUY & SAVE MORE: Household kitchen and organic pantry sizes (honey, oil, staples)
          list = list.filter(p => ['sundarbans pure', 'kather ghani bd'].includes((p.brand || '').toLowerCase()) || (Array.isArray(p.tags) && (p.tags.includes('grocery') || p.tags.includes('organic'))));
        } else {
          // For any custom newly created campaign where keyword was cleared,
          // let's fallback to matching keywords based on its badge/name to prevent empty state
          const label = (campaignData.badge?.en || '').toLowerCase();
          if (label.includes('gadget') || label.includes('tech') || label.includes('tv') || label.includes('phone')) {
            list = list.filter(p => Array.isArray(p.tags) && (p.tags.includes('gadget') || p.tags.includes('walton') || p.tags.includes('samsung')));
          } else if (label.includes('fashion') || label.includes('saree') || label.includes('panjabi') || label.includes('clothing')) {
            list = list.filter(p => Array.isArray(p.tags) && (p.tags.includes('saree') || p.tags.includes('panjabi') || p.tags.includes('menswear')));
          } else if (label.includes('beauty') || label.includes('soap') || label.includes('shampoo')) {
            list = list.filter(p => Array.isArray(p.tags) && (p.tags.includes('beauty') || p.tags.includes('soap') || p.tags.includes('shampoo')));
          } else if (label.includes('drink') || label.includes('tea') || label.includes('beverage')) {
            list = list.filter(p => Array.isArray(p.tags) && (p.tags.includes('drinks') || p.tags.includes('beverage') || p.tags.includes('summer')));
          } else if (label.includes('shoe') || label.includes('leather') || label.includes('footwear')) {
            list = list.filter(p => Array.isArray(p.tags) && (p.tags.includes('shoes') || p.tags.includes('leather')));
          } else {
            // Default fallback if no match found: show featured/popular products
            list = list.filter(p => p.isFeatured || p.isFlashDeal || p.price < 5000);
          }
        }
      }
    }

    // Sorting Option
    if (sortOption === 'price-low') {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortOption === 'price-high') {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortOption === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [products, selectedCategory, searchQuery, activeTab, sortOption, selectedSellerId]);

  // Helper to get item count in cart
  const getProductCartItem = (productId: string) => {
    return cart.find(item => item.product.id === productId);
  };

  // Helper to format discount text beautifully
  const getDiscountBadgeText = (p: Product) => {
    if (!p.discountPrice) return null;
    const saving = p.price - p.discountPrice;
    if (language === 'bn') {
      return `${formatPrice(saving)} ছাড়`;
    }
    return `${formatPrice(saving)} OFF`;
  };

  return (
    <div className="pb-16 font-sans select-none text-slate-900 dark:text-slate-100">
      
      {selectedSellerId && (
        <div className="mb-6 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/25 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                {language === 'bn' ? 'আউটলেট ফিল্টার সক্রিয়' : 'Outlet Filter Active'}
              </p>
              <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
                {language === 'bn' 
                  ? `আপনি বর্তমানে ${selectedSellerName} এর পণ্যসমূহ দেখছেন` 
                  : `Currently viewing products from ${selectedSellerName}`}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActivePanel('outlets')}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {language === 'bn' ? 'অন্যান্য আউটলেট' : 'Other Outlets'}
            </button>
            <button
              onClick={() => setSelectedSellerId(null)}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#da1c24] text-white hover:bg-red-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {language === 'bn' ? 'ফিল্টার মুছুন' : 'Clear Filter'}
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN AREA (Shwapno Campaigns & Product Section) */}
      <div className="w-full space-y-6">

        {/* MAIN SHWAPNO CAMPAIGN & PRODUCT SECTION */}
        <div className="space-y-6">


          {/* Grouping Carousel and Sorting/Filters Bar tightly together */}
          <div className="space-y-3">
            {/* 4. MULTI-SLIDE AUTO-SCROLLING CAMPAIGN CAROUSEL */}
            {activeCampaigns.length > 0 ? (
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800/60 group bg-slate-950">
                {/* Slides Track */}
                <div 
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ 
                    transform: `translateX(-${(currentSlideIndex * 100) / activeCampaigns.length}%)`,
                    width: `${activeCampaigns.length * 100}%`
                  }}
                >
                  {activeCampaigns.map((slide: any) => (
                    <div 
                      key={slide.key}
                      className="shrink-0 relative bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white px-3.5 py-2.5 sm:px-5 sm:py-3.5 md:px-6 md:py-4 transition-all duration-500"
                      style={{ width: `${100 / activeCampaigns.length}%` }}
                    >
                      {/* Soft decorative background elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-xl -ml-16 -mb-16 pointer-events-none" />
                      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30 pointer-events-none" />

                      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
                        
                        {/* Campaign Highlights */}
                        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                          {/* Decorative Campaign Banner Image */}
                          {slide.showImage !== false && (
                            <div className="hidden sm:block w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-lg border-2 border-white/25 shrink-0 bg-white/10">
                              <img 
                                src={slide.image || 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80'} 
                                alt="Campaign Asset" 
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}

                          <div className="space-y-1 sm:space-y-2 max-w-[68%] xs:max-w-[75%] sm:max-w-none">
                            <div className="flex flex-wrap items-center gap-2">
                              {slide.showBadge !== false && (
                                <div className="inline-flex items-center space-x-1 bg-[#f6a51d] text-slate-950 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm">
                                  <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-950 animate-bounce" />
                                  <span>{language === 'bn' ? slide.badge.bn : slide.badge.en}</span>
                                </div>
                              )}

                              {/* Clickable Action tag to trigger campaign active tab */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTab(slide.key);
                                }}
                                className="inline-flex items-center space-x-1 px-2 py-0.5 sm:py-1 bg-white/20 hover:bg-white/35 text-white font-bold text-[9px] sm:text-[10px] rounded-full transition cursor-pointer"
                              >
                                <span>{language === 'bn' ? 'পণ্যসমূহ দেখুন' : 'View Products'}</span>
                                <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </button>
                            </div>

                            {slide.showTagline !== false && (
                              <h2 className="text-sm xs:text-base sm:text-xl md:text-2xl font-black tracking-tight leading-tight">
                                {language === 'bn' ? slide.title.bn : slide.title.en}
                              </h2>
                            )}

                            {slide.showDescription !== false && (
                              <p className="hidden sm:block text-white/95 text-xs leading-relaxed font-medium max-w-xl">
                                {language === 'bn' ? slide.description.bn : slide.description.en}
                              </p>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Countdown Ticker Box */}
                      {slide.showTimer !== false && (
                        <CampaignTimer 
                          campaign={slide} 
                          campaignKey={slide.key} 
                          language={language} 
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Slider Controls (Left / Right Arrows) - Only visible on hover of the banner */}
                {activeCampaigns.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlideIndex((prev) => (prev - 1 + activeCampaigns.length) % activeCampaigns.length);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-105 cursor-pointer z-20"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlideIndex((prev) => (prev + 1) % activeCampaigns.length);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-105 cursor-pointer z-20"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {/* Indicator Dots at the Bottom */}
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex space-x-1.5 z-20">
                      {activeCampaigns.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentSlideIndex(idx);
                          }}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === currentSlideIndex 
                              ? 'bg-white w-4 sm:w-5' 
                              : 'bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              dynamicCampaigns[activeTab]?.adImage ? (
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 transition-all duration-500 max-h-[360px] bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                  <img 
                    src={dynamicCampaigns[activeTab]?.adImage} 
                    alt="Advertisement" 
                    className="w-full h-auto max-h-[360px] object-contain rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {language === 'bn' ? 'স্পন্সরড বিজ্ঞাপন' : 'Sponsored Ad'}
                  </div>
                </div>
              ) : null
            )}

            {/* 6. SLEEK CIRCULAR AUTO-SCROLLING CATEGORY ROW (All Categories with Seamless Marquee) */}
            <div 
              className="w-full bg-slate-50/90 dark:bg-slate-950/40 rounded-xl py-1.5 px-2 border border-slate-200/60 dark:border-slate-800/80 shadow-xs flex flex-col relative overflow-hidden group/catbar"
              onMouseEnter={() => { isHoveredRef.current = true; }}
              onMouseLeave={() => { 
                isHoveredRef.current = false; 
                isDraggingRef.current = false;
              }}
              onTouchStart={() => { isHoveredRef.current = true; }}
              onTouchEnd={() => { isHoveredRef.current = false; }}
            >
              {/* Left Scroll Navigation Button */}
              <button 
                type="button"
                onClick={() => scrollCategory('left')}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hidden md:flex items-center justify-center opacity-0 group-hover/catbar:opacity-100 hover:bg-[#da1c24] hover:text-white hover:border-[#da1c24] transition-all duration-200"
                title={language === 'bn' ? 'বামে স্ক্রোল করুন' : 'Scroll Left'}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Right Scroll Navigation Button */}
              <button 
                type="button"
                onClick={() => scrollCategory('right')}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hidden md:flex items-center justify-center opacity-0 group-hover/catbar:opacity-100 hover:bg-[#da1c24] hover:text-white hover:border-[#da1c24] transition-all duration-200"
                title={language === 'bn' ? 'ডানে স্ক্রোল করুন' : 'Scroll Right'}
              >
                <ChevronRight size={16} />
              </button>

              {/* Horizontal Endless Auto-Scrolling Row */}
              <div 
                ref={categoryRowRef}
                className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-0.5 cursor-grab active:cursor-grabbing select-none"
                onMouseDown={(e) => {
                  isDraggingRef.current = true;
                  isHoveredRef.current = true;
                  startXRef.current = e.pageX - (categoryRowRef.current?.offsetLeft || 0);
                  scrollLeftRef.current = categoryRowRef.current?.scrollLeft || 0;
                }}
                onMouseMove={(e) => {
                  if (!isDraggingRef.current || !categoryRowRef.current) return;
                  e.preventDefault();
                  const x = e.pageX - (categoryRowRef.current.offsetLeft || 0);
                  const walk = (x - startXRef.current) * 1.5;
                  categoryRowRef.current.scrollLeft = scrollLeftRef.current - walk;
                }}
                onMouseUp={() => {
                  isDraggingRef.current = false;
                }}
              >
                {(() => {
                  const dynamicCategoryItems = allCategoriesList.map(c => ({
                    id: c.id,
                    emoji: c.emoji || (CATEGORY_EMOJIS[c.id] || '🛍️'),
                    name: c.name,
                    nameBn: c.nameBn || c.name
                  }));

                  const allItems = [
                    { id: null, emoji: '🛍️', name: 'All', nameBn: 'সব পণ্য' },
                    ...dynamicCategoryItems
                  ];

                  // Duplicate array for seamless endless marquee looping
                  const duplicatedList = [...allItems, ...allItems];

                  return duplicatedList.map((item, idx) => {
                    const isSelected = selectedCategory === item.id;
                    const displayName = language === 'bn' ? item.nameBn : item.name;

                    return (
                      <button
                        key={`${item.id ?? 'all'}-${idx}`}
                        onClick={() => setSelectedCategory(isSelected && item.id !== null ? null : item.id)}
                        className="flex flex-col items-center justify-center shrink-0 w-[58px] sm:w-[68px] cursor-pointer group focus:outline-none transition-transform"
                        title={displayName}
                      >
                        {/* Compact Circular Icon */}
                        <div className={`w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg transition-all duration-200 relative ${
                          isSelected 
                            ? 'bg-[#da1c24] text-white ring-2 ring-[#da1c24]/40 ring-offset-1 dark:ring-offset-slate-900 scale-110 shadow-md' 
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 group-hover:border-red-300 group-hover:scale-105 group-hover:shadow-xs'
                        }`}>
                          {item.emoji}
                        </div>
                        {/* Clean Small Category Label */}
                        <span className={`text-[9px] sm:text-[10px] text-center mt-1 w-full truncate px-0.5 select-none transition-colors duration-200 leading-tight ${
                          isSelected ? 'text-[#da1c24] font-black' : 'text-slate-600 dark:text-slate-300 font-medium group-hover:text-[#da1c24]'
                        }`}>
                          {displayName}
                        </span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* SORTING BAR (THIN & COMPACT) */}
            <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 py-1 px-3 rounded-full border border-slate-200 dark:border-slate-800/85 shadow-xs">
              <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-1">
                {language === 'bn' ? 'সর্টিং ফিল্টার:' : 'Sort Options:'}
              </span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'newest', label: 'Newest', labelBn: 'নতুনত্ব' },
                  { id: 'price-low', label: 'Price asc', labelBn: 'মূল্য: কম' },
                  { id: 'price-high', label: 'Price desc', labelBn: 'মূল্য: বেশি' },
                  { id: 'rating', label: 'Rating', labelBn: 'জনপ্রিয়তা' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortOption(opt.id as any)}
                    className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black transition-all duration-200 cursor-pointer ${
                      sortOption === opt.id
                        ? 'bg-[#da1c24] text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {language === 'bn' ? opt.labelBn : opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 7. PRODUCTS GRID */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300">
                {language === 'bn' ? 'কোন পণ্য পাওয়া যায়নি।' : 'No products found matching the criteria.'}
              </h3>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setActiveTab('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#da1c24] hover:bg-red-700 text-white font-bold text-xs rounded-xl transition"
              >
                {language === 'bn' ? 'সব পণ্য পুনরায় দেখুন' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-2.5 lg:gap-3">
              {filteredProducts.map((p) => {
                const isWish = wishlist.includes(p.id);
                const price = p.discountPrice || p.price;
                const cartItem = getProductCartItem(p.id);
                const discountText = getDiscountBadgeText(p);

                return (
                  <div
                    key={p.id}
                    onClick={() => onOpenProduct(p)}
                    className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 hover:shadow-md hover:border-[#da1c24]/30 dark:hover:border-[#da1c24]/30 transition-all duration-200 flex flex-col relative overflow-hidden cursor-pointer"
                  >
                    
                    {/* Delivery Time & Image Block */}
                    <div className="relative w-full aspect-square overflow-hidden bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/50">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />

                      {/* Red Ribbon Discount Badge - Deal Badge like the screenshot */}
                      {discountText && (
                        <span className="absolute top-2 left-0 bg-linear-to-r from-red-600 to-orange-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-r-md shadow-xs z-10 flex items-center gap-0.5">
                          🔥 {language === 'bn' ? 'ডিল' : 'Deal'}
                        </span>
                      )}

                      {/* Combo Pack Badge */}
                      {p.isCombo && (
                        <span className={`absolute bg-amber-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded-r-md shadow-xs z-10 ${
                          discountText ? 'top-8 left-0' : 'top-2 left-0'
                        }`}>
                          {language === 'bn' ? 'কম্বো' : 'Combo'}
                        </span>
                      )}

                      {/* Wishlist & Share Quick Icons */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(p.id);
                          }}
                          className="p-1 rounded-full bg-white/90 dark:bg-slate-950/90 hover:bg-white text-slate-700 dark:text-slate-200 shadow-sm hover:scale-110 active:scale-95 transition-all backdrop-blur-xs cursor-pointer"
                          title={isWish ? (language === 'bn' ? 'উইশলিস্ট থেকে বাদ দিন' : 'Remove from Wishlist') : (language === 'bn' ? 'উইশলিস্টে যোগ করুন' : 'Add to Wishlist')}
                        >
                          <Heart className={`w-3 h-3 ${isWish ? 'text-[#da1c24] fill-[#da1c24]' : ''}`} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            shareProduct(p);
                          }}
                          className="p-1 rounded-full bg-white/90 dark:bg-slate-950/90 hover:bg-white text-slate-700 dark:text-slate-200 hover:text-[#da1c24] shadow-sm hover:scale-110 active:scale-95 transition-all backdrop-blur-xs cursor-pointer"
                          title={language === 'bn' ? 'পণ্যটি শেয়ার করুন' : 'Share this product'}
                        >
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Content Details Block */}
                    <div className="p-1.5 sm:p-2 flex-1 flex flex-col justify-between">
                      
                      <div className="space-y-1">
                        {/* Product Title */}
                        <h3 className="font-bold text-[11px] sm:text-xs text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight min-h-[28px] sm:min-h-[32px] group-hover:text-[#da1c24] transition">
                          {language === 'bn' ? (p.titleBn || p.title) : p.title}
                        </h3>

                        {/* Brand & Stars & Sales Count Row - Super Compact Inline */}
                        <div className="flex flex-wrap items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500">
                          {p.brand && (
                            <span className="uppercase tracking-wider font-extrabold text-[#da1c24] dark:text-red-400 truncate max-w-[70px]">
                              {p.brand}
                            </span>
                          )}
                          
                          {/* Rating & Sold count */}
                          <div className="flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span className="font-bold text-slate-600 dark:text-slate-300">{p.rating || 4.5}</span>
                          </div>
                          
                          <span>•</span>
                          
                          <span className="font-medium text-slate-500 dark:text-slate-400">
                            {Math.floor((p.price % 180) + 15)} {language === 'bn' ? 'বিক্রি' : 'sold'}
                          </span>
                        </div>
                      </div>

                      {/* Pricing & Add to Bag Actions */}
                      <div className="mt-1.5 flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                        
                        {/* Prices */}
                        <div className="flex flex-col">
                          {p.discountPrice ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-slate-400 font-medium">
                                <span className="text-[7px] sm:text-[8px] bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-1 py-0.2 rounded-xs font-bold leading-none">
                                  {language === 'bn' ? 'ডিল' : 'Deal'}
                                </span>
                                <span className="line-through leading-none">{formatPrice(p.price)}</span>
                              </div>
                              <span className="text-xs sm:text-sm font-black text-[#da1c24] dark:text-red-400 leading-none">
                                {formatPrice(p.discountPrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-none">
                              {formatPrice(p.price)}
                            </span>
                          )}
                        </div>

                        {/* Right Actions: Buy button and Cart control */}
                        <div className="flex items-center gap-1 sm:gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Buy Now Direct Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onBuyNow(p, 1, {});
                            }}
                            className="px-2.5 sm:px-3 h-7 sm:h-8 text-[9px] sm:text-[10px] font-black rounded-full bg-red-50 hover:bg-[#da1c24] hover:text-white text-[#da1c24] border border-red-200 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-[#da1c24] dark:hover:text-white transition-all cursor-pointer shadow-xs uppercase tracking-wider flex items-center justify-center font-bold"
                          >
                            {language === 'bn' ? 'কিনুন' : 'Buy'}
                          </button>

                          {/* Compact Round Plus/Minus button or ShoppingCart Icon button */}
                          <div className="shrink-0">
                            {cartItem ? (
                              <div className="flex items-center bg-[#da1c24] text-white rounded-full p-0.5 shadow-sm border border-red-600 h-7 sm:h-8 animate-in zoom-in-95 duration-150">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateCartQuantity(p.id, cartItem.quantity - 1);
                                  }}
                                  className="w-5 h-5 flex items-center justify-center hover:bg-red-700 rounded-full transition cursor-pointer"
                                  title="Decrease"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="font-extrabold text-[9px] sm:text-[10px] px-1">{cartItem.quantity}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateCartQuantity(p.id, cartItem.quantity + 1);
                                  }}
                                  className="w-5 h-5 flex items-center justify-center hover:bg-red-700 rounded-full transition cursor-pointer"
                                  title="Increase"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(p, 1);
                                }}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-[#da1c24] hover:text-white hover:border-[#da1c24] text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                                title={language === 'bn' ? 'ব্যাগে যোগ করুন' : 'Add to Bag'}
                              >
                                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>


      {/* CATEGORIES GRID POPUP DIALOG */}
      {isCategoryPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            {/* Backdrop click to close */}
            <div className="absolute inset-0 bg-transparent" onClick={() => setIsCategoryPopupOpen(false)} />
            
            {/* Pop-up Container */}
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-150 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200 p-6 z-10">
              
              {/* Close Button */}
              <button 
                onClick={() => setIsCategoryPopupOpen(false)}
                className="absolute right-4 top-4 p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition z-10"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>

              {/* Title */}
              <div className="mb-4">
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                  <Tag className="w-4 h-4 text-[#da1c24]" />
                  {language === 'bn' ? 'ক্যাটাগরি অনুসন্ধান ও পপআপ মেনু' : 'Category Search & Popup'}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  {language === 'bn' ? 'যেকোনো ক্যাটাগরি চুজ করুন পণ্য ফিল্টার করার জন্য' : 'Select a category to filter products below'}
                </p>
              </div>

              {/* Search Category Input Box */}
              <div className="relative mb-5">
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder={language === 'bn' ? 'ক্যাটাগরি সার্চ করুন (যেমন: Food, Baby...)' : 'Type to search categories...'}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pl-4 pr-10 py-2.5 rounded-2xl text-xs font-bold border border-slate-250 dark:border-slate-800 focus:outline-none focus:border-[#da1c24] focus:ring-1 focus:ring-red-500/20"
                />
                <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
              </div>

              {/* Categories Grid list */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {/* Reset Option first */}
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setIsCategoryPopupOpen(false);
                    setCategorySearchQuery('');
                  }}
                  className={`p-3 rounded-2xl text-center border transition flex flex-col items-center justify-center space-y-1 ${
                    !selectedCategory 
                      ? 'bg-red-50 border-red-200 text-[#da1c24] font-black' 
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold'
                  }`}
                >
                  <span className="text-xl">🛍️</span>
                  <span className="text-[10px] tracking-wider uppercase truncate max-w-full font-black">
                    {language === 'bn' ? 'সব পণ্য' : 'All Products'}
                  </span>
                </button>

                {/* Filter and Render Categories */}
                {flatCategories.filter(item => {
                  const q = categorySearchQuery.toLowerCase();
                  return item.name.toLowerCase().includes(q) || item.nameBn.toLowerCase().includes(q);
                }).map((item) => {
                  const isSelected = selectedCategory === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedCategory(item.id);
                        setIsCategoryPopupOpen(false);
                        setCategorySearchQuery('');
                      }}
                      className={`p-3 rounded-2xl text-center border transition flex flex-col items-center justify-center space-y-1 ${
                        isSelected 
                          ? 'bg-[#da1c24]/5 border-red-200 text-[#da1c24] font-black' 
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold'
                      }`}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-[10px] tracking-wider uppercase truncate max-w-full font-bold">
                        {language === 'bn' ? item.nameBn : item.name}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        )}

    </div>
  );
};
