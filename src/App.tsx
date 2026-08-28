import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CustomerView } from './components/customer/CustomerView';
import { CustomerProfilePanel } from './components/customer/CustomerProfilePanel';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SellerApplications } from './components/admin/SellerApplications';
import { ProductApprovals } from './components/admin/ProductApprovals';
import { SubscriptionSettings } from './components/admin/SubscriptionSettings';
import { SettingsView } from './components/common/SettingsView';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { StoreDirectory } from './components/dashboard/StoreDirectory';
import { InventoryWorkspace } from './components/dashboard/InventoryWorkspace';
import { ProductReviewsPanel } from './components/dashboard/ProductReviewsPanel';
import { CustomerMessagesPanel } from './components/dashboard/CustomerMessagesPanel';
import { RegisterVendorShop } from './components/dashboard/RegisterVendorShop';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { ProductShareModal } from './components/common/ProductShareModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { PaymentModal } from './components/common/PaymentModal';
import { AuthModal } from './components/auth/AuthModal';
import { AiAssistantModal } from './components/common/AiAssistantModal';
import { OrderTrackingModal } from './components/customer/OrderTrackingModal';
import { FacebookMessengerWidget } from './components/common/FacebookMessengerWidget';
import { CustomerTrackingSupport } from './components/customer/CustomerTrackingSupport';
import { BottomNavigation } from './components/common/BottomNavigation';
import { OutletsView } from './components/customer/OutletsView';
import { LocationPickerModal } from './components/common/LocationPickerModal';
import { Product, Address, getProductUnitPrice } from './types';
import { addressService } from './services/addressService';
import { ShieldAlert, KeyRound, LogOut, ArrowLeft } from 'lucide-react';
import { nativeBridge } from './services/nativeBridge';
import { backNavigationManager } from './services/backNavigationManager';

