import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Category } from '../../types';
import { INITIAL_CATEGORIES } from '../../data/categoriesData';
import {
  Layers, Plus, Trash2, Edit3, Search, Sparkles, Check, 
  X, AlertTriangle, ArrowRight, Eye, RefreshCw, Smartphone, 
  Shirt, Apple, Home, Zap, Package, Footprints, Heart, 
  Gamepad2, Activity, BookOpen, Utensils, Coffee, Car, 
  ShieldCheck, Tag, Copy, ChevronRight, Image as ImageIcon, RotateCcw
} from 'lucide-react';

const PRESET_EMOJIS = [
  '📱', '👕', '👗', '👘', '📦', '👟', '👞', '⌚', '💄', '🍼', 
  '🧸', '⚽', '💊', '📚', '🎁', '🍔', '🍕', '🎂', '🧁', '🍲', 
  '🍦', '🍫', '🥜', '🌴', '🌾', '🍯', '🧈', '🥛', '☕', '🍪', 
  '🥤', '🍞', '❄️', '🍎', '🥦', '🥩', '🥚', '🌶️', '🧼', '🏺', 
  '🍳', '🌱', '🚗', '🐶', '💍', '💎', '🎧', '💻', '🚲', '🛠️', 
  '🎨', '✨', '⚡', '🏷️'
];

const PRESET_ICONS = [
  { name: 'Smartphone', icon: Smartphone, label: 'Electronics' },
  { name: 'Shirt', icon: Shirt, label: 'Fashion' },
  { name: 'Apple', icon: Apple, label: 'Grocery / Fruits' },
  { name: 'Home', icon: Home, label: 'Home Living' },
  { name: 'Sparkles', icon: Sparkles, label: 'Beauty' },
  { name: 'Zap', icon: Zap, label: 'Electrical' },
  { name: 'Package', icon: Package, label: 'Groceries' },
  { name: 'Footprints', icon: Footprints, label: 'Footwear' },
  { name: 'Heart', icon: Heart, label: 'Cosmetics' },
  { name: 'Gamepad2', icon: Gamepad2, label: 'Toys' },
  { name: 'Activity', icon: Activity, label: 'Pharmacy' },
  { name: 'BookOpen', icon: BookOpen, label: 'Books' },
  { name: 'Utensils', icon: Utensils, label: 'Restaurant' },
  { name: 'Coffee', icon: Coffee, label: 'Beverages' },
  { name: 'Car', icon: Car, label: 'Automotive' },
  { name: 'Tag', icon: Tag, label: 'General / Deals' }
];

