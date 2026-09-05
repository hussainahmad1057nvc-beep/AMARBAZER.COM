import React, { useMemo, useState, useEffect } from 'react';
import { 
  TrendingUp, ShoppingCart, Users, Activity, Package, Star, 
  MessageSquare, Bell, Volume2, Shield, Calendar, DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Order, Seller } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const toBengaliNumber = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(digit => {
    const d = parseInt(digit);
    return isNaN(d) ? digit : bnDigits[d];
  }).join('');
};

const formatTimeAgo = (dateStr?: string, language: string = 'bn'): string => {
  if (!dateStr) return language === 'bn' ? 'সম্প্রতি' : 'Just now';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return language === 'bn' ? 'এইমাত্র' : 'Just now';
  if (mins < 60) return language === 'bn' ? `${toBengaliNumber(mins)} মিনিট আগে` : `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return language === 'bn' ? `${toBengaliNumber(hours)} ঘণ্টা আগে` : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return language === 'bn' ? `${toBengaliNumber(days)} দিন আগে` : `${days} days ago`;
};

export const DashboardHome: React.FC = () => {
  const { products, language, theme, currentUser } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadRealData = async () => {
      try {
        const [fetchedOrders, fetchedSellers] = await Promise.all([
          api.getOrders(),
          api.getSellers()
        ]);
        if (isMounted) {
          setOrders(fetchedOrders || []);
          setSellers(fetchedSellers || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load real ERP stats:', err);
        if (isMounted) setLoading(false);
      }
    };
    loadRealData();

    const handleDataUpdate = () => {
      loadRealData();
    };
    window.addEventListener('storage', handleDataUpdate);
    window.addEventListener('order-status-updated', handleDataUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleDataUpdate);
      window.removeEventListener('order-status-updated', handleDataUpdate);
    };
  }, []);

  // Real Gross Revenue
  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [orders]);

  // Real Active Orders (pending or confirmed/processing)
  const activeOrders = useMemo(() => {
    return orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
  }, [orders]);

  const pendingCount = useMemo(() => {
    return orders.filter(o => o.status === 'pending').length;
  }, [orders]);

  const confirmedCount = useMemo(() => {
    return orders.filter(o => o.status === 'confirmed').length;
  }, [orders]);

  const deliveredCount = useMemo(() => {
    return orders.filter(o => o.status === 'delivered').length;
  }, [orders]);

  // Real Verified Stores
  const verifiedVendorsCount = sellers.length;
  const pendingApprovalsCount = sellers.filter(s => s.status === 'pending').length;

  // Dynamic Sales by Month from real orders
  const salesData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    // Show last 6 months up to current
    const monthsToShow: { name: string; monthIndex: number; year: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonthIdx - i);
      monthsToShow.push({
        name: monthNames[d.getMonth()],
        monthIndex: d.getMonth(),
        year: d.getFullYear()
      });
    }

    return monthsToShow.map(m => {
      const monthOrders = orders.filter(o => {
        if (o.status === 'cancelled') return false;
        const oDate = new Date(o.createdAt);
        return oDate.getMonth() === m.monthIndex && oDate.getFullYear() === m.year;
      });
      const monthSales = monthOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
      return {
        name: m.name,
        Sales: monthSales,
        Orders: monthOrders.length
      };
    });
  }, [orders]);

  // Dynamic Recent Events based on real orders and products
  const recentEvents = useMemo(() => {
    const events: Array<{ id: string; time: string; event: string; type: string; status: 'success' | 'warning' | 'info' }> = [];
    
    // Sort latest orders
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    sortedOrders.slice(0, 4).forEach(o => {
      const orderNum = o.orderNumber || (o as any).order5DigitId || o.id;
      const isConfirmed = o.status === 'confirmed' || o.status === 'delivered';
      events.push({
        id: `ord-${o.id}`,
        time: formatTimeAgo(o.createdAt, language),
        event: language === 'bn'
          ? `অর্ডার #${orderNum} - মোট ৳${o.totalAmount.toLocaleString()} (${o.status === 'confirmed' ? 'অনুমোদিত' : o.status === 'delivered' ? 'ডেলিভার্ড' : 'পেন্ডিং'})`
          : `Order #${orderNum} - ৳${o.totalAmount.toLocaleString()} (${o.status})`,
        type: 'order',
        status: isConfirmed ? 'success' : 'warning'
      });
    });

    // Add recent sellers
    sellers.slice(0, 2).forEach(s => {
      events.push({
        id: `sel-${s.id}`,
        time: formatTimeAgo(s.createdAt, language),
        event: language === 'bn' 
          ? `ভেন্ডর শপ নথিবদ্ধ: ${s.storeName}`
          : `Registered Store: ${s.storeName}`,
        type: 'vendor',
        status: 'info'
      });
    });

    if (events.length === 0) {
      events.push({
        id: 'ev-empty',
        time: language === 'bn' ? 'সচল' : 'Active',
        event: language === 'bn' ? 'সিস্টেমে কোনো পেন্ডিং ইভেন্ট নেই' : 'All systems operating normally',
        type: 'info',
        status: 'info'
      });
    }

    return events.slice(0, 5);
  }, [orders, sellers, language]);

  const topSelling = useMemo(() => {
    return products.slice(0, 3);
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {language === 'bn' ? 'অমরবাজার ইআরপি ড্যাশবোর্ড' : 'AmarBazar ERP Central Control'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {language === 'bn' 
                ? 'স্বাগতম অপারেটর! আজকের বাজার ওভারভিউ এবং লাইভ স্ট্যাটাস এখানে দেখুন।' 
                : 'Welcome, active operator! Monitor real-time marketplace sales, logs, and settings.'}
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{language === 'bn' ? 'সার্ভার সচল আছে' : 'Server Live & Connected'}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 - Real Revenue */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'bn' ? 'মোট বিক্রি' : 'Total Revenue'}
            </p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {language === 'bn' ? `৳${toBengaliNumber(totalRevenue.toLocaleString())}` : `৳${totalRevenue.toLocaleString()}`}
            </h3>
            <p className="text-[10px] text-emerald-500 font-bold flex items-center mt-0.5">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              {language === 'bn' 
                ? `${toBengaliNumber(orders.length)}টি রিয়েল অর্ডার` 
                : `${orders.length} real orders`}
            </p>
          </div>
        </div>

        {/* Card 2 - Real Active Orders */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'bn' ? 'সক্রিয় অর্ডার' : 'Active Orders'}
            </p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {language === 'bn' ? `${toBengaliNumber(activeOrders.length)}টি` : `${activeOrders.length}`}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              {language === 'bn' 
                ? `${toBengaliNumber(pendingCount)}টি পেন্ডিং, ${toBengaliNumber(confirmedCount)}টি কনফার্মড` 
                : `${pendingCount} pending, ${confirmedCount} confirmed`}
            </p>
          </div>
        </div>

        {/* Card 3 - Real Verified Stores */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'bn' ? 'মোট বিক্রেতা' : 'Verified Vendors'}
            </p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {language === 'bn' ? `${toBengaliNumber(verifiedVendorsCount)}টি শপ` : `${verifiedVendorsCount} Stores`}
            </h3>
            <p className="text-[10px] text-emerald-500 font-bold mt-0.5">
              {pendingApprovalsCount > 0 
                ? (language === 'bn' ? `+${toBengaliNumber(pendingApprovalsCount)}টি নতুন আবেদন` : `+${pendingApprovalsCount} new applications`)
                : (language === 'bn' ? '১০০% সক্রিয় শপ' : '100% active shops')}
            </p>
          </div>
        </div>

        {/* Card 4 - Dynamic Operator Status */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'bn' ? 'অপারেটর স্ট্যাটাস' : 'Operator Status'}
            </p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {language === 'bn' ? 'সক্রিয়' : 'Active'}
            </h3>
            <p className="text-[10px] text-purple-500 font-bold mt-0.5 truncate max-w-[140px]">
              ID: {currentUser?.name || currentUser?.id || 'admin-root'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts & Event Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Column (2 cols wide) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {language === 'bn' ? 'রাজস্ব প্রবৃদ্ধি চিত্র' : 'Revenue Growth Chart'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {language === 'bn' ? 'মাসিক প্রকৃত বিক্রয় ও অর্ডারের বিবরণী' : 'Real monthly sales volume and orders (BDT)'}
              </p>
            </div>
            <div className="inline-flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5" />
              <span>YTD {new Date().getFullYear()}</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    borderColor: theme === 'dark' ? '#475569' : '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: theme === 'dark' ? '#f1f5f9' : '#0f172a'
                  }} 
                  formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, language === 'bn' ? 'বিক্রয়' : 'Sales']}
                />
                <Area type="monotone" dataKey="Sales" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Mini Column (1 col wide): Real System Logs */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1 flex items-center">
              <Shield className="w-4 h-4 mr-1.5 text-amber-500" />
              {language === 'bn' ? 'সিস্টেম লগ' : 'ERP System Logs'}
            </h3>
            <p className="text-[10px] text-slate-400 mb-4">
              {language === 'bn' ? 'প্রকৃত অর্ডার ও কার্যবিবরণী' : 'Real-time trace of live marketplace actions'}
            </p>

            <div className="space-y-3.5">
              {recentEvents.map(ev => (
                <div key={ev.id} className="flex items-start space-x-2.5">
                  <span className={`w-2 h-2 rounded-full mt-1.5 ${
                    ev.status === 'success' ? 'bg-emerald-500' :
                    ev.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}></span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-tight">
                      {ev.event}
                    </p>
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                      {ev.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 italic">
              {language === 'bn' ? 'লগইন অ্যাকাউন্ট: ' : 'Logged in as: '}
              <strong>{currentUser?.role === 'admin' || currentUser?.role === 'system_admin' ? 'Super Admin' : currentUser?.name || 'Operator'}</strong>
            </span>
          </div>
        </div>

      </div>

      {/* Top Products Grid */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center">
          <Package className="w-4 h-4 mr-1.5 text-amber-500" />
          {language === 'bn' ? 'জনপ্রিয় পণ্য বিশ্লেষণ' : 'Top Performing Listings'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topSelling.map(p => (
            <div key={p.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center space-x-3 bg-slate-50/50 dark:bg-slate-900/30">
              <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">
                  {language === 'bn' ? (p.titleBn || p.title) : language === 'ar' ? (p.titleAr || p.title) : p.title}
                </h4>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                  ৳{(p.discountPrice || p.price).toLocaleString()}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[9px] bg-amber-500/10 text-amber-500 font-bold px-1.5 py-0.2 rounded flex items-center">
                    <Star className="w-2.5 h-2.5 fill-amber-500 mr-0.5" />
                    {p.rating}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">
                    {language === 'bn' ? `স্টক: ${toBengaliNumber(p.stock)} টি` : `Stock: ${p.stock} units`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