function MainLayout() {
  const { 
    products,
    activePanel, setActivePanel, selectedProduct, setSelectedProduct, 
    sharingProduct, setSharingProduct,
    cart, addToCart, isCustomerOnlyMode, currentUser, isAuthOpen, setIsAuthOpen, 
    isAiOpen, setIsAiOpen, trackingOrderId, setTrackingOrderId,
    isCartOpen, setIsCartOpen, language,
    isMobileChatActive, setIsMobileChatActive,
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
    selectedSellerId, setSelectedSellerId,
    isLocationModalOpen, setIsLocationModalOpen
  } = useApp();

  // Payment Modal Trigger State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [exitToastMessage, setExitToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<any>(null);
  const panelHistoryRef = useRef<string[]>(['customer']);

  const [checkoutPayload, setCheckoutPayload] = useState<{
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    coupon?: string;
    items: any[];
    shippingAddress: Address | null;
  } | null>(null);

  // Keep references to state so Android Native Hardware Back Button handler always sees the latest values
  const stateRef = useRef({
    selectedProduct,
    sharingProduct,
    isPaymentModalOpen,
    isCartOpen,
    isAuthOpen,
    isAiOpen,
    trackingOrderId,
    activePanel,
    isMobileChatActive,
    searchQuery,
    selectedCategory,
    selectedSellerId,
    isLocationModalOpen
  });

  useEffect(() => {
    stateRef.current = {
      selectedProduct,
      sharingProduct,
      isPaymentModalOpen,
      isCartOpen,
      isAuthOpen,
      isAiOpen,
      trackingOrderId,
      activePanel,
      isMobileChatActive,
      searchQuery,
      selectedCategory,
      selectedSellerId,
      isLocationModalOpen
    };
  }, [
    selectedProduct, sharingProduct, isPaymentModalOpen, isCartOpen, 
    isAuthOpen, isAiOpen, trackingOrderId, activePanel, 
    isMobileChatActive, searchQuery, selectedCategory, selectedSellerId,
    isLocationModalOpen
  ]);

  // Track panel transitions in history stack
  useEffect(() => {
    if (activePanel) {
      const history = panelHistoryRef.current;
      if (history[history.length - 1] !== activePanel) {
        history.push(activePanel);
      }
    }
  }, [activePanel]);

  // Push history steps to browser when modal or sub-panel is opened
  const prevStatesRef = useRef({
    selectedProduct: null as any,
    sharingProduct: null as any,
    isPaymentModalOpen: false,
    isCartOpen: false,
    isAuthOpen: false,
    isAiOpen: false,
    trackingOrderId: null as any,
    activePanel: 'customer',
    isMobileChatActive: false
  });

  // Direct Social Share / Google Search Landing URL Parser
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      
      // 1. Direct Product ID Deep Link (e.g., /?product=prod-1 or /?p=prod-1)
      const targetProductId = urlParams.get('product') || urlParams.get('p') || urlParams.get('productId');
      if (targetProductId && products.length > 0) {
        const found = products.find(p => p.id === targetProductId || p.slug === targetProductId);
        if (found) {
          setSelectedProduct(found);
          setActivePanel('customer');
        }
      }

      // 2. Direct Category Link (e.g., /?category=cat-1)
      const targetCatId = urlParams.get('category') || urlParams.get('cat');
      if (targetCatId) {
        setSelectedCategory(targetCatId);
        setActivePanel('customer');
      }

      // 3. Direct Search Keyword Link (e.g., /?search=saree)
      const targetSearch = urlParams.get('search') || urlParams.get('q');
      if (targetSearch) {
        setSearchQuery(targetSearch);
        setActivePanel('customer');
      }

      // 4. Direct Specific Panel (e.g., /?panel=store_directory or /?panel=seller)
      const targetPanel = urlParams.get('panel');
      if (targetPanel && ['customer', 'seller', 'admin', 'settings', 'dashboard_home', 'store_directory', 'inventory_workspace', 'product_reviews', 'customer_messages', 'register_vendor', 'customer_profile', 'outlets'].includes(targetPanel)) {
        setActivePanel(targetPanel as any);
      }

      // 5. Direct Order Tracking Link (e.g., /?track=BD-2026-8912)
      const targetTrackId = urlParams.get('track') || urlParams.get('order');
      if (targetTrackId) {
        setTrackingOrderId(targetTrackId);
      }
    } catch (err) {
      console.log('URL deep-link parsing notice:', err);
    }
  }, [products]);

  useEffect(() => {
    const prev = prevStatesRef.current;

    if (selectedProduct && !prev.selectedProduct) {
      backNavigationManager.pushStep('product_detail', { id: selectedProduct.id });
    }
    if (sharingProduct && !prev.sharingProduct) {
      backNavigationManager.pushStep('share_product', { id: sharingProduct.id });
    }
    if (isPaymentModalOpen && !prev.isPaymentModalOpen) {
      backNavigationManager.pushStep('payment_modal');
    }
    if (isCartOpen && !prev.isCartOpen) {
      backNavigationManager.pushStep('cart_drawer');
    }
    if (isAuthOpen && !prev.isAuthOpen) {
      backNavigationManager.pushStep('auth_modal');
    }
    if (isAiOpen && !prev.isAiOpen) {
      backNavigationManager.pushStep('ai_modal');
    }
    if (trackingOrderId && !prev.trackingOrderId) {
      backNavigationManager.pushStep('tracking_modal', { id: trackingOrderId });
    }
    if (isMobileChatActive && !prev.isMobileChatActive) {
      backNavigationManager.pushStep('mobile_chat');
    }
    if (activePanel !== 'customer' && prev.activePanel === 'customer') {
      backNavigationManager.pushStep('panel_' + activePanel);
    }

    prevStatesRef.current = {
      selectedProduct,
      sharingProduct,
      isPaymentModalOpen,
      isCartOpen,
      isAuthOpen,
      isAiOpen,
      trackingOrderId,
      activePanel,
      isMobileChatActive
    };
  }, [
    selectedProduct, sharingProduct, isPaymentModalOpen, isCartOpen,
    isAuthOpen, isAiOpen, trackingOrderId, activePanel, isMobileChatActive
  ]);

  // Initialize Android Native & Web Back Button Handlers
  useEffect(() => {
    nativeBridge.initNativeFeatures();
  }, []);

  // Register main hierarchical back handler
  useEffect(() => {
    backNavigationManager.setLanguage(language);
    backNavigationManager.setToastCallback((msg, durationMs = 2500) => {
      setExitToastMessage(msg);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setExitToastMessage(null);
      }, durationMs);
    });

    const unregister = backNavigationManager.registerHandler('global_app_layout', () => {
      const s = stateRef.current;

      // 1. Payment Modal
      if (s.isPaymentModalOpen) {
        setIsPaymentModalOpen(false);
        return true;
      }

      // 2. Product Share Modal
      if (s.sharingProduct) {
        setSharingProduct(null);
        return true;
      }

      // 3. Product Detail Modal
      if (s.selectedProduct) {
        setSelectedProduct(null);
        return true;
      }

      // 4. Cart Drawer
      if (s.isCartOpen) {
        setIsCartOpen(false);
        return true;
      }

      // 5. Auth Modal
      if (s.isAuthOpen) {
        setIsAuthOpen(false);
        return true;
      }

      // 6. AI Assistant Modal
      if (s.isAiOpen) {
        setIsAiOpen(false);
        return true;
      }

      // 7. Order Tracking Modal
      if (s.trackingOrderId) {
        setTrackingOrderId(null);
        return true;
      }

      // 8. Mobile Support Chat active thread
      if (s.isMobileChatActive) {
        setIsMobileChatActive(false);
        return true;
      }

      // 9. Active Search or Category Filter in Customer Storefront
      if (s.activePanel === 'customer') {
        if (s.searchQuery) {
          setSearchQuery('');
          return true;
        }
        if (s.selectedCategory) {
          setSelectedCategory(null);
          return true;
        }
        if (s.selectedSellerId) {
          setSelectedSellerId(null);
          return true;
        }
      }

      // 10. Sub-panel navigation back to previous panel or customer storefront
      if (s.activePanel !== 'customer') {
        const history = panelHistoryRef.current;
        if (history.length > 1) {
          history.pop(); // Remove current panel
          const prev = history[history.length - 1] || 'customer';
          setActivePanel(prev as any);
        } else {
          setActivePanel('customer');
        }
        return true;
      }

      // At root storefront with no modals/filters open:
      // Return false so backNavigationManager can show exit toast or allow exit
      return false;
    }, 100);

    return () => {
      unregister();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [language]);

  const handleProceedToCheckout = (
    subtotal: number, discount: number, shipping: number, total: number, coupon?: string
  ) => {
    const defaultAddr = addressService.getDefaultAddress(currentUser);
    setCheckoutPayload({
      subtotal,
      discount,
      shipping,
      total,
      coupon,
      items: cart,
      shippingAddress: defaultAddr
    });
    setIsPaymentModalOpen(true);
  };

  const handleBuyNowDirect = (product: Product, quantity: number, variants: Record<string, string>) => {
    addToCart(product, quantity, variants);
    const price = getProductUnitPrice(product, variants || {});
    const sub = price * quantity;
    const ship = 60;
    const tot = sub + ship;
    const defaultAddr = addressService.getDefaultAddress(currentUser);
    setCheckoutPayload({
      subtotal: sub,
      discount: 0,
      shipping: ship,
      total: tot,
      items: [{ product, quantity, calculatedPrice: price, selectedVariants: variants }],
      shippingAddress: defaultAddr
    });
    setIsPaymentModalOpen(true);
  };

  // Permissions & Role Boundaries Checks
  const isAuthorized = () => {
    const role = currentUser?.role || 'customer';
    if (role === 'admin') return true;
    if (role === 'seller') {
      return ['customer', 'store_directory', 'customer_profile', 'seller', 'inventory_workspace', 'product_reviews', 'customer_messages', 'outlets'].includes(activePanel);
    }
    // Customer or Guest
    return ['customer', 'store_directory', 'customer_profile', 'register_vendor', 'outlets', 'customer_messages'].includes(activePanel);
  };

  const requiresLogin = ['customer_profile', 'register_vendor', 'seller', 'inventory_workspace', 'product_reviews', 'dashboard_home', 'admin', 'settings', 'seller_applications', 'subscription_pricing'].includes(activePanel);

  return (
    <div className="h-screen bg-[#f4f6fa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-row font-sans transition-colors duration-200 overflow-hidden">
      {/* Sidebar Navigation */}
      {!isCustomerOnlyMode && <Sidebar />}

      {/* Main View Side */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen ${activePanel === 'customer_messages' ? 'overflow-hidden' : 'overflow-y-auto'} overflow-x-hidden`}>
        {/* Navigation Header */}
        <Header />

        {/* Main View Area */}
        <main className={`flex-1 max-w-[1800px] w-full mx-auto ${activePanel === 'customer_messages' ? `px-0 pt-0 pb-0 flex flex-col min-h-0 overflow-hidden ${isMobileChatActive ? 'h-[calc(100vh-64px)]' : 'h-[calc(100vh-120px)] lg:h-[calc(100vh-64px)]'}` : 'px-1 sm:px-2 md:px-3 pt-2 sm:pt-4 pb-24 md:pb-6'}`}>
          {!currentUser && requiresLogin ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-xs max-w-md mx-auto my-12 animate-fade-in">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 border border-amber-500/20">
                <KeyRound className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">
                {language === 'bn' ? 'সাইন ইন করা প্রয়োজন' : 'Authentication Required'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {language === 'bn' 
                  ? 'এই প্যানেলটি দেখতে ও ম্যানেজ করতে আপনার অ্যাকাউন্টে সাইন ইন করুন।' 
                  : 'Please sign in to your merchant, buyer or operator account to view this section.'}
              </p>
              <div className="flex flex-col space-y-2 w-full">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="w-full py-3 bg-gradient-to-tr from-[#da1c24] to-red-500 text-white font-black rounded-xl text-xs shadow-md transition transform active:scale-95 cursor-pointer"
                >
                  {language === 'bn' ? 'সাইন ইন / রেজিস্ট্রেশন' : 'Sign In / Register'}
                </button>
                <button
                  onClick={() => setActivePanel('customer')}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  {language === 'bn' ? 'স্টোরফ্রন্ট এ ফিরে যান' : 'Go to Storefront'}
                </button>
              </div>
            </div>
          ) : !isAuthorized() ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-xs max-w-md mx-auto my-12 animate-fade-in">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-150 mb-2">
                {language === 'bn' ? 'অ্যাক্সেস সংরক্ষিত' : 'Access Restricted'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {language === 'bn' 
                  ? 'দুঃখিত, এই সেকশনটি দেখার জন্য আপনার অ্যাকাউন্টের পর্যাপ্ত পারমিশন নেই।' 
                  : 'Your current account level does not have permission to view this panel.'}
              </p>
              <div className="flex flex-col space-y-2 w-full">
                <button
                  onClick={() => setActivePanel(currentUser?.role === 'seller' ? 'seller' : 'customer')}
                  className="w-full py-3 bg-gradient-to-tr from-[#da1c24] to-red-500 text-white font-black rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  {language === 'bn' ? 'আমার ড্যাশবোর্ড এ ফিরে যান' : 'Back to My Dashboard'}
                </button>
                <button
                  onClick={() => setActivePanel('customer')}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  {language === 'bn' ? 'স্টোরফ্রন্ট এ ফিরে যান' : 'Go to Storefront'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {activePanel === 'dashboard_home' && (
                <DashboardHome />
              )}

              {activePanel === 'customer' && (
                <CustomerView 
                  onOpenProduct={(product) => setSelectedProduct(product)} 
                  onBuyNow={handleBuyNowDirect}
                />
              )}

              {activePanel === 'store_directory' && (
                currentUser?.role === 'customer' || !currentUser ? (
                  <CustomerTrackingSupport />
                ) : (
                  <StoreDirectory />
                )
              )}

              {activePanel === 'inventory_workspace' && (
                <InventoryWorkspace />
              )}

              {activePanel === 'product_reviews' && (
                <ProductReviewsPanel />
              )}

              {activePanel === 'customer_messages' && (
                <CustomerMessagesPanel />
              )}

              {activePanel === 'register_vendor' && (
                <RegisterVendorShop />
              )}

              {activePanel === 'seller' && (
                <SellerDashboard />
              )}

              {activePanel === 'seller_applications' && (
                <SellerApplications />
              )}

              {activePanel === 'product_approvals' && (
                <ProductApprovals />
              )}

              {activePanel === 'admin' && (
                <AdminDashboard />
              )}

              {activePanel === 'subscription_pricing' && (
                <SubscriptionSettings />
              )}

              {activePanel === 'settings' && (
                <SettingsView />
              )}

              {activePanel === 'customer_profile' && (
                <CustomerProfilePanel />
              )}

              {activePanel === 'outlets' && (
                <OutletsView />
              )}
            </>
          )}
        </main>

        {/* Shared Modals */}
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuyNow={handleBuyNowDirect}
        />

        <ProductShareModal
          product={sharingProduct}
          onClose={() => setSharingProduct(null)}
        />

        <CartDrawer
          onProceedToCheckout={handleProceedToCheckout}
        />

        {checkoutPayload && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            cartItems={checkoutPayload.items}
            shippingAddress={checkoutPayload.shippingAddress}
            subtotal={checkoutPayload.subtotal}
            discountAmount={checkoutPayload.discount}
            shippingFee={checkoutPayload.shipping}
            totalAmount={checkoutPayload.total}
            couponCode={checkoutPayload.coupon}
            onSuccess={(orderId) => {
              console.log('Order created successfully:', orderId);
            }}
          />
        )}

        <AuthModal />
        <AiAssistantModal />
        <OrderTrackingModal />
        <LocationPickerModal 
          isOpen={isLocationModalOpen} 
          onClose={() => setIsLocationModalOpen(false)} 
        />

        {/* Exit Toast Notification on Double Back Press */}
        {exitToastMessage && (
          <div className="fixed bottom-20 sm:bottom-10 left-1/2 -translate-x-1/2 z-9999 animate-in fade-in slide-in-from-bottom-5 duration-200 pointer-events-none max-w-[90vw]">
            <div className="bg-slate-900/95 dark:bg-slate-800/95 text-white text-[12px] font-bold px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
              <span className="truncate">{exitToastMessage}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        {['customer', 'dashboard_home', 'outlets'].includes(activePanel) && <Footer />}
        {!isCustomerOnlyMode && <BottomNavigation />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
