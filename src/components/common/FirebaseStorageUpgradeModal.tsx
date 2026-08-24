import React, { useState } from 'react';
import { 
  X, Check, Sparkles, HardDrive, Database, ShieldCheck, 
  ArrowRight, Flame, Zap, Award, CreditCard, ChevronRight 
} from 'lucide-react';
import { FIREBASE_STORAGE_PLANS, FirebaseStoragePlan, storageManager } from '../../lib/storageManager';

interface FirebaseStorageUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
  sellerId?: string;
  storeName?: string;
  currentCapacityGb?: number;
  onPlanUpgraded?: (newCapacityGb: number, planId: string) => void;
}

export const FirebaseStorageUpgradeModal: React.FC<FirebaseStorageUpgradeModalProps> = ({
  isOpen,
  onClose,
  language = 'bn',
  sellerId = 'sel-1',
  storeName = 'আমার বাজার শপ',
  currentCapacityGb = 5,
  onPlanUpgraded
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('blaze_15gb');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customGb, setCustomGb] = useState<number>(25);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'card'>('bkash');
  const [phone, setPhone] = useState<string>('01700000000');
  const [txnId, setTxnId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [activatedGb, setActivatedGb] = useState<number>(15);

  if (!isOpen) return null;

  const currentPlan = FIREBASE_STORAGE_PLANS.find(p => p.id === selectedPlanId) || FIREBASE_STORAGE_PLANS[1];
  const customPriceBdt = customGb * 25; // 25 BDT per GB/month

  const finalTotalGb = isCustom ? customGb : currentPlan.totalGb;
  const finalPriceBdt = isCustom ? customPriceBdt : currentPlan.priceBdt;

  const handleConfirmPurchase = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const generatedTxn = txnId || `TXN-FBS-${Date.now().toString().slice(-6)}`;
      const res = storageManager.savePurchasedPlan(
        sellerId,
        isCustom ? 'custom_blaze' : selectedPlanId,
        finalTotalGb,
        generatedTxn
      );

      setActivatedGb(res.totalGb);
      setIsProcessing(false);
      setIsSuccess(true);

      if (onPlanUpgraded) {
        onPlanUpgraded(res.totalGb, isCustom ? 'custom_blaze' : selectedPlanId);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 text-xs">
        
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-950/80 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  {language === 'bn' ? 'ফায়ারবেস স্টোরেজ ও মেমোরি আপগ্রেড' : 'Firebase Storage & Memory Upgrade'}
                </h3>
                <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Quota
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                {storeName} • {language === 'bn' ? `বর্তমান কোটা: ${currentCapacityGb} GB` : `Current Quota: ${currentCapacityGb} GB`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {isSuccess ? (
            <div className="py-8 px-4 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                <Check className="w-8 h-8" />
              </div>
              
              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  {language === 'bn' ? '🎉 স্টোরেজ সফলভাবে সক্রিয় হয়েছে!' : '🎉 Storage Upgraded Successfully!'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {language === 'bn' 
                    ? `আপনার ফায়ারবেস ক্লাউড স্টোরেজ ক্যাপাসিটি বাড়িয়ে ${activatedGb} GB করা হয়েছে। লাইভ স্টোরেজ মিটারে এটি সাথে সাথে যুক্ত হয়েছে।`
                    : `Your Firebase Cloud Storage limit has been upgraded to ${activatedGb} GB. The live storage meter has been updated.`
                  }
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-sm mx-auto text-left font-mono space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'bn' ? 'মোট মেমোরি:' : 'Total Capacity:'}</span>
                  <span className="font-extrabold text-emerald-500">{activatedGb} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'bn' ? 'স্ট্যাটাস:' : 'Status:'}</span>
                  <span className="font-bold text-slate-200">ACTIVE & READY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'bn' ? 'পরিশোধিত অর্থ:' : 'Amount:'}</span>
                  <span className="font-bold text-slate-200">৳ {finalPriceBdt} BDT</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition cursor-pointer shadow-md"
              >
                {language === 'bn' ? 'ঠিক আছে, বন্ধ করুন' : 'Got it, Close'}
              </button>
            </div>
          ) : (
            <>
              {/* PLAN CARDS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {language === 'bn' ? '১. মেমোরি প্ল্যান নির্বাচন করুন' : '1. Choose Storage Plan'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCustom(!isCustom)}
                    className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    {isCustom ? (language === 'bn' ? 'স্ট্যান্ডার্ড প্ল্যান দেখুন' : 'View Standard Plans') : (language === 'bn' ? '+ কাস্টম জিবি লিখুন' : '+ Custom GB Input')}
                  </button>
                </div>

                {!isCustom ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FIREBASE_STORAGE_PLANS.map(plan => {
                      const isSelected = selectedPlanId === plan.id;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500 shadow-sm ring-1 ring-amber-500'
                              : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-amber-400/50'
                          }`}
                        >
                          {plan.badgeBn && (
                            <div className="absolute top-2.5 right-2.5">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}>
                                {language === 'bn' ? plan.badgeBn : plan.badgeEn}
                              </span>
                            </div>
                          )}

                          <div className="space-y-1">
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
                              <span>{language === 'bn' ? plan.nameBn : plan.nameEn}</span>
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                              {language === 'bn' ? plan.descriptionBn : plan.descriptionEn}
                            </p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-baseline justify-between">
                            <div>
                              <span className="text-base font-black text-amber-500 font-mono">
                                {plan.priceBdt === 0 ? (language === 'bn' ? 'ফ্রি' : 'Free') : `৳ ${plan.priceBdt}`}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-1">
                                / {plan.billingCycle}
                              </span>
                            </div>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 font-mono">
                              {plan.totalGb} GB
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-amber-500/40 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {language === 'bn' ? 'আপনার প্রয়োজনীয় মেমোরি (GB):' : 'Required Memory (GB):'}
                      </span>
                      <span className="font-mono text-base font-black text-amber-500">
                        {customGb} GB (৳ {customPriceBdt} / মাস)
                      </span>
                    </div>

                    <input
                      type="range"
                      min={10}
                      max={500}
                      step={5}
                      value={customGb}
                      onChange={(e) => setCustomGb(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />

                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={5}
                        max={1000}
                        value={customGb}
                        onChange={(e) => setCustomGb(Math.max(5, Number(e.target.value)))}
                        className="w-28 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold"
                      />
                      <span className="text-slate-400 text-[10.5px]">
                        {language === 'bn' ? 'জিবি (প্রতি জিবি মাত্র ২৫ টাকা/মাস)' : 'GB (@ 25 BDT per GB/month)'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* PAYMENT & CHECKOUT */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  {language === 'bn' ? '২. পেমেন্ট মেথড ও তথ্য' : '2. Payment Method'}
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bkash', label: 'বিকাশ (bKash)', color: 'border-pink-500 bg-pink-500/10 text-pink-600' },
                    { id: 'nagad', label: 'নগদ (Nagad)', color: 'border-orange-500 bg-orange-500/10 text-orange-600' },
                    { id: 'card', label: 'কার্ড (Visa/Master)', color: 'border-blue-500 bg-blue-500/10 text-blue-600' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition flex items-center justify-center text-center cursor-pointer ${
                        paymentMethod === m.id
                          ? m.color + ' font-black'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'bn' ? 'মোবাইল নম্বর:' : 'Phone Number:'}
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'bn' ? 'ট্রানজেকশন আইডি (ঐচ্ছিক):' : 'Transaction ID (Optional):'}
                    </label>
                    <input
                      type="text"
                      value={txnId}
                      onChange={(e) => setTxnId(e.target.value)}
                      placeholder="TXN-XXXXXX"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SUMMARY & SUBMIT */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    {language === 'bn' ? 'মোট প্রদেয়:' : 'Total Payable:'}
                  </span>
                  <span className="text-lg font-black text-amber-500 font-mono">
                    ৳ {finalPriceBdt} BDT
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition flex items-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {isProcessing 
                      ? (language === 'bn' ? 'প্রসেসিং হচ্ছে...' : 'Processing...')
                      : (language === 'bn' ? `স্টোরেজ কিনুন (${finalTotalGb} GB)` : `Buy Storage (${finalTotalGb} GB)`)
                    }
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