const PRESET_IMAGES = [
  { name: 'Electronics', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80' },
  { name: 'Fashion & Clothing', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Foods & Organic', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Home & Living', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Cosmetics & Beauty', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Shoes & Footwear', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80' },
  { name: 'Medicine & Health', url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80' },
  { name: 'Toys & Kids', url: 'https://images.unsplash.com/photo-1537655780520-1e392edd816a?auto=format&fit=crop&w=600&q=80' },
  { name: 'Books & Stationery', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80' },
  { name: 'Grocery & Spices', url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80' }
];

const DEFAULT_MISSING_PRESETS: Partial<Category>[] = [
  {
    id: 'sarees-ethnic',
    name: 'Saree & Ethnic Wear',
    nameBn: 'শাড়ি ও ঐতিহ্যবাহী পোশাক',
    icon: 'Shirt',
    emoji: '👘',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-se-1', name: 'Jamdani Sarees', nameBn: 'জামদানি শাড়ি' },
      { id: 'sub-se-2', name: 'Silk Sarees', nameBn: 'সিল্ক শাড়ি' },
      { id: 'sub-se-3', name: 'Cotton & Tant', nameBn: 'সুতি ও তাঁতের শাড়ি' }
    ]
  },
  {
    id: 'watch-accessories',
    name: 'Watches & Accessories',
    nameBn: 'ঘড়ি ও অ্যাক্সেসরিজ',
    icon: 'Tag',
    emoji: '⌚',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-wa-1', name: 'Smart Watches', nameBn: 'স্মার্ট ওয়াচ' },
      { id: 'sub-wa-2', name: 'Luxury Analog', nameBn: 'লাক্সারি ঘড়ি' },
      { id: 'sub-wa-3', name: 'Belts & Wallets', nameBn: 'বেল্ট ও ওয়ালেট' }
    ]
  },
  {
    id: 'baby-food',
    name: 'Baby Care & Diapers',
    nameBn: 'শিশু যত্ন ও ডায়াপার',
    icon: 'Heart',
    emoji: '🍼',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-bf-1', name: 'Baby Food & Formula', nameBn: 'শিশুর খাবার' },
      { id: 'sub-bf-2', name: 'Pants Diapers', nameBn: 'প্যান্ট ডায়াপার' },
      { id: 'sub-bf-3', name: 'Baby Skincare', nameBn: 'বেবি স্কিনকেয়ার' }
    ]
  },
  {
    id: 'sports-fitness',
    name: 'Sports & Fitness',
    nameBn: 'খেলাধুলা ও ফিটনেস',
    icon: 'Activity',
    emoji: '⚽',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-sf-1', name: 'Cricket & Football', nameBn: 'ক্রিকেট ও ফুটবল' },
      { id: 'sub-sf-2', name: 'Gym & Fitness Gear', nameBn: 'জিম ও ফিটনেস সামগ্রী' },
      { id: 'sub-sf-3', name: 'Sportswear & Jersey', nameBn: 'জার্সি ও পোশাক' }
    ]
  },
  {
    id: 'fast-food',
    name: 'Fast Food & Snacks',
    nameBn: 'ফাস্টফুড ও স্ন্যাক্স',
    icon: 'Utensils',
    emoji: '🍔',
    image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80',
    subcategories: [
      { id: 'sub-ff-1', name: 'Burgers & Fries', nameBn: 'বার্গার ও ফ্রাই' },
      { id: 'sub-ff-2', name: 'Fried Chicken', nameBn: 'ফ্রাইড চিকেন' },
      { id: 'sub-ff-3', name: 'Shawarma & Rolls', nameBn: 'শরমা ও রোল' }
    ]
  }
];

interface Props {
  onBack: () => void;
}

export const CategoryQuickBarBackend: React.FC<Props> = ({ onBack }) => {
  const { categories, refreshCategories, language, products } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'with-products' | 'empty'>('all');
  
  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form fields
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formNameBn, setFormNameBn] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formEmoji, setFormEmoji] = useState('🛍️');
  const [formIcon, setFormIcon] = useState('Package');
  const [formImage, setFormImage] = useState('');
  const [formSubcategories, setFormSubcategories] = useState<{ id: string; name: string; nameBn: string; nameAr?: string }[]>([]);
  
  // Inline subcategory input inside modal
  const [newSubName, setNewSubName] = useState('');
  const [newSubNameBn, setNewSubNameBn] = useState('');
  
  // Delete confirmation
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Audio chime
  const playAudio = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        cat.name.toLowerCase().includes(q) || 
        cat.nameBn?.toLowerCase().includes(q) || 
        cat.id.toLowerCase().includes(q) ||
        cat.subcategories?.some(s => s.name.toLowerCase().includes(q) || s.nameBn?.toLowerCase().includes(q));

      const linkedProds = products.filter(p => p.categoryId === cat.id || p.categoryName === cat.name).length;

      if (!matchesQuery) return false;
      if (filterType === 'with-products') return linkedProds > 0;
      if (filterType === 'empty') return linkedProds === 0;
      return true;
    });
  }, [categories, searchQuery, filterType, products]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingCategory(null);
    const newId = `cat-${Date.now().toString().slice(-6)}`;
    setFormId(newId);
    setFormName('');
    setFormNameBn('');
    setFormNameAr('');
    setFormEmoji('🛍️');
    setFormIcon('Package');
    setFormImage('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80');
    setFormSubcategories([
      { id: `sub-${Date.now()}-1`, name: 'General Item', nameBn: 'সাধারণ আইটেম' }
    ]);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormId(cat.id);
    setFormName(cat.name);
    setFormNameBn(cat.nameBn || cat.name);
    setFormNameAr(cat.nameAr || '');
    setFormEmoji(cat.emoji || '🛍️');
    setFormIcon(cat.icon || 'Package');
    setFormImage(cat.image || '');
    setFormSubcategories(cat.subcategories ? [...cat.subcategories] : []);
    setIsModalOpen(true);
  };

  // Add subcategory to form
  const handleAddSubcategory = () => {
    if (!newSubName.trim() && !newSubNameBn.trim()) return;
    const item = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: newSubName.trim() || newSubNameBn.trim(),
      nameBn: newSubNameBn.trim() || newSubName.trim()
    };
    setFormSubcategories([...formSubcategories, item]);
    setNewSubName('');
    setNewSubNameBn('');
  };

  // Remove subcategory from form
  const handleRemoveSubcategory = (index: number) => {
    setFormSubcategories(formSubcategories.filter((_, i) => i !== index));
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert(language === 'bn' ? 'অনুগ্রহ করে ক্যাটাগরির ইংরেজি নাম প্রদান করুন।' : 'Please enter Category Name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Category> = {
        id: formId.trim() || `cat-${Date.now()}`,
        name: formName.trim(),
        nameBn: formNameBn.trim() || formName.trim(),
        nameAr: formNameAr.trim() || undefined,
        emoji: formEmoji,
        icon: formIcon,
        image: formImage.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        subcategories: formSubcategories,
        productCount: editingCategory ? editingCategory.productCount : 0
      };

      if (editingCategory) {
        await api.updateCategory(editingCategory.id, payload);
        showToast(language === 'bn' ? `ক্যাটাগরি "${payload.nameBn}" সফলভাবে আপডেট হয়েছে!` : `Category "${payload.name}" updated successfully!`);
      } else {
        await api.createCategory(payload);
        showToast(language === 'bn' ? `নতুন ক্যাটাগরি "${payload.nameBn}" সফলভাবে তৈরি হয়েছে!` : `New Category "${payload.name}" created successfully!`);
      }

      await refreshCategories();
      playAudio();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error saving category');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Category
  const handleDelete = async () => {
    if (!deletingCat) return;
    setIsSubmitting(true);
    try {
      await api.deleteCategory(deletingCat.id);
      await refreshCategories();
      playAudio();
      showToast(language === 'bn' ? `ক্যাটাগরি "${deletingCat.nameBn || deletingCat.name}" মুছে ফেলা হয়েছে!` : `Category "${deletingCat.name}" deleted successfully!`);
      setDeletingCat(null);
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    } finally {
      setIsSubmitting(false);
    }
  };

  // One-click Preset Importer
  const handleImportPreset = async (preset: Partial<Category>) => {
    setIsSubmitting(true);
    try {
      const exists = categories.some(c => c.id === preset.id || c.name.toLowerCase() === preset.name?.toLowerCase());
      if (exists) {
        showToast(language === 'bn' ? 'এই ক্যাটাগরিটি ইতিমধ্যে তালিকায় বিদ্যমান রয়েছে।' : 'This category already exists in your list.');
        setIsSubmitting(false);
        return;
      }

      await api.createCategory({
        ...preset,
        productCount: 0
      });
      await refreshCategories();
      playAudio();
      showToast(language === 'bn' ? `প্রিসেট "${preset.nameBn}" সফলভাবে যোগ করা হয়েছে!` : `Preset "${preset.name}" added successfully!`);
    } catch (err: any) {
      alert(err.message || 'Error adding preset');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Duplicate
  const handleDuplicate = async (cat: Category) => {
    setIsSubmitting(true);
    try {
      const copyPayload: Partial<Category> = {
        id: `cat-${Date.now().toString().slice(-6)}`,
        name: `${cat.name} (Copy)`,
        nameBn: `${cat.nameBn || cat.name} (কপি)`,
        emoji: cat.emoji || '🛍️',
        icon: cat.icon || 'Package',
        image: cat.image,
        subcategories: cat.subcategories?.map(s => ({ ...s, id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}` })) || [],
        productCount: 0
      };

      await api.createCategory(copyPayload);
      await refreshCategories();
      playAudio();
      showToast(language === 'bn' ? `ক্যাটাগরি "${cat.nameBn}" ডুপ্লিকেট করা হয়েছে!` : `Category "${cat.name}" duplicated!`);
    } catch (err: any) {
      alert(err.message || 'Error duplicating');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Restore all 12 Default Categories
  const handleRestoreDefaults = async () => {
    if (!window.confirm(language === 'bn' ? 'আপনি কি পূর্বের মূল ১২টি ক্যাটাগরি পুনরুদ্ধার ও রিসেট করতে চান?' : 'Do you want to restore all 12 original categories?')) return;
    setIsSubmitting(true);
    try {
      for (const cat of INITIAL_CATEGORIES) {
        const exists = categories.find(c => c.id === cat.id);
        if (!exists) {
          await api.createCategory(cat);
        } else {
          await api.updateCategory(cat.id, cat);
        }
      }
      await refreshCategories();
      playAudio();
      showToast(language === 'bn' ? 'মূল ১২টি ক্যাটাগরি সফলভাবে পুনরুদ্ধার করা হয়েছে!' : 'All 12 default categories restored successfully!');
    } catch (err: any) {
      alert(err.message || 'Error restoring categories');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs sm:text-sm font-black border border-slate-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 dark:text-slate-950 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-[11px] font-black uppercase tracking-wider text-teal-500 dark:text-teal-400">
        <span>MARKET ARCHITECTURE</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <button 
          type="button"
          onClick={onBack}
          className="hover:text-amber-500 transition cursor-pointer font-black"
        >
          VENDORS
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-400 dark:text-slate-500">
          {language === 'bn' ? '৩. ক্যাটাগরি ও কুইক নেভিগেশন বার ব্যাকএন্ড' : '3. Category & Quick Nav Bar Backend'}
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-start sm:items-center space-x-4">
          <div className="p-4 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl text-indigo-500 shrink-0 border border-indigo-500/20">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {language === 'bn' ? '৩. ক্যাটাগরি ও কুইক নেভিগেশন বার কন্ট্রোল' : '3. Category & Quick Nav Bar Manager'}
              </h1>
              <span className="bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                LIVE SYNC
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans max-w-2xl leading-relaxed">
              {language === 'bn'
                ? 'কাস্টমার ফ্রন্টএন্ডে প্রদর্শিত সকল ক্যাটাগরি এবং মারক করা অনুভূমিক কুইক নেভিগেশন বার আইটেমসমূহ লাইভ অ্যাড, এডিট, ইমেজ ও ইমোজি পরিবর্তন এবং ডিলিট করুন।'
                : 'Manage customer storefront categories and the horizontal quick navigation marquee bar with instant Add, Edit, Delete, Emojis, and Real-time syncing.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            disabled={isSubmitting}
            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-black text-xs px-3.5 py-2.5 rounded-xl transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            title={language === 'bn' ? 'ডিফল্ট ১২টি ক্যাটাগরি পুনরুদ্ধার করুন' : 'Restore 12 default categories'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ডিফল্ট ১২টি ক্যাটাগরি রিসেট' : 'Restore Defaults'}</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2 cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>{language === 'bn' ? 'ফিরে যান' : 'Back'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-sm shadow-indigo-600/20 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? '+ নতুন ক্যাটাগরি' : '+ Add Category'}</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {language === 'bn' ? 'মোট ক্যাটাগরি' : 'Total Categories'}
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {categories.length}
            </span>
            <span className="text-[10px] text-emerald-500 font-bold font-sans">
              {language === 'bn' ? 'সক্রিয়' : 'Active'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {language === 'bn' ? 'সাব-ক্যাটাগরি' : 'Total Subcategories'}
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-indigo-500">
              {categories.reduce((acc, c) => acc + (c.subcategories?.length || 0), 0)}
            </span>
            <span className="text-[10px] text-slate-400 font-sans">
              {language === 'bn' ? 'আইটেম' : 'Items'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {language === 'bn' ? 'সংযুক্ত প্রোডাক্টস' : 'Linked Products'}
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-amber-500">
              {products.length}
            </span>
            <span className="text-[10px] text-slate-400 font-sans">
              {language === 'bn' ? 'পণ্য' : 'Items'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {language === 'bn' ? 'কুইক বার নেভিগেশন' : 'Quick Nav Bar Status'}
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-teal-500">
              {categories.length}
            </span>
            <span className="text-[10px] text-emerald-500 font-bold font-sans">
              100% Live
            </span>
          </div>
        </div>
      </div>

      {/* LIVE STOREFRONT QUICK NAV BAR PREVIEW */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-indigo-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
              {language === 'bn' ? 'লাইভ ফ্রন্টএন্ড কুইক বার প্রিভিউ (কাস্টমার যেভাবে দেখে)' : 'Live Storefront Quick Bar Preview (Customer View)'}
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {language === 'bn' ? 'আইটেমে ক্লিক করে নিচে সার্চ করুন' : 'Click item to filter below'}
          </span>
        </div>

        {/* The simulated horizontal scroll strip */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-3 overflow-x-auto no-scrollbar flex items-center gap-3">
          <div className="flex flex-col items-center justify-center shrink-0 w-14 group">
            <div className="w-10 h-10 rounded-full bg-[#da1c24] text-white flex items-center justify-center text-base shadow-sm">
              🛍️
            </div>
            <span className="text-[9px] text-center mt-1 w-full truncate font-black text-[#da1c24]">
              {language === 'bn' ? 'সব পণ্য' : 'All'}
            </span>
          </div>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSearchQuery(cat.name)}
              className="flex flex-col items-center justify-center shrink-0 w-14 group cursor-pointer focus:outline-hidden hover:scale-105 transition duration-150"
            >
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 hover:border-indigo-400 flex items-center justify-center text-base shadow-sm group-hover:bg-slate-700">
                {cat.emoji || '🏷️'}
              </div>
              <span className="text-[9px] text-center mt-1 w-full truncate font-bold text-slate-300 group-hover:text-indigo-400">
                {language === 'bn' ? (cat.nameBn || cat.name) : cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* QUICK PRESET TEMPLATES */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {language === 'bn' ? 'রেডিমেড ক্যাটাগরি প্রিসেটস (১-ক্লিকে যোগ করুন)' : 'Ready-made Category Presets (1-Click Add)'}
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-sans">
            {language === 'bn' ? 'ক্লিক করলেই ফ্রন্টএন্ডে লাইভ যুক্ত হবে' : 'Instantly adds to live marketplace'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {DEFAULT_MISSING_PRESETS.map((preset) => {
            const isAlreadyAdded = categories.some(c => c.id === preset.id || c.name.toLowerCase() === preset.name?.toLowerCase());
            return (
              <button
                key={preset.id}
                disabled={isAlreadyAdded || isSubmitting}
                onClick={() => handleImportPreset(preset)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition border cursor-pointer ${
                  isAlreadyAdded 
                    ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                }`}
              >
                <span>{preset.emoji}</span>
                <span>{language === 'bn' ? preset.nameBn : preset.name}</span>
                {isAlreadyAdded ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Plus className="w-3 h-3 text-indigo-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'ক্যাটাগরির নাম, বাংলা নাম বা আইডি দিয়ে সার্চ করুন...' : 'Search categories by name, bengali name or ID...'}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {language === 'bn' ? `সকল (${categories.length})` : `All (${categories.length})`}
          </button>
          <button
            onClick={() => setFilterType('with-products')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              filterType === 'with-products'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {language === 'bn' ? 'পণ্য যুক্ত আছে' : 'Has Products'}
          </button>
          <button
            onClick={() => setFilterType('empty')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              filterType === 'empty'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {language === 'bn' ? 'খালি ক্যাটাগরি' : 'Empty'}
          </button>
        </div>
      </div>

      {/* CATEGORIES GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const linkedProds = products.filter(p => p.categoryId === cat.id || p.categoryName === cat.name).length;
          
          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:border-indigo-500/50 hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4 group"
            >
              {/* Card Top: Emoji + Details + Action Menu */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-2xl shrink-0 shadow-2xs group-hover:scale-110 transition duration-200">
                      {cat.emoji || '🛍️'}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                        {language === 'bn' ? (cat.nameBn || cat.name) : cat.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {language === 'bn' ? cat.name : (cat.nameBn || '')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700">
                      {cat.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      linkedProds > 0 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {linkedProds} {language === 'bn' ? 'টি পণ্য' : 'products'}
                    </span>
                  </div>
                </div>

                {/* Image Banner Preview if present */}
                {cat.image && (
                  <div className="relative h-20 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-2.5">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center space-x-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>{language === 'bn' ? 'ব্যানার ইমেজ' : 'Banner Active'}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Subcategories preview tags */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <span>{language === 'bn' ? 'সাব-ক্যাটাগরি সমূহ:' : 'Subcategories:'}</span>
                    <span>{cat.subcategories?.length || 0}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto no-scrollbar">
                    {cat.subcategories && cat.subcategories.length > 0 ? (
                      cat.subcategories.map((sub, i) => (
                        <span 
                          key={sub.id || i}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-sans border border-slate-200 dark:border-slate-700/80"
                        >
                          {language === 'bn' ? (sub.nameBn || sub.name) : sub.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic font-sans">
                        {language === 'bn' ? 'কোন সাব-ক্যাটাগরি যুক্ত নেই' : 'No subcategories added yet'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleDuplicate(cat)}
                  disabled={isSubmitting}
                  title={language === 'bn' ? 'ক্যাটাগরি ক্লোন করুন' : 'Clone Category'}
                  className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black px-3 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{language === 'bn' ? 'এডিট' : 'Edit'}</span>
                  </button>

                  <button
                    onClick={() => setDeletingCat(cat)}
                    className="flex items-center space-x-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-black px-3 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ডিলিট' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {language === 'bn' ? 'কোন ক্যাটাগরি পাওয়া যায়নি' : 'No Categories Found'}
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              {language === 'bn' ? 'আপনার সার্চ কিওয়ার্ড পরিবর্তন করুন অথবা নতুন ক্যাটাগরি যোগ করুন।' : 'Try changing your search query or add a new category.'}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
          >
            {language === 'bn' ? '+ নতুন ক্যাটাগরি তৈরি করুন' : '+ Create Category'}
          </button>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center text-xl font-bold">
                  {formEmoji}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {editingCategory 
                      ? (language === 'bn' ? 'ক্যাটাগরি এডিট করুন' : 'Edit Category')
                      : (language === 'bn' ? 'নতুন ক্যাটাগরি যোগ করুন' : 'Add New Category')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                    {language === 'bn' ? 'তথ্য পরিবর্তন করলে তা তাৎক্ষণিক ফ্রন্টএন্ডে যুক্ত হবে।' : 'Changes will instantly synchronize with the customer storefront.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto no-scrollbar">
              {/* Category Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {language === 'bn' ? 'ক্যাটাগরির নাম (English) *' : 'Category Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Smart Electronics & Gadgets"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {language === 'bn' ? 'ক্যাটাগরির নাম (বাংলা) *' : 'Category Name (Bangla) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameBn}
                    onChange={(e) => setFormNameBn(e.target.value)}
                    placeholder="যেমন: স্মার্ট গ্যাজেট ও ইলেকট্রনিক্স"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* ID / Slug */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'ক্যাটাগরি আইডি / স্লাগ (Unique Slug)' : 'Category ID / Slug'}
                </label>
                <input
                  type="text"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="e.g. cat-smart-gadgets"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* EMOJI SELECTOR */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {language === 'bn' ? 'কুইক বার ইমোজি (Quick Nav Emoji)' : 'Quick Nav Bar Emoji'}
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-sans">
                      {language === 'bn' ? 'কাস্টম ইমোজি:' : 'Custom:'}
                    </span>
                    <input
                      type="text"
                      value={formEmoji}
                      onChange={(e) => setFormEmoji(e.target.value)}
                      className="w-10 h-7 text-center text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-9 sm:grid-cols-12 gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 max-h-28 overflow-y-auto no-scrollbar">
                  {PRESET_EMOJIS.map((emoji, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setFormEmoji(emoji)}
                      className={`h-8 rounded-xl flex items-center justify-center text-base transition cursor-pointer ${
                        formEmoji === emoji
                          ? 'bg-indigo-600 text-white scale-110 shadow-xs'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* IMAGE BANNER PRESETS & INPUT */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'ব্যানার ইমেজ লিংক (Image URL)' : 'Banner Image URL'}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                  {formImage && (
                    <img 
                      src={formImage} 
                      alt="Preview" 
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0" 
                    />
                  )}
                </div>

                {/* Preset image picker pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  {PRESET_IMAGES.map((img, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setFormImage(img.url)}
                      className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg shrink-0 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      {img.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* SUBCATEGORIES BUILDER */}
              <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'সাব-ক্যাটাগরি সমূহ তৈরি করুন' : 'Subcategories Builder'}
                  </label>
                  <span className="text-[10px] text-indigo-500 font-black">
                    {formSubcategories.length} {language === 'bn' ? 'টি সাব-ক্যাটাগরি' : 'items'}
                  </span>
                </div>

                {/* Subcategory Input Row */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder={language === 'bn' ? 'সাব-ক্যাটাগরি (English)' : 'Subcategory Name (English)'}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={newSubNameBn}
                    onChange={(e) => setNewSubNameBn(e.target.value)}
                    placeholder={language === 'bn' ? 'সাব-ক্যাটাগরি (বাংলা)' : 'Subcategory Name (Bangla)'}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2 rounded-xl transition shrink-0 cursor-pointer flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'যুক্ত করুন' : 'Add'}</span>
                  </button>
                </div>

                {/* Subcategories list */}
                <div className="space-y-1.5 pt-1">
                  {formSubcategories.map((sub, idx) => (
                    <div 
                      key={sub.id || idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-[10px] font-black">
                          {idx + 1}
                        </span>
                        <span className="text-slate-900 dark:text-white">{sub.name}</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-600 dark:text-slate-400">{sub.nameBn}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSubcategory(idx)}
                        className="text-red-400 hover:text-red-600 p-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer uppercase tracking-wider flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{language === 'bn' ? 'সংরক্ষণ ও লাইভ সিঙ্ক' : 'Save & Sync Live'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-red-200 dark:border-red-900/50 shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {language === 'bn' ? 'ক্যাটাগরি মুছে ফেলতে চান?' : 'Delete this category?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                {language === 'bn' 
                  ? `আপনি কি নিশ্চিতভাবে "${deletingCat.nameBn || deletingCat.name}" ক্যাটাগরি মুছে ফেলতে চান? এটি ফ্রন্টএন্ড কুইক বার থেকেও অপসারিত হবে।`
                  : `Are you sure you want to delete "${deletingCat.name}"? It will be permanently removed from the storefront quick navigation bar.`}
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCat(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2.5 rounded-xl transition shadow-md shadow-red-600/20 cursor-pointer uppercase tracking-wider"
              >
                {isSubmitting ? (language === 'bn' ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...') : (language === 'bn' ? 'হ্যাঁ, ডিলিট করুন' : 'Yes, Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
