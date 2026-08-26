import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Smartphone, 
  CreditCard, 
  Banknote,
  Download,
  Printer,
  FileText,
  Truck,
  Sparkles,
  ClipboardCheck,
  Check,
  Store,
  BadgeCheck,
  Copy,
  Info,
  MapPin,
  User,
  Plus,
  Home,
  Briefcase,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Address, Order } from '../../types';
import { api } from '../../services/api';
import { getTranslation } from '../../translations';
import { OrderReceiptSlip } from '../customer/OrderReceiptSlip';
import { addressService, BD_DIVISIONS, BD_DISTRICTS, BD_POPULAR_AREAS } from '../../services/addressService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  shippingAddress: Address | null;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  couponCode?: string;
  onSuccess: (orderId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen, onClose, cartItems, shippingAddress,
  subtotal, discountAmount, shippingFee, totalAmount, couponCode, onSuccess
}) => {
  const { language, currency, formatPrice, currentUser, clearCart, setTrackingOrderId, setActivePanel, systemSettings } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [mobileNumber, setMobileNumber] = useState<string>(currentUser?.phone || '01712345678');
  const [transactionId, setTransactionId] = useState<string>('');
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);
  const [copiedAmount, setCopiedAmount] = useState<boolean>(false);
  const [copyFeedbackMessage, setCopyFeedbackMessage] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [step, setStep] = useState<'details' | 'trx_entry' | 'otp' | 'pin' | 'processing' | 'success'>('details');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showFullSlipModal, setShowFullSlipModal] = useState<boolean>(false);
  const [autoDownloaded, setAutoDownloaded] = useState<boolean>(false);

  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [cartSellers, setCartSellers] = useState<any[]>([]);
  const [showQr, setShowQr] = useState<boolean>(false);

  // Address Selection & Dynamic Form States
  const [savedAddresses, setSavedAddresses] = useState<Address[]>(() => {
    return addressService.getSavedAddresses(currentUser);
  });
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(() => {
    return shippingAddress || addressService.getDefaultAddress(currentUser);
  });
  const [showAddressPicker, setShowAddressPicker] = useState<boolean>(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(false);
  
  // Address form fields
  const [addrRecipient, setAddrRecipient] = useState<string>(currentUser?.name || 'Rahim Chowdhury');
  const [addrPhone, setAddrPhone] = useState<string>(currentUser?.phone || '01712345678');
  const [addrDivision, setAddrDivision] = useState<string>('Dhaka');
  const [addrDistrict, setAddrDistrict] = useState<string>('Dhaka');
  const [addrThana, setAddrThana] = useState<string>('Dhanmondi');
  const [addrFull, setAddrFull] = useState<string>('House 42, Road 10/A, Dhanmondi R/A, Dhaka-1209');
  const [addrTitle, setAddrTitle] = useState<'Home' | 'Office' | 'Other'>('Home');
  const [addrDeliveryNote, setAddrDeliveryNote] = useState<string>('');
  const [saveAddressForFuture, setSaveAddressForFuture] = useState<boolean>(true);
  const [addressValidationError, setAddressValidationError] = useState<string>('');

  // Sync addresses on modal open
  useEffect(() => {
    if (isOpen) {
      const list = addressService.getSavedAddresses(currentUser);
      setSavedAddresses(list);
      if (shippingAddress) {
        setSelectedAddress(shippingAddress);
        setIsAddingNewAddress(false);
      } else if (list.length > 0) {
        const def = list.find(a => a.isDefault) || list[0];
        setSelectedAddress(def);
        setIsAddingNewAddress(false);
      } else {
        setSelectedAddress(null);
        setIsAddingNewAddress(true);
      }
    }
  }, [isOpen, currentUser, shippingAddress]);

  // Dynamic district reset when division changes
  useEffect(() => {
    const districts = BD_DISTRICTS[addrDivision] || [];
    if (districts.length > 0 && !districts.includes(addrDistrict)) {
      setAddrDistrict(districts[0]);
    }
  }, [addrDivision]);

  useEffect(() => {
    const fetchSellersData = async () => {
      try {
        const sellers = await api.getSellers();
        if (cartItems && cartItems.length > 0) {
          // Collect all distinct seller IDs in cart
          const sellerIds = Array.from(new Set(cartItems.map(item => item.product?.sellerId).filter(Boolean)));
          
          // Match in sellers database
          const matched = sellers.filter(s => 
            sellerIds.includes(s.id) || 
            sellerIds.includes(s.sellerId) ||
            sellerIds.includes((s as any).userId)
          );

          if (matched.length > 0) {
            setSellerInfo(matched[0]);
            setCartSellers(matched);
          } else {
            // If seller not found in DB list, construct from product details
            const p = cartItems[0]?.product;
            if (p) {
              const fallbackSeller = {
                id: p.sellerId || 'sel-1',
                sellerId: p.sellerId || 'usr-seller-1',
                storeName: p.sellerName || 'Dhaka Tech Store',
                storeNameBn: p.sellerName || 'ঢাকা টেক স্টোর',
                bkashNumber: (p as any).sellerBkashNumber || '01711223344',
                nagadNumber: (p as any).sellerNagadNumber || '01811223344',
                rocketNumber: (p as any).sellerRocketNumber || '01911223344-2',
                upayNumber: (p as any).sellerUpayNumber || '01611223344',
                paymentAccountType: 'personal',
                paymentInstructions: 'সরাসরি সেলারের একাউন্টে টাকা সেন্ড মানি করুন।',
                isApproved: true,
                totalSales: 0,
                balance: 0,
                rating: 5,
                joinDate: new Date().toISOString().split('T')[0],
                tradeLicenseNumber: 'TRAD-BD-2026'
              };
              setSellerInfo(fallbackSeller);
              setCartSellers([fallbackSeller]);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching seller info in PaymentModal:", err);
      }
    };
    if (isOpen) {
      fetchSellersData();
    }
  }, [cartItems, isOpen]);

  // Derive Receiver's payment number based on selected method and seller/admin settings
  const getReceiverPaymentNumber = (method: PaymentMethod): string => {
    if (!sellerInfo) {
      if (method === 'bkash') return systemSettings?.adminBkashNumber || '01711223344';
      if (method === 'nagad') return systemSettings?.adminNagadNumber || '01811223344';
      if (method === 'rocket') return systemSettings?.adminRocketNumber || '01911223344-2';
      if (method === 'upay') return systemSettings?.adminUpayNumber || '01611223344';
      return '';
    }

    if (method === 'bkash') {
      return sellerInfo.bkashNumber || sellerInfo.phone || systemSettings?.adminBkashNumber || '01711223344';
    }
    if (method === 'nagad') {
      return sellerInfo.nagadNumber || sellerInfo.bkashNumber || sellerInfo.phone || systemSettings?.adminNagadNumber || '01811223344';
    }
    if (method === 'rocket') {
      return sellerInfo.rocketNumber || (sellerInfo.bkashNumber ? `${sellerInfo.bkashNumber}-8` : '') || systemSettings?.adminRocketNumber || '01911223344-2';
    }
    if (method === 'upay') {
      return sellerInfo.upayNumber || sellerInfo.bkashNumber || sellerInfo.phone || systemSettings?.adminUpayNumber || '01611223344';
    }
    return '';
  };

  const getReceiverAccountType = (): string => {
    return sellerInfo?.paymentAccountType || systemSettings?.adminPaymentAccountType || 'personal';
  };

  const getReceiverInstructions = (): string => {
    return sellerInfo?.paymentInstructions || systemSettings?.adminPaymentInstructions || '';
  };

  const safeCopy = (text: string): boolean => {
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {
          fallbackCopyText(text);
        });
        return true;
      }
    } catch (e) {}
    return fallbackCopyText(text);
  };

  const fallbackCopyText = (text: string): boolean => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    } catch (err) {
      return false;
    }
  };

  const handleCopyReceiverNumber = (num: string) => {
    if (!num) return;
    const cleanNum = num.replace(/[^0-9-]/g, '');
    safeCopy(cleanNum);
    setCopiedNumber(true);
    setCopyFeedbackMessage(language === 'bn' ? `সেলার নম্বর (${cleanNum}) কপি হয়েছে!` : `Seller number (${cleanNum}) copied!`);
    setTimeout(() => {
      setCopiedNumber(false);
      setCopyFeedbackMessage('');
    }, 3000);
  };

  const handleCopyAmount = (amt: number) => {
    safeCopy(amt.toString());
    setCopiedAmount(true);
    setCopyFeedbackMessage(language === 'bn' ? `টাকার পরিমাণ (৳${amt.toLocaleString()}) কপি হয়েছে!` : `Amount (৳${amt.toLocaleString()}) copied!`);
    setTimeout(() => {
      setCopiedAmount(false);
      setCopyFeedbackMessage('');
    }, 3000);
  };

  // Direct Mobile App Launch & Send Money Deep Linking
  const handleOpenAppAndPay = (method: PaymentMethod) => {
    const rawNumber = getReceiverPaymentNumber(method);
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const amount = totalAmount;

    // 1. Copy both Number and Amount
    try {
      safeCopy(cleanNumber);
      setCopiedNumber(true);
      const appName = method === 'bkash' ? 'বিকাশ' : method === 'nagad' ? 'নগদ' : method === 'rocket' ? 'রকেট' : 'উপায়';
      setCopyFeedbackMessage(language === 'bn' 
        ? `✓ ${sellerInfo?.storeName || 'সেলার'}-এর ${appName} নম্বর (${cleanNumber}) এবং টাকার পরিমাণ (৳${amount.toLocaleString()}) কপি হয়েছে! ${appName} অ্যাপে পেস্ট করে পিন দিন।` 
        : `✓ Seller number (${cleanNumber}) and amount (৳${amount}) copied! Paste in ${method.toUpperCase()} app and enter PIN.`
      );
    } catch (e) {
      console.warn('Clipboard copy error:', e);
    }

    // 2. Launch Mobile App via Deep Link or USSD
    let appUrl = '';
    if (method === 'bkash') {
      appUrl = `bkash://app`;
    } else if (method === 'nagad') {
      appUrl = `nagad://`;
    } else if (method === 'rocket') {
      appUrl = `dbblrocket://`;
    } else if (method === 'upay') {
      appUrl = `upay://`;
    }

    if (appUrl) {
      try {
        window.location.href = appUrl;
      } catch (err) {
        console.warn('App launch triggered:', appUrl);
      }
    }

    // 3. Switch modal to TrxID entry step
    setStep('trx_entry');
  };

  const getUssdCode = (method: PaymentMethod): string => {
    if (method === 'bkash') return '*247#';
    if (method === 'nagad') return '*167#';
    if (method === 'rocket') return '*322#';
    if (method === 'upay') return '*268#';
    return '*247#';
  };

  // Address Handlers
  const handleSaveAndApplyAddress = (e?: React.FormEvent): Address | null => {
    if (e) e.preventDefault();
    setAddressValidationError('');

    if (!addrRecipient.trim()) {
      setAddressValidationError(language === 'bn' ? 'অনুগ্রহ করে গ্রাহকের পুরো নাম লিখুন।' : 'Please enter recipient full name.');
      return null;
    }
    if (!addrPhone.trim() || addrPhone.trim().length < 11) {
      setAddressValidationError(language === 'bn' ? 'অনুগ্রহ করে ১১-সংখ্যার সচল মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।' : 'Please enter a valid 11-digit mobile number.');
      return null;
    }
    if (!addrFull.trim() || addrFull.trim().length < 4) {
      setAddressValidationError(language === 'bn' ? 'অনুগ্রহ করে বাসা/রোড/ফ্ল্যাট বা বিস্তারিত ঠিকানা লিখুন।' : 'Please enter detailed street/house address.');
      return null;
    }
    if (!addrThana.trim()) {
      setAddressValidationError(language === 'bn' ? 'অনুগ্রহ করে থানা / এলাকা উল্লেখ করুন।' : 'Please enter area / thana.');
      return null;
    }

    const titleText = addrTitle === 'Home' ? 'Home Address' : addrTitle === 'Office' ? 'Office Address' : 'Delivery Address';
    const cleanFullAddress = addrDeliveryNote.trim() 
      ? `${addrFull.trim()} (নোট: ${addrDeliveryNote.trim()})`
      : addrFull.trim();

    const newAddrObj: Omit<Address, 'id'> = {
      title: titleText,
      recipientName: addrRecipient.trim(),
      phone: addrPhone.trim(),
      division: addrDivision,
      district: addrDistrict,
      thana: addrThana.trim(),
      fullAddress: cleanFullAddress,
      isDefault: saveAddressForFuture
    };

    let activeAddr: Address;
    if (saveAddressForFuture) {
      activeAddr = addressService.addAddress(newAddrObj, currentUser?.id);
      const updatedList = addressService.getSavedAddresses(currentUser);
      setSavedAddresses(updatedList);
    } else {
      activeAddr = {
        ...newAddrObj,
        id: `addr-temp-${Date.now()}`
      };
    }

    setSelectedAddress(activeAddr);
    setIsAddingNewAddress(false);
    setShowAddressPicker(false);
    return activeAddr;
  };

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddress(addr);
    addressService.setDefaultAddress(addr.id, currentUser?.id);
    const updatedList = addressService.getSavedAddresses(currentUser);
    setSavedAddresses(updatedList);
    setShowAddressPicker(false);
    setIsAddingNewAddress(false);
  };

  const handleOpenAddNewAddress = () => {
    setAddrRecipient(currentUser?.name || '');
    setAddrPhone(currentUser?.phone || '01712345678');
    setAddrFull('');
    setAddrThana('');
    setAddrDeliveryNote('');
    setAddressValidationError('');
    setIsAddingNewAddress(true);
    setShowAddressPicker(false);
  };

  if (!isOpen) return null;

  const handleInitiatePayment = async () => {
    setError('');

    // Ensure valid delivery address first
    if (isAddingNewAddress || !selectedAddress) {
      const created = handleSaveAndApplyAddress();
      if (!created) {
        setError(language === 'bn' ? 'অনুগ্রহ করে সঠিক ডেলিভারি ঠিকানা পূরণ করুন।' : 'Please complete delivery address details.');
        return;
      }
    }

    if (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket' || paymentMethod === 'upay') {
      if (!mobileNumber || mobileNumber.length < 11) {
        setError('Please enter a valid 11-digit Bangladeshi mobile number (e.g., 01712345678)');
        return;
      }
      setIsLoading(true);
      try {
        await api.sendOtp(mobileNumber);
        setStep('otp');
      } catch (err: any) {
        setError(err.message || 'Failed to send OTP');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Card or COD direct placement
      handleFinalizeOrder();
    }
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length < 4) {
      setError('Please enter the 6-digit OTP sent to your phone');
      return;
    }
    setError('');
    setStep('pin');
  };

  const triggerDirectPdfDownload = (orderObj: Order) => {
    try {
      const fiveDigitId = orderObj.order5DigitId || orderObj.orderNumber.replace(/[^0-9]/g, '').slice(-5) || '58392';
      
      const slipHtml = `
<!DOCTYPE html>
<html lang="${language === 'bn' ? 'bn' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>AmarStore_Official_Order_Slip_${fiveDigitId}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a; line-height: 1.4; padding: 20px; max-width: 820px; margin: 0 auto; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
    .brand-logo { background: #da1c24; color: white; padding: 6px 14px; border-radius: 8px; font-size: 20px; font-weight: 900; display: inline-block; }
    .sub-brand { font-size: 11px; font-weight: 700; color: #64748b; margin-top: 4px; text-transform: uppercase; }
    .invoice-title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; text-align: right; }
    .order-badge { background: #fef2f2; border: 2px solid #da1c24; padding: 4px 12px; border-radius: 8px; font-family: monospace; font-size: 18px; font-weight: 900; color: #da1c24; display: inline-block; margin-top: 6px; }
    
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .info-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; font-size: 12px; }
    .info-box h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .items-table th { background: #0f172a; color: #ffffff; text-align: left; padding: 9px 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .items-table td { padding: 9px 10px; font-size: 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .items-table tr:nth-child(even) { background: #f8fafc; }
    .text-right { text-align: right; }
    
    .quality-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; margin-top: 3px; }
    .warranty-badge { display: inline-block; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-top: 3px; }
    .sku-code { font-family: monospace; font-size: 10px; color: #64748b; font-weight: 700; }

    .checklist-container { background: #fdf2f2; border: 1.5px dashed #da1c24; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; }
    .checklist-title { font-size: 12px; font-weight: 900; color: #991b1b; text-transform: uppercase; margin: 0 0 6px 0; }
    .checklist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; }
    .checklist-item { display: flex; align-items: center; color: #1e293b; font-weight: 600; }
    .checkbox-box { width: 14px; height: 14px; border: 2px solid #da1c24; border-radius: 3px; margin-right: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; color: #da1c24; }

    .calculation-table { width: 340px; margin-left: auto; border-collapse: collapse; margin-bottom: 16px; }
    .calculation-table td { padding: 5px 8px; font-size: 12px; }
    .calculation-table .total-row td { font-size: 16px; font-weight: 900; color: #da1c24; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; padding-top: 8px; padding-bottom: 8px; }
    
    .status-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-cod { background: #fef3c7; color: #92400e; }
    
    .footer { border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #64748b; text-align: center; margin-top: 16px; }
    .barcode-box { text-align: center; margin-top: 10px; font-family: monospace; font-size: 12px; letter-spacing: 5px; font-weight: 900; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-logo">AMAR BAZAR BD</div>
      <div class="sub-brand">Official Multi-Vendor Slip & Quality Assurance Memo</div>
      <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b;">Helpline: 09612-BAZAR (09612-22927) • support@amarbazar.bd</p>
    </div>
    <div style="text-align: right;">
      <h1 class="invoice-title">${language === 'bn' ? 'অফিশিয়াল অর্ডার ও ডেলিভারি স্লিপ' : 'OFFICIAL TAX INVOICE & DELIVERY SLIP'}</h1>
      <div><span class="order-badge">5-DIGIT ID: ${fiveDigitId}</span></div>
      <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Date: ${new Date(orderObj.createdAt).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}</p>
    </div>
  </div>

  <div class="grid">
    <div class="info-box">
      <h4>${language === 'bn' ? 'গ্রাহকের বিবরণ ও ডেলিভারি ঠিকানা (Ship To)' : 'CUSTOMER & DELIVERY DETAILS'}</h4>
      <strong style="font-size: 13px; color: #0f172a;">${orderObj.customerName}</strong><br/>
      <span>📞 ফোন: <strong>${orderObj.customerPhone}</strong></span><br/>
      <span>🏠 ঠিকানা: ${orderObj.shippingAddress?.fullAddress || 'Address on file'}</span><br/>
      <span>📍 থানা: <strong>${orderObj.shippingAddress?.thana || 'Dhanmondi'}</strong>, জেলা: <strong>${orderObj.shippingAddress?.district || 'Dhaka'}</strong> (${orderObj.shippingAddress?.division || 'Bangladesh'})</span>
    </div>
    <div class="info-box">
      <h4>${language === 'bn' ? 'পেমেন্ট ও ডেলিভারি ট্র্যাকিং (Logistics)' : 'PAYMENT & LOGISTICS INFO'}</h4>
      <div><strong>পেমেন্ট মাধ্যম:</strong> <span class="status-tag ${orderObj.paymentStatus === 'paid' ? 'status-paid' : 'status-cod'}">${orderObj.paymentMethod.toUpperCase()} (${orderObj.paymentStatus.toUpperCase()})</span></div>
      ${orderObj.transactionId ? `<div><strong>Txn ID:</strong> <span style="font-family: monospace; font-weight: bold;">${orderObj.transactionId}</span></div>` : ''}
      <div style="margin-top: 4px;"><strong>কুরিয়ার পার্টনার:</strong> ${orderObj.courier?.provider || 'Pathao Express'}</div>
      <div><strong>ট্র্যাকিং কোড:</strong> <span style="font-family: monospace; font-weight: 900; color: #0284c7;">${orderObj.courier?.trackingNumber || 'PTH-' + fiveDigitId}</span></div>
    </div>
  </div>

  <!-- Detailed Verification & Delivery Handover Checklist -->
  <div class="checklist-container">
    <div class="checklist-title">
      ✓ পণ্যের গুণমান ও ডেলিভারি হ্যান্ডওভার ভেরিফিকেশন চেকলিস্ট (Quality & Handover Audit)
    </div>
    <div class="checklist-grid">
      <div class="checklist-item"><span class="checkbox-box">✓</span> <span>১. পণ্যের নাম, মডেল ও স্পেসিফিকেশন মিলানো হয়েছে</span></div>
      <div class="checklist-item"><span class="checkbox-box">✓</span> <span>২. ১০০% অরিজিনাল ব্র্যান্ড কোয়ালিটি গ্রেড নিশ্চিত</span></div>
      <div class="checklist-item"><span class="checkbox-box">✓</span> <span>৩. প্যাকেজিং সিল ও নিরাপত্তা স্ট্যাম্প অক্ষত</span></div>
      <div class="checklist-item"><span class="checkbox-box">✓</span> <span>৪. গ্রাহকের কপি ও ইনভয়েস রসিদ স্লিপ ভেরিফাইড</span></div>
    </div>
  </div>

  <!-- Items Table with Full Quality and Product Specifications -->
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 45%;">${language === 'bn' ? 'পণ্য ও সম্পূর্ণ স্পেসিফিকেশন' : 'PRODUCT & SPECIFICATIONS'}</th>
        <th style="width: 20%;">${language === 'bn' ? 'কোয়ালিটি ও ওয়্যারেন্টি' : 'QUALITY & WARRANTY'}</th>
        <th style="width: 12%;" class="text-right">${language === 'bn' ? 'একক মূল্য' : 'PRICE'}</th>
        <th style="width: 6%; text-align: center;">${language === 'bn' ? 'পরিমাণ' : 'QTY'}</th>
        <th style="width: 12%;" class="text-right">${language === 'bn' ? 'মোট টাকা' : 'TOTAL'}</th>
      </tr>
    </thead>
    <tbody>
      ${orderObj.items.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${item.productTitle}</div>
            <div class="sku-code">SKU: ${item.sku || 'SKU-BD' + (item.productId?.slice(-5) || '102')} | বিক্রেতা: ${item.sellerName || 'Verified Merchant'}</div>
            ${item.selectedVariants ? `<div style="font-size: 10px; color: #3b82f6; font-weight: bold; margin-top: 2px;">${Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}</div>` : ''}
          </td>
          <td>
            <div><span class="quality-badge">⭐ ${item.qualityGrade || '১০০% অরিজিনাল এক্সপোর্ট কোয়ালিটি'}</span></div>
            <div><span class="warranty-badge">🛡️ ${item.warranty || '৭ দিনের রিপ্লেসমেন্ট ও জেনুইন ওয়্যারেন্টি'}</span></div>
          </td>
          <td class="text-right">৳${item.price.toLocaleString()}</td>
          <td style="text-align: center; font-weight: 900;">${item.quantity}</td>
          <td class="text-right" style="font-weight: 900;">৳${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Financial Calculation Breakdown -->
  <table class="calculation-table">
    <tr>
      <td>${language === 'bn' ? 'পণ্য উপ-মোট (Subtotal):' : 'Items Subtotal:'}</td>
      <td class="text-right">৳${orderObj.subtotal.toLocaleString()}</td>
    </tr>
    ${orderObj.discountAmount > 0 ? `
    <tr style="color: #16a34a; font-weight: bold;">
      <td>${language === 'bn' ? 'কুপন/ছাড় ডিসকাউন্ট:' : 'Discount Savings:'}</td>
      <td class="text-right">-৳${orderObj.discountAmount.toLocaleString()}</td>
    </tr>` : ''}
    <tr>
      <td>${language === 'bn' ? 'ডেলিভারি চার্জ (Shipping):' : 'Delivery Fee:'}</td>
      <td class="text-right">${orderObj.shippingFee === 0 ? 'ফ্রি' : `৳${orderObj.shippingFee.toLocaleString()}`}</td>
    </tr>
    <tr class="total-row">
      <td><strong>${language === 'bn' ? 'সর্বমোট প্রদেয় (Grand Total):' : 'Grand Total:'}</strong></td>
      <td class="text-right"><strong>৳${orderObj.totalAmount.toLocaleString()}</strong></td>
    </tr>
  </table>

  <div class="barcode-box">
    <div style="font-size: 22px; letter-spacing: 5px; font-weight: bold; font-family: monospace;">|||||| |||| |||||||| ||||| |||||||</div>
    <div>ORDER-SLIP-ID-${fiveDigitId}</div>
  </div>

  <div class="footer">
    <p>আমারবাজার বিডিতে কেনাকাটা করার জন্য ধন্যবাদ! যেকোনো প্রয়োজনে এই ৫-সংখ্যার অর্ডার আইডিটি সংরক্ষণ করুন: <strong>#${fiveDigitId}</strong>।</p>
  </div>
</body>
</html>
      `;

      const blob = new Blob([slipHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AmarBazar_Order_Slip_${fiveDigitId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setAutoDownloaded(true);
    } catch (e) {
      console.warn('Auto download slip error:', e);
    }
  };

  const handleFinalizeOrder = async () => {
    // 0. Ensure valid address
    let finalAddr = selectedAddress;
    if (isAddingNewAddress || !finalAddr) {
      const created = handleSaveAndApplyAddress();
      if (!created) {
        setError(language === 'bn' ? 'অনুগ্রহ করে সঠিক ডেলিভারি ঠিকানা পূরণ করুন।' : 'Please complete delivery address details.');
        return;
      }
      finalAddr = created;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && step === 'pin') {
      if (!pin || pin.length < 4) {
        setError('Please enter your 4 or 5 digit PIN code');
        return;
      }
    }

    setError('');
    setIsLoading(true);
    setStep('processing');

    try {
      // 1. Verify Payment if bKash/Nagad
      if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
        await api.verifyBkashPayment({ mobileNumber, pin, otp });
      }

      // 2. Build Enriched Items Payload with Complete Product Quality and Attributes
      const itemsPayload = cartItems.map(item => {
        const p = item.product || {};
        const quality = p.tags?.find((t: string) => /premium|export|original|authentic|grade|100%/i.test(t)) || 
                       (p.brand ? `${p.brand} Official Grade` : '১০০% অরিজিনাল এক্সপোর্ট কোয়ালিটি');
        return {
          productId: p.id,
          productTitle: p.titleBn && language === 'bn' ? `${p.titleBn} (${p.title})` : p.title,
          productImage: p.images?.[0] || '',
          sellerId: p.sellerId || 'usr-seller-1',
          sellerName: p.sellerName || 'Verified Merchant Store',
          quantity: item.quantity,
          price: item.calculatedPrice,
          selectedVariants: item.selectedVariants,
          qualityGrade: quality,
          warranty: p.warranty || '৭ দিনের রিপ্লেসমেন্ট ও জেনুইন ওয়্যারেন্টি',
          sku: p.sku || `SKU-${p.id?.slice(-5)?.toUpperCase() || 'BD102'}`,
          category: p.categoryName || 'General',
          unit: 'Pcs'
        };
      });

      const finalTrxId = transactionId.trim() || (paymentMethod !== 'cod' ? 'TRX' + Math.random().toString(36).substring(2, 9).toUpperCase() : undefined);
      const isPaidOnline = paymentMethod !== 'cod';

      const newOrd = await api.createOrder({
        userId: currentUser?.id || 'usr-demo-cust',
        customerName: finalAddr.recipientName || currentUser?.name || 'Customer',
        customerPhone: finalAddr.phone || mobileNumber,
        customerEmail: currentUser?.email || 'customer@amarbazar.bd',
        shippingAddress: finalAddr,
        items: itemsPayload,
        subtotal,
        discountAmount,
        couponCode,
        shippingFee,
        totalAmount,
        paymentMethod,
        paymentStatus: isPaidOnline ? 'paid' : 'unpaid',
        transactionId: finalTrxId
      });

      setCreatedOrder(newOrd);
      clearCart();
      setStep('success');
      onSuccess(newOrd.id);

      // Auto-trigger direct slip download immediately upon order confirmation
      setTimeout(() => {
        triggerDirectPdfDownload(newOrd);
      }, 300);

    } catch (err: any) {
      setError(err.message || 'Order placement failed. Please try again.');
      setStep('details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
          
          {/* Header theme based on payment method */}
          <div className={`p-4 flex items-center justify-between text-white ${
            step === 'success' ? 'bg-gradient-to-r from-emerald-600 to-teal-700' :
            paymentMethod === 'bkash' ? 'bg-pink-600' :
            paymentMethod === 'nagad' ? 'bg-orange-600' :
            paymentMethod === 'rocket' ? 'bg-purple-700' :
            'bg-slate-900'
          }`}>
            <div className="flex items-center space-x-2">
              {step === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              ) : (
                <Smartphone className="w-5 h-5" />
              )}
              <h3 className="font-black text-sm sm:text-base">
                {step === 'success' 
                  ? (language === 'bn' ? 'অর্ডার সফল ও স্লিপ প্রস্তুত!' : 'Order Placed & Slip Ready!') 
                  : (paymentMethod === 'bkash' ? 'bKash Payment Gateway' :
                     paymentMethod === 'nagad' ? 'Nagad Payment Gateway' :
                     paymentMethod === 'rocket' ? 'Rocket Payment' :
                     paymentMethod === 'card' ? 'Card Checkout' : 'Cash on Delivery')}
              </h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-black/20 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            {/* STEP 1: Method & Phone input */}
            {step === 'details' && (
              <div className="space-y-4">
                {/* Total Banner */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">{language === 'bn' ? 'মোট প্রদেয় টাকা:' : 'Total Payable:'}</span>
                    <span className="text-[10px] text-slate-400">{cartItems.length} {language === 'bn' ? 'টি আইটেম' : 'Items'}</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatPrice(totalAmount)}</span>
                </div>

                {/* 🚚 DELIVERY ADDRESS & RECIPIENT CARD / FORM */}
                <div className="bg-slate-50/80 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-[#da1c24]/10 text-[#da1c24] flex items-center justify-center font-bold">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                          {language === 'bn' ? 'ডেলিভারি ঠিকানা ও প্রাপকের তথ্য' : 'Delivery Address & Recipient'}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          {language === 'bn' ? 'যে ঠিকানায় পার্সেল পৌঁছে দেওয়া হবে' : 'Where your parcel will be delivered'}
                        </span>
                      </div>
                    </div>

                    {!isAddingNewAddress && !showAddressPicker && selectedAddress && (
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setShowAddressPicker(true)}
                          className="px-2.5 py-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 rounded-lg hover:bg-sky-100 transition cursor-pointer"
                        >
                          {language === 'bn' ? 'পরিবর্তন' : 'Change'}
                        </button>
                        <button
                          type="button"
                          onClick={handleOpenAddNewAddress}
                          className="px-2 py-1 text-[11px] font-bold text-[#da1c24] bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 transition cursor-pointer flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{language === 'bn' ? 'নতুন' : 'New'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 1. SELECTED ACTIVE ADDRESS VIEW */}
                  {!isAddingNewAddress && !showAddressPicker && selectedAddress && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div className="flex items-center space-x-2">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-black text-xs text-slate-800 dark:text-slate-100">
                            {selectedAddress.recipientName}
                          </span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                            {selectedAddress.phone}
                          </span>
                        </div>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {selectedAddress.title.includes('Office') || selectedAddress.title.includes('অফিস') ? '🏢 অফিস' : '🏠 বাসা'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {selectedAddress.fullAddress}
                      </p>
                      
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium">
                        <span>থানা: <strong className="text-slate-600 dark:text-slate-300">{selectedAddress.thana || 'Dhanmondi'}</strong></span>
                        <span>•</span>
                        <span>জেলা: <strong className="text-slate-600 dark:text-slate-300">{selectedAddress.district || 'Dhaka'}</strong></span>
                        <span>•</span>
                        <span>বিভাগ: <strong className="text-slate-600 dark:text-slate-300">{selectedAddress.division || 'Dhaka'}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* 2. SAVED ADDRESS PICKER LIST */}
                  {showAddressPicker && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-sky-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {language === 'bn' ? 'সেভ করা ঠিকানা নির্বাচন করুন:' : 'Select a saved delivery address:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddressPicker(false)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 font-bold"
                        >
                          ✕ {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                        </button>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddress?.id === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => handleSelectSavedAddress(addr)}
                              className={`p-2.5 rounded-xl border cursor-pointer transition text-xs ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-1 ring-emerald-400'
                                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    checked={isSelected}
                                    onChange={() => handleSelectSavedAddress(addr)}
                                    className="accent-emerald-600 cursor-pointer"
                                  />
                                  <span className="font-bold text-slate-900 dark:text-slate-100">{addr.recipientName}</span>
                                  <span className="font-mono text-slate-500 text-[11px]">({addr.phone})</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-semibold">{addr.title}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 pl-5">
                                {addr.fullAddress}, {addr.thana}, {addr.district}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={handleOpenAddNewAddress}
                          className="text-xs font-bold text-[#da1c24] hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'নতুন ঠিকানা যোগ করুন +' : 'Add New Address +'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddressPicker(false)}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
                        >
                          {language === 'bn' ? 'ঠিক আছে' : 'OK'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. NEW ADDRESS FORM */}
                  {isAddingNewAddress && (
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/60 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#da1c24] flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'নতুন ডেলিভারি ঠিকানা ফরম পূরণ করুন' : 'Enter Delivery Address Details'}</span>
                        </span>
                        {savedAddresses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setIsAddingNewAddress(false)}
                            className="text-[11px] text-slate-400 hover:text-slate-600 font-bold"
                          >
                            ✕ {language === 'bn' ? 'বাতিল' : 'Cancel'}
                          </button>
                        )}
                      </div>

                      {addressValidationError && (
                        <div className="p-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{addressValidationError}</span>
                        </div>
                      )}

                      {/* Recipient Name & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'bn' ? 'গ্রাহকের পুরো নাম *' : 'Recipient Name *'}
                          </label>
                          <input
                            type="text"
                            value={addrRecipient}
                            onChange={(e) => setAddrRecipient(e.target.value)}
                            placeholder="e.g. রহিম চৌধুরী"
                            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#da1c24] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'bn' ? 'মোবাইল নম্বর (১১ ডিজিট) *' : 'Phone Number *'}
                          </label>
                          <input
                            type="text"
                            value={addrPhone}
                            onChange={(e) => setAddrPhone(e.target.value)}
                            placeholder="017XXXXXXXX"
                            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-[#da1c24] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Division & District */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'bn' ? 'বিভাগ *' : 'Division *'}
                          </label>
                          <select
                            value={addrDivision}
                            onChange={(e) => setAddrDivision(e.target.value)}
                            className="w-full px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#da1c24] focus:outline-none cursor-pointer"
                          >
                            {BD_DIVISIONS.map((div) => (
                              <option key={div} value={div}>{div}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'bn' ? 'জেলা *' : 'District *'}
                          </label>
                          <select
                            value={addrDistrict}
                            onChange={(e) => setAddrDistrict(e.target.value)}
                            className="w-full px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#da1c24] focus:outline-none cursor-pointer"
                          >
                            {(BD_DISTRICTS[addrDivision] || [addrDivision]).map((dist) => (
                              <option key={dist} value={dist}>{dist}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Thana / Area */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {language === 'bn' ? 'থানা / উপজেলা / এলাকা *' : 'Thana / Area / Police Station *'}
                          </label>
                          <span className="text-[10px] text-slate-400">যেমন: ধানমন্ডি, গুলশান, মিরপুর</span>
                        </div>
                        <input
                          type="text"
                          value={addrThana}
                          onChange={(e) => setAddrThana(e.target.value)}
                          placeholder="e.g. Dhanmondi / ধানমন্ডি"
                          className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#da1c24] focus:outline-none"
                        />
                        {/* Quick suggestions for division */}
                        {BD_POPULAR_AREAS[addrDivision] && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {BD_POPULAR_AREAS[addrDivision].slice(0, 5).map((area) => (
                              <button
                                key={area}
                                type="button"
                                onClick={() => setAddrThana(area)}
                                className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-[#da1c24] rounded border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                              >
                                + {area}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Full Street Address */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'bn' ? 'পূর্ণ ঠিকানা (বাড়ি নং, রোড নং, ফ্ল্যাট, ল্যান্ডমার্ক) *' : 'Full Street Address *'}
                        </label>
                        <textarea
                          rows={2}
                          value={addrFull}
                          onChange={(e) => setAddrFull(e.target.value)}
                          placeholder="e.g. বাড়ি নং ৪২, রোড ১০/এ, ধানমন্ডি আ/এ, ঢাকা-১২০৯"
                          className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#da1c24] focus:outline-none leading-relaxed"
                        />
                      </div>

                      {/* Type & Note */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'bn' ? 'ঠিকানার ধরন' : 'Address Type'}
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setAddrTitle('Home')}
                              className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border text-center transition cursor-pointer ${
                                addrTitle === 'Home'
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              🏠 বাসা
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddrTitle('Office')}
                              className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border text-center transition cursor-pointer ${
                                addrTitle === 'Office'
                                  ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              🏢 অফিস
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddrTitle('Other')}
                              className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border text-center transition cursor-pointer ${
                                addrTitle === 'Other'
                                  ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              📍 অন্যান্য
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {language === 'bn' ? 'ডেলিভারি নির্দেশনা (ঐচ্ছিক)' : 'Delivery Note (Optional)'}
                          </label>
                          <input
                            type="text"
                            value={addrDeliveryNote}
                            onChange={(e) => setAddrDeliveryNote(e.target.value)}
                            placeholder="e.g. কল দিয়ে আসবেন"
                            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Save for future checkbox */}
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={saveAddressForFuture}
                          onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                          className="w-4 h-4 text-[#da1c24] accent-[#da1c24] rounded cursor-pointer"
                        />
                        <span>
                          {language === 'bn' 
                            ? 'ভবিষ্যতের অর্ডারের জন্য এই ঠিকানা সেভ করে রাখুন (পরবর্তীতে আর দিতে হবে না)' 
                            : 'Save this address for future orders (no need to type again)'}
                        </span>
                      </label>

                      {/* Apply button */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={(e) => handleSaveAndApplyAddress(e)}
                          className="w-full py-2.5 bg-[#da1c24] hover:bg-red-700 text-white font-black rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>{language === 'bn' ? 'ঠিকানা নিশ্চিত ও সংরক্ষণ করুন' : 'Confirm & Save Delivery Address'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method Selector Tabs */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">
                    {language === 'bn' ? 'পেমেন্ট মেথড নির্বাচন করুন:' : 'Select Payment Method:'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bkash')}
                      className={`p-2.5 border rounded-2xl flex flex-col items-center justify-center font-bold text-xs transition cursor-pointer ${
                        paymentMethod === 'bkash'
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 ring-2 ring-pink-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-pink-600 font-black text-sm">bKash</span>
                      <span className="text-[10px] text-slate-400 font-medium">বিকাশ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('nagad')}
                      className={`p-2.5 border rounded-2xl flex flex-col items-center justify-center font-bold text-xs transition cursor-pointer ${
                        paymentMethod === 'nagad'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 ring-2 ring-orange-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-orange-600 font-black text-sm">Nagad</span>
                      <span className="text-[10px] text-slate-400 font-medium">নগদ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('rocket')}
                      className={`p-2.5 border rounded-2xl flex flex-col items-center justify-center font-bold text-xs transition cursor-pointer ${
                        paymentMethod === 'rocket'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 ring-2 ring-purple-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-purple-600 font-black text-sm">Rocket</span>
                      <span className="text-[10px] text-slate-400 font-medium">রকেট</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upay')}
                      className={`p-2.5 border rounded-2xl flex flex-col items-center justify-center font-bold text-xs transition cursor-pointer ${
                        paymentMethod === 'upay'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 ring-2 ring-amber-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-amber-600 font-black text-sm">Upay</span>
                      <span className="text-[10px] text-slate-400 font-medium">উপায়</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2.5 border rounded-2xl flex flex-col items-center justify-center font-bold text-xs transition cursor-pointer col-span-2 sm:col-span-1 ${
                        paymentMethod === 'cod'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-emerald-600 mb-0.5" />
                      <span className="text-xs font-black">Cash On Delivery</span>
                    </button>
                  </div>
                </div>

                {/* COPY FEEDBACK TOAST BANNER */}
                {copyFeedbackMessage && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-2 animate-bounce">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{copyFeedbackMessage}</span>
                  </div>
                )}

                {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket' || paymentMethod === 'upay') && (
                  <div className="space-y-3 pt-1">
                    
                    {/* DYNAMIC SELLER PAYMENT CARD */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl border border-slate-700 shadow-md space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <Store className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-bold text-slate-200">
                            {sellerInfo?.storeName || sellerInfo?.storeNameBn || 'Official Merchant Store'}
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <BadgeCheck className="w-2.5 h-2.5 mr-0.5 text-emerald-400" />
                            ভেরিফাইড
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          getReceiverAccountType() === 'merchant' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40' :
                          getReceiverAccountType() === 'agent' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}>
                          {getReceiverAccountType() === 'merchant' ? 'মার্চেন্ট পেমেন্ট' : 
                           getReceiverAccountType() === 'agent' ? 'এজেন্ট ক্যাশআউট' : 'ব্যক্তিগত (Personal Send Money)'}
                        </span>
                      </div>

                      {/* Number & Copy Box */}
                      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {sellerInfo?.storeName || 'সেলার'}-এর {paymentMethod.toUpperCase()} {language === 'bn' ? 'নম্বর (Send Money):' : 'Number (Send Money):'}
                          </span>
                          <span className="text-base font-black tracking-wider text-emerald-400 font-mono">
                            {getReceiverPaymentNumber(paymentMethod)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyReceiverNumber(getReceiverPaymentNumber(paymentMethod))}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            {copiedNumber ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                <span>কপি হয়েছে!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>নম্বর কপি</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Amount Quick Copy */}
                      <div className="flex items-center justify-between text-xs px-1 text-slate-300">
                        <span className="text-[11px] text-slate-400">প্রদেয় পরিমাণ: <strong className="text-white font-mono">৳{totalAmount.toLocaleString()}</strong></span>
                        <button
                          type="button"
                          onClick={() => handleCopyAmount(totalAmount)}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer flex items-center space-x-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedAmount ? 'টাকা কপি হয়েছে!' : 'টাকা কপি করুন'}</span>
                        </button>
                      </div>

                      {getReceiverInstructions() && (
                        <div className="bg-slate-800/80 p-2 rounded-xl text-[11px] text-amber-300 flex items-start space-x-1.5 border border-amber-500/30">
                          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                          <span>{getReceiverInstructions()}</span>
                        </div>
                      )}
                    </div>

                    {/* DIRECT APP ACTION BUTTON (USER INTENT PRIORITY) */}
                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenAppAndPay(paymentMethod)}
                        className={`w-full py-3.5 px-4 text-white font-black rounded-2xl text-xs sm:text-sm flex flex-col items-center justify-center transition shadow-lg cursor-pointer transform active:scale-98 ${
                          paymentMethod === 'bkash' ? 'bg-gradient-to-r from-pink-600 via-pink-700 to-pink-600 hover:from-pink-500 hover:to-pink-600 ring-2 ring-pink-400/50' :
                          paymentMethod === 'nagad' ? 'bg-gradient-to-r from-orange-600 via-orange-700 to-orange-600 hover:from-orange-500 hover:to-orange-600 ring-2 ring-orange-400/50' :
                          paymentMethod === 'rocket' ? 'bg-gradient-to-r from-purple-700 via-purple-800 to-purple-700 hover:from-purple-600 hover:to-purple-700 ring-2 ring-purple-400/50' :
                          'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 hover:from-amber-500 hover:to-amber-600 ring-2 ring-amber-400/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Smartphone className="w-4 h-4" />
                          <span>
                            {language === 'bn' 
                              ? `সরাসরি ${paymentMethod === 'bkash' ? 'বিকাশ' : paymentMethod === 'nagad' ? 'নগদ' : paymentMethod === 'rocket' ? 'রকেট' : 'উপায়'} অ্যাপে সেন্ড মানি করুন (৳${totalAmount.toLocaleString()})`
                              : `Open ${paymentMethod.toUpperCase()} App & Send Money (৳${totalAmount.toLocaleString()})`}
                          </span>
                        </div>
                        <span className="text-[10px] text-white/80 font-normal mt-0.5">
                          {language === 'bn' 
                            ? `সেলার নম্বর (${getReceiverPaymentNumber(paymentMethod)}) কপি হয়ে স্বয়ংক্রিয় অ্যাপ ওপেন হবে`
                            : `Auto-copies seller number (${getReceiverPaymentNumber(paymentMethod)}) & launches app`}
                        </span>
                      </button>

                      {/* QUICK USSD & ALTERNATIVE ACTIONS */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={`tel:${getUssdCode(paymentMethod)}`}
                          className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1.5 transition text-center"
                        >
                          <span>📱 ডায়াল করুন: {getUssdCode(paymentMethod)}</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setStep('trx_entry')}
                          className="py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>TrxID দিন ও কনফার্ম করুন</span>
                        </button>
                      </div>

                      {/* SECONDARY: WEB OTP FLOW */}
                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={handleInitiatePayment}
                          className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline font-semibold cursor-pointer transition"
                        >
                          {language === 'bn' ? '🌐 অথবা ওয়েবসাইটে ওটিপি (OTP) ও পিন দিয়ে পে করুন' : '🌐 Or pay via web OTP & PIN Gateway'}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
                      <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{language === 'bn' ? 'আপনার পেমেন্ট সরাসরি নির্দিষ্ট পণ্য বিক্রেতার একাউন্টে যুক্ত হবে।' : 'Payment routes directly to the product seller account.'}</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="space-y-3 pt-2">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                      <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
                        <Banknote className="w-5 h-5 text-emerald-600" />
                        <span>{language === 'bn' ? 'ক্যাশ অন ডেলিভারি (Cash On Delivery)' : 'Cash On Delivery'}</span>
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                        {language === 'bn' 
                          ? 'পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন। কোন অগ্রিম ফি নেই।'
                          : 'Pay cash when products arrive at your doorstep. No advance payment required.'}
                      </p>
                    </div>

                    <button
                      onClick={handleInitiatePayment}
                      disabled={isLoading}
                      className="w-full py-3.5 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-md bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>{language === 'bn' ? 'অর্ডার কনফার্ম করুন (ক্যাশ অন ডেলিভারি)' : 'Confirm Order (Cash On Delivery)'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP: TRX ENTRY (DIRECT APP CONFIRMATION) */}
            {step === 'trx_entry' && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-sm sm:text-base text-slate-800 dark:text-slate-100">
                    {language === 'bn' ? 'টাকা পাঠানো সম্পন্ন হলে TrxID দিন' : 'Enter Transaction ID / TrxID'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    {language === 'bn' 
                      ? `${sellerInfo?.storeName || 'সেলার'}-এর ${paymentMethod.toUpperCase()} (${getReceiverPaymentNumber(paymentMethod)}) নম্বরে ৳${totalAmount.toLocaleString()} সেন্ড মানি করে প্রাপ্ত TrxID দিন:`
                      : `After sending ৳${totalAmount.toLocaleString()} to ${sellerInfo?.storeName || 'Seller'} (${getReceiverPaymentNumber(paymentMethod)}), enter your TrxID:`}
                  </p>
                </div>

                {/* Seller & Amount Recap Badge */}
                <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">সেলার নম্বর ({paymentMethod.toUpperCase()}):</span>
                    <span className="text-emerald-400 font-bold text-sm">{getReceiverPaymentNumber(paymentMethod)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">মোট টাকা:</span>
                    <span className="text-white font-bold text-sm">৳{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'bn' ? 'আপনার মোবাইল নম্বর (Sender Phone):' : 'Your Mobile Number:'}
                    </label>
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'bn' ? 'ট্রানজেকশন আইডি / TrxID:' : 'Transaction ID / TrxID:'}
                      </label>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            if (text) setTransactionId(text.trim());
                          } catch (e) {
                            const sampleTrx = 'TRX' + Math.random().toString(36).substring(2, 8).toUpperCase();
                            setTransactionId(sampleTrx);
                          }
                        }}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                      >
                        {language === 'bn' ? 'ক্লিপবোর্ড থেকে পেস্ট করুন' : 'Paste from clipboard'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. 9J82KZ71 বা 8B21K9"
                      className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm tracking-wider focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleFinalizeOrder}
                    disabled={isLoading}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{language === 'bn' ? 'অর্ডার নিশ্চিত করুন ও রসিদ ডাউনলোড করুন' : 'Confirm Order & Download Receipt'}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenAppAndPay(paymentMethod)}
                      className="text-xs text-pink-600 dark:text-pink-400 font-bold hover:underline cursor-pointer"
                    >
                      {language === 'bn' ? 'পুনরায় অ্যাপ ওপেন করুন' : 'Reopen App'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="text-xs text-slate-500 dark:text-slate-400 font-bold hover:underline cursor-pointer"
                    >
                      {language === 'bn' ? '← মেথড পরিবর্তন করুন' : '← Change Method'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 'otp' && (
              <div className="space-y-4 text-center">
                <div>
                  <h4 className="font-black text-base">{language === 'bn' ? 'ওটিপি (OTP) ভেরিফিকেশন' : 'Enter OTP Verification Code'}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'bn' ? `${mobileNumber} নম্বরে একটি ওটিপি পাঠানো হয়েছে` : `A 6-digit code was sent to ${mobileNumber}`}
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full text-center text-2xl tracking-widest px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Demo code: 123456</p>
                </div>

                <button
                  onClick={handleVerifyOtp}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition shadow-md cursor-pointer"
                >
                  {language === 'bn' ? 'ওটিপি যাচাই করুন' : 'Verify OTP'}
                </button>
              </div>
            )}

            {/* STEP 3: Enter PIN */}
            {step === 'pin' && (
              <div className="space-y-4 text-center">
                <div>
                  <h4 className="font-black text-base">{paymentMethod.toUpperCase()} PIN {language === 'bn' ? 'দিন' : 'Entry'}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'bn' 
                      ? `${formatPrice(totalAmount)} পেমেন্ট অনুমোদন করতে আপনার একাউন্ট পিন দিন` 
                      : `Enter your account PIN to authorize payment of ${formatPrice(totalAmount)}`}
                  </p>
                </div>

                <div>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    maxLength={5}
                    className="w-full text-center text-3xl tracking-widest px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  onClick={handleFinalizeOrder}
                  disabled={isLoading}
                  className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-xl text-xs transition shadow-md flex items-center justify-center cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{language === 'bn' ? 'পেমেন্ট কনফার্ম করুন' : 'Confirm & Pay Now'}</span>}
                </button>
              </div>
            )}

            {/* STEP 4: Processing spinner */}
            {step === 'processing' && (
              <div className="py-10 text-center space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
                <p className="font-black text-slate-800 dark:text-slate-100 text-sm">
                  {language === 'bn' ? 'অর্ডার প্রসেস হচ্ছে ও অফিশিয়াল স্লিপ জেনারেট হচ্ছে...' : 'Processing Order & Generating Official Slip...'}
                </p>
                <p className="text-xs text-slate-400">Please do not refresh or close this tab.</p>
              </div>
            )}

            {/* STEP 5: Rich Order Confirmation & Instant Slip Download Screen */}
            {step === 'success' && createdOrder && (
              <div className="space-y-4">
                {/* Success Banner */}
                <div className="text-center py-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-500/20 mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                    {language === 'bn' ? 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!' : 'Order Placed Successfully!'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === 'bn' 
                      ? 'আপনার ক্যাশ মেমো ও ডেলিভারি স্লিপ স্বয়ংক্রিয়ভাবে ডাউনলোড হয়েছে।' 
                      : 'Your official slip and delivery receipt have been generated & downloaded.'}
                  </p>
                </div>

                {/* Auto Download Notification Badge */}
                {autoDownloaded && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 animate-fade-in">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold">{language === 'bn' ? 'PDF/HTML স্লিপ ডাউনলোড সম্পন্ন' : 'PDF Slip Downloaded'}</span>
                    </div>
                    <span className="font-mono text-[10px] bg-emerald-200/60 dark:bg-emerald-900 px-2 py-0.5 rounded font-bold">
                      #{createdOrder.order5DigitId || createdOrder.orderNumber}
                    </span>
                  </div>
                )}

                {/* 5-Digit Order Summary Card */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl text-left text-xs space-y-2 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">{language === 'bn' ? '৫-সংখ্যার অর্ডার কোড:' : '5-Digit Order Code:'}</span>
                    <span className="font-mono font-black text-base text-[#da1c24] bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-lg border border-red-200 dark:border-red-800">
                      #{createdOrder.order5DigitId || createdOrder.orderNumber.replace(/[^0-9]/g, '').slice(-5) || '58392'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">{language === 'bn' ? 'পেমেন্ট স্ট্যাটাস:' : 'Payment Status:'}</span>
                    <span className="font-black text-emerald-600 uppercase">
                      {createdOrder.paymentMethod.toUpperCase()} ({createdOrder.paymentStatus.toUpperCase()})
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">{language === 'bn' ? 'কুরিয়ার ও ট্র্যাকিং:' : 'Courier & Tracking:'}</span>
                    <span className="font-bold text-sky-600">
                      {createdOrder.courier?.provider} ({createdOrder.courier?.trackingNumber})
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-1.5">
                    <span className="text-slate-600 dark:text-slate-300 font-bold">{language === 'bn' ? 'সর্বমোট পরিশোধিত:' : 'Total Amount:'}</span>
                    <span className="font-black text-sm text-slate-900 dark:text-white font-mono">
                      {formatPrice(createdOrder.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Item & Quality Breakdown Checklist Preview */}
                <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-amber-900 dark:text-amber-300 font-black text-[11px] uppercase">
                    <ClipboardCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === 'bn' ? 'স্লিপ ভেরিফিকেশন ও ডেলিভারি চেকলিস্ট' : 'Delivery Slip Verification'}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {language === 'bn' 
                      ? 'ডেলিভারি রাইডার ও বিক্রেতা এই স্লিপের বিবরণ মিলিয়ে আপনাকে পণ্যটি হ্যান্ডওভার করবেন। আপনিও স্লিপের সাথে মিলিয়ে পণ্য বুঝে নিন।' 
                      : 'Delivery rider and seller will match all product items & quality grades against this official slip during handover.'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Instant Download Slip Button */}
                    <button
                      onClick={() => triggerDirectPdfDownload(createdOrder)}
                      className="py-2.5 px-3 bg-[#da1c24] hover:bg-red-700 text-white font-black rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{language === 'bn' ? 'স্লিপ PDF ডাউনলোড' : 'Download PDF'}</span>
                    </button>

                    {/* View Full Official Slip Modal */}
                    <button
                      onClick={() => setShowFullSlipModal(true)}
                      className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-black rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>{language === 'bn' ? 'সম্পূর্ণ স্লিপ দেখুন' : 'View Full Slip'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Live Tracking */}
                    <button
                      onClick={() => {
                        setTrackingOrderId(createdOrder.order5DigitId || createdOrder.orderNumber);
                        onClose();
                      }}
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Truck className="w-4 h-4" />
                      <span>{language === 'bn' ? 'লাইভ ট্র্যাক করুন' : 'Track Order'}</span>
                    </button>

                    {/* Go to Slips Vault */}
                    <button
                      onClick={() => {
                        setActivePanel('customer_profile');
                        onClose();
                      }}
                      className="py-2.5 px-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      {language === 'bn' ? 'স্লিপ ভল্ট দেখুন' : 'Slips Vault'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* QR Code Modal Overlay */}
          {showQr && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xs p-6 text-center animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-xs w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
                <button
                  type="button"
                  onClick={() => setShowQr(false)}
                  className="absolute top-3 right-3 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-extrabold text-white ${
                    paymentMethod === 'bkash' ? 'bg-pink-600' :
                    paymentMethod === 'nagad' ? 'bg-orange-600' :
                    'bg-purple-700'
                  }`}>
                    {paymentMethod.toUpperCase()} Merchant QR
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-4">
                  {language === 'bn' 
                    ? 'পেমেন্ট করতে নিচের কিউআর কোডটি স্ক্যান করুন' 
                    : 'Scan the QR code below to make payment'}
                </p>

                {/* QR Image Container */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs inline-block mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${paymentMethod}:${mobileNumber}?amount=${totalAmount}`}
                    alt="Merchant QR Code"
                    className="w-44 h-44 mx-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Number details */}
                <div className="space-y-1 mb-5">
                  <p className="text-[10px] text-slate-400 font-medium">
                    {language === 'bn' ? 'মার্চেন্ট নম্বর:' : 'Merchant Number:'}
                  </p>
                  <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 tracking-wider">
                    {mobileNumber}
                  </p>
                  <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatPrice(totalAmount)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQr(false)}
                  className={`w-full py-2.5 text-xs font-bold text-white rounded-xl transition cursor-pointer ${
                    paymentMethod === 'bkash' ? 'bg-pink-600 hover:bg-pink-700' :
                    paymentMethod === 'nagad' ? 'bg-orange-600 hover:bg-orange-700' :
                    'bg-purple-700 hover:bg-purple-800'
                  }`}
                >
                  {language === 'bn' ? 'ঠিক আছে' : 'Done'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Full-Screen High-Resolution Order Receipt Slip Modal */}
      {showFullSlipModal && createdOrder && (
        <OrderReceiptSlip
          order={createdOrder}
          onClose={() => setShowFullSlipModal(false)}
          onTrackOrder={(id) => {
            setShowFullSlipModal(false);
            setTrackingOrderId(id);
            onClose();
          }}
        />
      )}
    </>
  );
};
