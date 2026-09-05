import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, MapPin, MessageSquare, Clock, ShieldCheck, 
  HelpCircle, Send, CheckCircle2, AlertTriangle, 
  ChevronRight, Sparkles, Package, RefreshCw, Search,
  Download, Printer, FileText, X, AlertCircle, Ban,
  ArrowLeft, Phone, User, Calendar, CreditCard, Check,
  Copy, ExternalLink, ChevronDown, CheckCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { firebaseDb } from '../../lib/firebase';
import { Order } from '../../types';
import { OrderReceiptSlip } from './OrderReceiptSlip';

export const CustomerTrackingSupport: React.FC = () => {
  const { language, currency, formatPrice, currentUser, triggerBanner } = useApp() as any;
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchId, setSearchId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  
  // Modals
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [isDownloadingSlip, setIsDownloadingSlip] = useState<boolean>(false);
  
  // Cancellation Form
  const [cancelReason, setCancelReason] = useState<string>('ভুল পণ্য বা সাইজ অর্ডার করেছি');
  const [cancelComments, setCancelComments] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  
  // Support & Refund states
  const [refundReason, setRefundReason] = useState<string>('Damaged Product');
  const [refundComments, setRefundComments] = useState<string>('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState<boolean>(false);
  const [refundSuccess, setRefundSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'details' | 'refund' | 'chat'>('details');
  
  // Support Chat states
  const [messages, setMessages] = useState<Array<{sender: 'user' | 'agent', text: string, time: string}>>([
    {
      sender: 'agent',
      text: language === 'bn' 
        ? 'আসসালামু আলাইকুম! আমার বাজার কেয়ার সেন্টারে স্বাগতম। অর্ডার ট্র্যাকিং, রসিদ বা ডেলিভারি নিয়ে যেকোনো সহায়তা লাগলে আমাদের জানান।' 
        : 'Assalamu Alaikum! Welcome to AmarBazar Care. Let us know if you need help with tracking, receipt download, or delivery.',
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch customer orders on mount
  const fetchOrders = async () => {
    try {
      const allOrders = await api.getOrders();
      if (currentUser) {
        const userOrders = allOrders.filter(o => o.userId === currentUser.id || o.customerPhone === currentUser.phone);
        const listToUse = userOrders.length > 0 ? userOrders : allOrders;
        setOrders(listToUse);
        if (!selectedOrder && listToUse.length > 0) {
          setSelectedOrder(listToUse[0]);
          setSearchId(listToUse[0].orderNumber);
        }
      } else {
        setOrders(allOrders);
        if (!selectedOrder && allOrders.length > 0) {
          setSelectedOrder(allOrders[0]);
          setSearchId(allOrders[0].orderNumber);
        }
      }
    } catch (err) {
      console.error('Failed to load orders for tracking:', err);
    }
  };

  useEffect(() => {
    fetchOrders();

    const unsubscribe = firebaseDb.subscribeToOrders((allFbOrders) => {
      if (!allFbOrders || !Array.isArray(allFbOrders)) return;
      if (currentUser) {
        const userOrders = allFbOrders.filter(o => o.userId === currentUser.id || o.customerPhone === currentUser.phone);
        const listToUse = userOrders.length > 0 ? userOrders : allFbOrders;
        setOrders(listToUse);
        setSelectedOrder(prev => {
          if (!prev) return listToUse[0] || null;
          const updated = listToUse.find(o => 
            o.id === prev.id || 
            o.orderNumber === prev.orderNumber || 
            o.order5DigitId === prev.order5DigitId ||
            o.id.replace(/^ord-/, '') === prev.id.replace(/^ord-/, '')
          );
          return updated || prev;
        });
      } else {
        setOrders(allFbOrders);
        setSelectedOrder(prev => {
          if (!prev) return allFbOrders[0] || null;
          const updated = allFbOrders.find(o => 
            o.id === prev.id || 
            o.orderNumber === prev.orderNumber || 
            o.order5DigitId === prev.order5DigitId ||
            o.id.replace(/^ord-/, '') === prev.id.replace(/^ord-/, '')
          );
          return updated || prev;
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchId.trim();
    if (!query) return;

    setIsLoading(true);
    setError('');

    // 1. Search in existing orders state first (by orderNumber, 5-digit id, phone, or id)
    const cleanQuery = query.replace('#', '').toLowerCase();
    const foundInMemory = orders.find(o => {
      const fiveDigit = o.order5DigitId || (o.orderNumber ? o.orderNumber.replace(/[^0-9]/g, '').slice(-5) : '') || o.id.replace(/[^0-9]/g, '').slice(-5);
      return (o.orderNumber && o.orderNumber.toLowerCase().includes(cleanQuery)) ||
             (fiveDigit && fiveDigit.toLowerCase() === cleanQuery) ||
             o.id.toLowerCase() === cleanQuery ||
             (o.customerPhone && o.customerPhone.includes(cleanQuery));
    });

    if (foundInMemory) {
      setSelectedOrder(foundInMemory);
      setIsLoading(false);
      if (triggerBanner) {
        triggerBanner(language === 'bn' ? `অর্ডার #${getOrder5Digit(foundInMemory)} পাওয়া গেছে!` : 'Order located!');
      }
      return;
    }

    // 2. Fetch from backend API
    try {
      const ord = await api.getOrderById(query);
      if (ord) {
        setSelectedOrder(ord);
        if (triggerBanner) {
          triggerBanner(language === 'bn' ? 'অর্ডার ট্র্যাকিং তথ্য লোড হয়েছে!' : 'Order tracking data refreshed!');
        }
      } else {
        setError(language === 'bn' ? 'অর্ডার নম্বরটি পাওয়া যায়নি। সঠিক আইডি বা ফোন নম্বর দিয়ে চেষ্টা করুন।' : 'Order not found. Please verify the ID or phone.');
      }
    } catch (err) {
      setError(language === 'bn' ? 'অর্ডার নম্বরটি পাওয়া যায়নি।' : 'Failed to track order.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setSearchId(order.orderNumber || order.order5DigitId || order.id);
    setError('');
    setActiveTab('details');
  };

  const getOrder5Digit = (order: Order) => {
    return order.order5DigitId || 
           (order.orderNumber ? order.orderNumber.replace(/[^0-9]/g, '').slice(-5) : '') || 
           (order.id ? order.id.replace(/[^0-9]/g, '').slice(-5) : '') || 
           '20712';
  };

  const handleCopyOrderCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    if (triggerBanner) {
      triggerBanner(language === 'bn' ? 'অর্ডার কোড কপি করা হয়েছে!' : 'Order code copied to clipboard!');
    }
  };

  // Direct Order Receipt Slip Download
  const handleDownloadReceipt = (order: Order) => {
    setIsDownloadingSlip(true);
    try {
      const fiveDigitId = getOrder5Digit(order);
      const isCod = order.paymentMethod === 'cod';

      const slipHtml = `<!DOCTYPE html>
<html lang="${language === 'bn' ? 'bn' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>AmarBazar_Order_Slip_${fiveDigitId}</title>
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
    .variant-tag { display: inline-block; background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-top: 3px; }

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
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    
    .footer { border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #64748b; text-align: center; margin-top: 16px; }
    .barcode-box { text-align: center; margin-top: 10px; font-family: monospace; font-size: 12px; letter-spacing: 5px; font-weight: 900; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-logo">AMAR BAZAR BD</div>
      <div class="sub-brand">Official Customer Slip & Warranty Document</div>
      <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b;">Helpline: 09612-BAZAR • support@amarbazar.bd</p>
    </div>
    <div style="text-align: right;">
      <h1 class="invoice-title">${language === 'bn' ? 'অফিশিয়াল অর্ডার ও ডেলিভারি স্লিপ' : 'OFFICIAL INVOICE & DELIVERY SLIP'}</h1>
      <div><span class="order-badge">5-DIGIT ID: ${fiveDigitId}</span></div>
      <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Date: ${new Date(order.createdAt).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}</p>
    </div>
  </div>

  <div class="grid">
    <div class="info-box">
      <h4>${language === 'bn' ? 'গ্রাহকের বিবরণ ও ডেলিভারি ঠিকানা' : 'CUSTOMER & DELIVERY DETAILS'}</h4>
      <strong style="font-size: 13px; color: #0f172a;">${order.customerName}</strong><br/>
      <span>${language === 'bn' ? '📞 ফোন:' : '📞 Phone:'} <strong>${order.customerPhone}</strong></span><br/>
      <span>${language === 'bn' ? '🏠 ঠিকানা:' : '🏠 Address:'} ${order.shippingAddress?.fullAddress || (language === 'bn' ? 'সংরক্ষিত ঠিকানা' : 'Address on file')}</span><br/>
      <span>${language === 'bn' ? '📍 থানা:' : '📍 Thana:'} <strong>${order.shippingAddress?.thana || 'Dhanmondi'}</strong>, ${language === 'bn' ? 'জেলা:' : 'District:'} <strong>${order.shippingAddress?.district || 'Dhaka'}</strong> (${order.shippingAddress?.division || (language === 'bn' ? 'বাংলাদেশ' : 'Bangladesh')})</span>
    </div>
    <div class="info-box">
      <h4>${language === 'bn' ? 'পেমেন্ট ও ডেলিভারি ট্র্যাকিং' : 'PAYMENT & LOGISTICS INFO'}</h4>
      <div><strong>${language === 'bn' ? 'পেমেন্ট মাধ্যম:' : 'Payment Method:'}</strong> <span class="status-tag ${order.status === 'cancelled' ? 'status-cancelled' : isCod ? 'status-cod' : 'status-paid'}">${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})</span></div>
      ${order.transactionId ? `<div><strong>Txn ID:</strong> <span style="font-family: monospace; font-weight: bold;">${order.transactionId}</span></div>` : ''}
      <div style="margin-top: 4px;"><strong>${language === 'bn' ? 'কুরিয়ার পার্টনার:' : 'Courier Partner:'}</strong> ${order.courier?.provider || 'Pathao Express'}</div>
      <div><strong>${language === 'bn' ? 'ট্র্যাকিং কোড:' : 'Tracking Code:'}</strong> <span style="font-family: monospace; font-weight: 900; color: #0284c7;">${order.courier?.trackingNumber || 'PTH-' + fiveDigitId}</span></div>
      <div><strong>${language === 'bn' ? 'বর্তমান স্ট্যাটাস:' : 'Current Status:'}</strong> <strong style="text-transform: uppercase; color: #da1c24;">${order.status}</strong></div>
    </div>
  </div>

  <div class="checklist-container">
    <div class="checklist-title">
      ${language === 'bn' ? '✓ পণ্যের গুণমান ও ডেলিভারি হ্যান্ডওভার ভেরিফিকেশন' : '✓ Quality & Delivery Verification Guarantee'}
    </div>
    <div class="checklist-grid">
      <div class="checklist-item"><span class="checkbox-box">✓</span> <span>${language === 'bn' ? '১. পণ্যের নাম, মডেল ও স্পেসিফিকেশন মিলানো হয়েছে' : '1. Product name and specs verified'}</span></div>
      <div class="checklist-item"><span class="checkbox-box">✓</span> <span>${language === 'bn' ? '২. ১০০% অরিজিনাল কোয়ালিটি গ্রেড নিশ্চিত' : '2. 100% genuine quality confirmed'}</span></div>
      <div class="checklist-item"><span class="checkbox-box">✓</span> <span>${language === 'bn' ? '৩. প্যাকেজিং সিল ও নিরাপত্তা স্ট্যাম্প অক্ষত' : '3. Packaging seal intact'}</span></div>
      <div class="checklist-item"><span class="checkbox-box">✓</span> <span>${language === 'bn' ? '৪. গ্রাহকের ইনভয়েস স্লিপ অনুমোদিত' : '4. Customer invoice slip verified'}</span></div>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 48%;">${language === 'bn' ? 'পণ্য ও বিবরণ' : 'PRODUCT DETAILS'}</th>
        <th style="width: 17%;">${language === 'bn' ? 'কোয়ালিটি' : 'QUALITY'}</th>
        <th style="width: 12%;" class="text-right">${language === 'bn' ? 'একক মূল্য' : 'PRICE'}</th>
        <th style="width: 6%; text-align: center;">${language === 'bn' ? 'পরিমাণ' : 'QTY'}</th>
        <th style="width: 12%;" class="text-right">${language === 'bn' ? 'মোট টাকা' : 'TOTAL'}</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${item.productTitle}</div>
            <div style="font-size: 10px; color: #64748b;">SKU: ${item.sku || 'SKU-BD' + fiveDigitId}</div>
            ${item.selectedVariants ? `<div style="font-size: 10px; color: #2563eb; font-weight: bold; margin-top: 2px;">${Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}</div>` : ''}
          </td>
          <td>
            <div><span class="quality-badge">⭐ 100% Quality</span></div>
            <div><span class="warranty-badge">🛡️ 7-Day Warranty</span></div>
          </td>
          <td class="text-right font-mono">${currency} ${item.price}</td>
          <td style="text-align: center; font-weight: bold;">${item.quantity}</td>
          <td class="text-right font-mono" style="font-weight: 800;">${currency} ${item.price * item.quantity}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <table class="calculation-table">
    <tr>
      <td>${language === 'bn' ? 'সাবটোটাল (পণ্যমূল্য):' : 'Subtotal:'}</td>
      <td class="text-right font-mono">${currency} ${order.subtotal}</td>
    </tr>
    <tr>
      <td>${language === 'bn' ? 'ডেলিভারি চার্জ:' : 'Shipping Fee:'}</td>
      <td class="text-right font-mono">${currency} ${order.shippingFee}</td>
    </tr>
    ${order.discountAmount > 0 ? `
    <tr style="color: #16a34a;">
      <td>${language === 'bn' ? 'ডিসকাউন্ট / ছাড়:' : 'Discount:'}</td>
      <td class="text-right font-mono">-${currency} ${order.discountAmount}</td>
    </tr>
    ` : ''}
    <tr class="total-row">
      <td><strong>${language === 'bn' ? 'সর্বমোট প্রদেয় টাকা:' : 'Total Payable:'}</strong></td>
      <td class="text-right font-mono"><strong>${currency} ${order.totalAmount}</strong></td>
    </tr>
  </table>

  <div class="barcode-box">
    ||||| | |||| ||||| || |||||||| | ||||| ||||<br/>
    *${order.orderNumber}*
  </div>

  <div class="footer">
    <p>${language === 'bn' ? 'আমার বাজার-এ কেনাকাটা করার জন্য ধন্যবাদ! যেকোনো জিজ্ঞাসা বা সাপোর্টের জন্য কল করুন: ০৯৬১২-২২৯২৭' : 'Thank you for shopping at AmarBazar! For queries, call: 09612-22927'}</p>
    <p>Customer Copy • Verification Hash: SHA256-${fiveDigitId}-${Date.now().toString(36).toUpperCase()}</p>
  </div>
</body>
</html>`;

      const blob = new Blob([slipHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AmarBazar_Order_Slip_${fiveDigitId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (triggerBanner) {
        triggerBanner(language === 'bn' ? 'অর্ডার রসিদ ডাউনলোড সম্পন্ন হয়েছে!' : 'Order receipt downloaded successfully!');
      }
    } catch (err) {
      console.error('Failed to download slip:', err);
    } finally {
      setIsDownloadingSlip(false);
    }
  };

  // Order Cancellation Logic (Allowed prior to Delivery)
  const isOrderCancellable = (order: Order) => {
    // Top e-commerce policy: Cancellable as long as order is NOT already delivered and NOT already cancelled
    return order.status !== 'delivered' && order.status !== 'cancelled';
  };

  const handleConfirmCancelOrder = async () => {
    if (!selectedOrder) return;
    setIsCancelling(true);

    try {
      const cancellationNote = `Cancelled by Customer. Reason: ${cancelReason}${cancelComments ? ' - ' + cancelComments : ''}`;
      await api.updateOrderStatus(selectedOrder.id, 'cancelled', cancellationNote);

      const updated: Order = {
        ...selectedOrder,
        status: 'cancelled',
        courier: selectedOrder.courier ? {
          ...selectedOrder.courier,
          statusLogs: [
            { 
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
              status: 'Order Cancelled by Customer', 
              location: 'Customer App / Portal' 
            },
            ...(selectedOrder.courier.statusLogs || [])
          ]
        } : undefined
      };

      setSelectedOrder(updated);
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updated : o));
      setShowCancelModal(false);

      if (triggerBanner) {
        triggerBanner(
          language === 'bn' 
            ? `অর্ডার #${getOrder5Digit(selectedOrder)} সফলভাবে বাতিল করা হয়েছে!` 
            : `Order #${getOrder5Digit(selectedOrder)} has been successfully cancelled!`
        );
      }

      // Add cancellation notice to support chat
      setMessages(prev => [
        ...prev,
        {
          sender: 'user',
          text: `[Order Cancellation] Order #${getOrder5Digit(selectedOrder)} was cancelled. Reason: ${cancelReason}. Note: ${cancelComments || 'N/A'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          sender: 'agent',
          text: language === 'bn'
            ? `আপনার #${getOrder5Digit(selectedOrder)} নম্বর অর্ডারটির বাতিল আবেদন নিশ্চিত করা হয়েছে। যদি অনলাইন পেমেন্ট (বিকাশ/নগদ) করে থাকেন, তবে ২৪ ঘণ্টার মধ্যে টাকা রিফান্ড পাবেন।`
            : `Your cancellation request for order #${getOrder5Digit(selectedOrder)} is confirmed. If you paid online via bKash/Nagad, refund will be credited within 24 hours.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

    } catch (err) {
      console.error('Failed to cancel order:', err);
      if (triggerBanner) {
        triggerBanner(language === 'bn' ? 'অর্ডার বাতিল করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Failed to cancel order. Please try again.');
      }
    } finally {
      setIsCancelling(false);
    }
  };

  // Submit Refund Claim Form
  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmittingRefund(true);
    
    setTimeout(() => {
      setIsSubmittingRefund(false);
      setRefundSuccess(true);
      if (triggerBanner) {
        triggerBanner(language === 'bn' ? 'রিফান্ড আবেদন সফলভাবে জমা হয়েছে!' : 'Refund request submitted successfully!');
      }
      
      setMessages(prev => [
        ...prev,
        {
          sender: 'user',
          text: `[Refund Claim Filed] Order: #${getOrder5Digit(selectedOrder)}. Reason: ${refundReason}. Details: ${refundComments}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          sender: 'agent',
          text: language === 'bn'
            ? `ধন্যবাদ! আমরা #${getOrder5Digit(selectedOrder)} অর্ডারের জন্য আপনার রিফান্ডের আবেদনটি পেয়েছি। রিফান্ড রিজন: ${refundReason}। আমাদের টিম যাচাই করে আপনার বিকাশ নম্বরে টাকা পাঠাবে।`
            : `Thank you! We received your refund request for order #${getOrder5Digit(selectedOrder)}. Our team will verify and dispatch the credit back to your bKash wallet.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setRefundComments('');
    }, 1200);
  };

  // Send Chat Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: userMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let reply = '';
      const lowercaseMsg = userMsg.toLowerCase();
      
      if (lowercaseMsg.includes('cancel') || lowercaseMsg.includes('বাতিল')) {
        reply = language === 'bn'
          ? 'ডেলিভারি সম্পন্ন হওয়ার আগ পর্যন্ত আপনি যে কোনো সময় "অর্ডার বাতিল করুন" বাটনে ক্লিক করে সরাসরি অর্ডার ক্যানসেল করতে পারবেন।'
          : 'You can cancel any order prior to final delivery by clicking the "Cancel Order" button.';
      } else if (lowercaseMsg.includes('slip') || lowercaseMsg.includes('receipt') || lowercaseMsg.includes('রসিদ')) {
        reply = language === 'bn'
          ? 'অর্ডার ট্র্যাকিং পেজের উপরে থাকা "রসিদ ডাউনলোড করুন" বাটনে ক্লিক করে সম্পূর্ণ ট্যাক্স ইনভয়েস ও রসিদ ডাউনলোড করতে পারেন।'
          : 'Click "Download Receipt" above to get the full official invoice and delivery memo.';
      } else if (lowercaseMsg.includes('refund') || lowercaseMsg.includes('রিফান্ড') || lowercaseMsg.includes('টাকা')) {
        reply = language === 'bn'
          ? 'আপনার রিফান্ডের আবেদনটি আমাদের সিনিয়র সাপোর্ট টিমের কাছে পাঠানো হয়েছে। অনুগ্রহ করে আপনার বিকাশ/নগদ নম্বর এবং সমস্যাটি আমাদের রিফান্ড বক্সে জমা দিন।'
          : 'Our refund team will review your claim and issue credit to your wallet.';
      } else {
        reply = language === 'bn'
          ? 'আপনার বার্তার জন্য ধন্যবাদ। আমাদের কাস্টমার কেয়ার টিম আপনার অর্ডারটি পর্যালোচনা করে সর্বোচ্চ সেবা প্রদান করবে।'
          : 'Thank you for reaching out. Our support representative is on standby to assist with your order.';
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  // Milestone helper
  const getProgressStage = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'processing': return 3;
      case 'shipped': return 4;
      case 'delivered': return 5;
      case 'cancelled': return -1;
      default: return 1;
    }
  };

  const currentStage = selectedOrder ? getProgressStage(selectedOrder.status) : 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-3 sm:p-4 md:p-6 pb-20" id="customer-tracking-view">
      
      {/* Top Banner Accent */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
          <Truck className="w-80 h-80" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/15 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{language === 'bn' ? 'লাইভ পার্সেল ট্র্যাকিং ও অর্ডার ম্যানেজমেন্ট' : 'Live Order Tracking & Management'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
            {language === 'bn' ? 'অর্ডার ট্র্যাকিং, রসিদ ও ক্যানসেলেশন হাব' : 'Order Tracking, Receipt & Cancellation Hub'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            {language === 'bn' 
              ? 'আপনার অর্ডারের যাবতীয় বিবরণ দেখুন, অফিশিয়াল রসিদ ডাউনলোড করুন এবং ডেলিভারি দেওয়ার পূর্ব পর্যন্ত যেকোনো সময় ১ ক্লিকে অর্ডার বাতিল করুন।' 
              : 'Track parcel transit, download official tax receipts, and easily cancel orders prior to final delivery.'}
          </p>
        </div>
      </div>

      {/* Main Search & Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* LEFT COLUMN: ORDERS LIST & QUICK SELECTOR */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Search Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-3">
            <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
              {language === 'bn' ? 'অর্ডার খুঁজুন / ট্র্যাক করুন' : 'Search & Track Order'}
            </label>
            <form onSubmit={handleTrackSearch} className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder={language === 'bn' ? 'অর্ডার কোড (যেমন: 17869) বা ফোন' : 'Order code (e.g. 17869) or Phone'}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-4 py-2.5 bg-[#da1c24] hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (language === 'bn' ? 'খুঁজুন' : 'Track')}
              </button>
            </form>
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200 dark:border-red-900/40">
                {error}
              </p>
            )}
          </div>

          {/* Orders List Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'আমার অর্ডারসমূহ' : 'My Orders'}</span>
              </h4>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                {orders.length} {language === 'bn' ? 'টি' : 'Total'}
              </span>
            </div>
            
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {orders.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>{language === 'bn' ? 'কোনো অর্ডার পাওয়া যায়নি।' : 'No orders found.'}</p>
                </div>
              ) : (
                orders.map(order => {
                  const fiveDigit = getOrder5Digit(order);
                  const isSelected = selectedOrder?.id === order.id;

                  return (
                    <div 
                      key={order.id}
                      onClick={() => handleOrderSelect(order)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex items-center justify-between ${
                        isSelected
                          ? 'bg-red-50/70 dark:bg-red-950/20 border-[#da1c24] shadow-xs' 
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-black text-xs text-[#da1c24] dark:text-red-400">
                            #{fiveDigit}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">•</span>
                          <span className="text-[10px] text-slate-500 font-bold">
                            {new Date(order.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="font-extrabold text-xs text-slate-800 dark:text-white mt-1 truncate">
                          {order.items && order.items[0] ? order.items[0].productTitle : 'Order Parcel'}
                        </p>
                        <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase inline-block ${
                          order.status === 'delivered' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : order.status === 'shipped'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-400'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400 line-through'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
                        }`}>
                          {order.status === 'delivered' ? (language === 'bn' ? 'ডেলিভার্ড' : 'Delivered')
                            : order.status === 'shipped' ? (language === 'bn' ? 'অন-দ্য-ওয়ে' : 'Shipped')
                            : order.status === 'cancelled' ? (language === 'bn' ? 'বাতিল' : 'Cancelled')
                            : (language === 'bn' ? 'প্রসেসিং' : 'Processing')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          {selectedOrder && (
            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                {language === 'bn' ? 'সহায়তা ও ট্যাব' : 'Support & Tabs'}
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-2 text-[11px] font-black rounded-xl transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                    activeTab === 'details'
                      ? 'bg-white dark:bg-slate-900 text-[#da1c24] shadow-xs border border-red-200 dark:border-red-900/50'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>{language === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('refund')}
                  className={`py-2 px-2 text-[11px] font-black rounded-xl transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                    activeTab === 'refund'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-xs border border-amber-200 dark:border-amber-900/50'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{language === 'bn' ? 'রিফান্ড' : 'Refund'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`py-2 px-2 text-[11px] font-black rounded-xl transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                    activeTab === 'chat'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs border border-emerald-200 dark:border-emerald-900/50'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{language === 'bn' ? 'লাইভ চ্যাট' : 'Chat'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: DETAILED ORDER VIEW & LOGISTICS */}
        <div className="lg:col-span-8 space-y-5">
          
          {selectedOrder ? (
            <>
              {activeTab === 'details' && (
                <div className="space-y-5">
                  
                  {/* MAIN ORDER SUMMARY & ACTION HEADER */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-5">
                    
                    {/* Top Row: Order Code, Status, and Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-400">
                            {language === 'bn' ? 'অর্ডার কোড:' : 'Order Code:'}
                          </span>
                          <span className="font-mono font-black text-base sm:text-lg text-[#da1c24] dark:text-red-400">
                            #{getOrder5Digit(selectedOrder)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyOrderCode(getOrder5Digit(selectedOrder))}
                            title="Copy Order ID"
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 transition"
                          >
                            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {language === 'bn' ? 'তারিখ ও সময়:' : 'Placed on:'} {new Date(selectedOrder.createdAt).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
                        </p>
                      </div>

                      {/* PRIMARY ACTION BUTTONS: 1. Download Receipt, 2. Preview Receipt, 3. Cancel Order */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Download Receipt Button */}
                        <button
                          type="button"
                          id="btn-download-receipt-tracking"
                          onClick={() => handleDownloadReceipt(selectedOrder)}
                          disabled={isDownloadingSlip}
                          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black rounded-xl text-xs transition shadow-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>
                            {isDownloadingSlip
                              ? (language === 'bn' ? 'ডাউনলোড হচ্ছে...' : 'Downloading...')
                              : (language === 'bn' ? 'রসিদ ডাউনলোড' : 'Download Receipt')}
                          </span>
                        </button>

                        {/* Preview / Print Slip Modal */}
                        <button
                          type="button"
                          onClick={() => setShowReceiptModal(true)}
                          className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>{language === 'bn' ? 'রসিদ দেখুন' : 'View Slip'}</span>
                        </button>

                        {/* CANCEL ORDER BUTTON: Only allowed before Delivery */}
                        {isOrderCancellable(selectedOrder) ? (
                          <button
                            type="button"
                            id="btn-cancel-order-tracking"
                            onClick={() => setShowCancelModal(true)}
                            className="py-2 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 font-black rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5 text-red-600" />
                            <span>{language === 'bn' ? 'অর্ডার বাতিল করুন' : 'Cancel Order'}</span>
                          </button>
                        ) : selectedOrder.status === 'delivered' ? (
                          <span className="py-1.5 px-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] font-bold flex items-center space-x-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{language === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered'}</span>
                          </span>
                        ) : selectedOrder.status === 'cancelled' ? (
                          <span className="py-1.5 px-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-[11px] font-bold flex items-center space-x-1">
                            <Ban className="w-3.5 h-3.5 text-red-500" />
                            <span>{language === 'bn' ? 'অর্ডারটি বাতিল' : 'Order Cancelled'}</span>
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Notice if order was cancelled */}
                    {selectedOrder.status === 'cancelled' && (
                      <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 font-bold flex items-start space-x-2.5">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-black text-red-800 dark:text-red-200">
                            {language === 'bn' ? 'এই অর্ডারটি বাতিল করা হয়েছে' : 'This order has been cancelled'}
                          </p>
                          <p className="font-medium text-[11px] mt-0.5 text-red-600 dark:text-red-400">
                            {language === 'bn' 
                              ? 'ডেলিভারি সম্পন্ন হওয়ার আগেই আপনার অনুরোধ অনুযায়ী অর্ডারটি বাতিল করা হয়েছে। অনলাইন পেমেন্ট করা থাকলে সম্পূর্ণ রিফান্ড বিকাশ/নগদে সমন্বয় করা হবে।' 
                              : 'This order was cancelled prior to delivery handover upon customer request. If paid online, full refund will be processed.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Notice if order is delivered */}
                    {selectedOrder.status === 'delivered' && (
                      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-start space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-black text-emerald-800 dark:text-emerald-200">
                            {language === 'bn' ? 'পার্সেলটি সফলভাবে আপনার ঠিকানায় ডেলিভারি সম্পন্ন হয়েছে' : 'Parcel successfully delivered to your doorstep'}
                          </p>
                          <p className="font-medium text-[11px] mt-0.5 text-emerald-600 dark:text-emerald-400">
                            {language === 'bn' 
                              ? 'ডেলিভারি সম্পন্ন হওয়ার পর সরাসরি অর্ডার বাতিল প্রযোজ্য নয়। কোনো সমস্যা বা অভিযোগ থাকলে "রিফান্ড" ট্যাব থেকে রিটার্ন আবেদন করতে পারেন।' 
                              : 'Order is delivered. For any product concerns or replacements, please file a refund/return claim.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* PROGRESS MILESTONES (If not cancelled) */}
                    {selectedOrder.status !== 'cancelled' ? (
                      <div className="space-y-3 pt-1">
                        {/* Status notification banner based on pending / confirmed */}
                        {selectedOrder.status === 'pending' ? (
                          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-xs text-amber-900 dark:text-amber-200 font-bold flex items-start space-x-2.5 shadow-xs">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                            <div className="space-y-0.5">
                              <p className="font-black text-amber-900 dark:text-amber-100 text-xs">
                                {language === 'bn' ? 'অর্ডার পেন্ডিং রয়েছে (বিক্রেতার অনুমোদনের অপেক্ষায়)' : 'Order Pending Seller Confirmation'}
                              </p>
                              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                                {language === 'bn' 
                                  ? 'আপনার অর্ডারটি সেলারের কাছে পৌঁছেছে এবং পেন্ডিং তালিকায় রয়েছে। সেলার একসেপ্ট করার সাথে সাথেই এখানে স্ট্যাটাস কনফার্মড হিসেবে দেখতে পাবেন।' 
                                  : 'Your order has been submitted to the seller and is pending approval. Once the seller accepts it, the status here will change to Confirmed.'}
                              </p>
                            </div>
                          </div>
                        ) : selectedOrder.status === 'confirmed' ? (
                          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 font-bold flex items-start space-x-2.5 shadow-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <p className="font-black text-emerald-900 dark:text-emerald-100 text-xs">
                                {language === 'bn' ? 'সেলার অর্ডার কনফার্ম করেছেন!' : 'Order Confirmed by Seller!'}
                              </p>
                              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                                {language === 'bn' 
                                  ? 'সেলার আপনার অর্ডারটি গ্রহণ করে কনফার্ম করেছেন। এটি বর্তমানে প্যাকেজিং ও ডেলিভারির জন্য প্রস্তুত করা হচ্ছে।' 
                                  : 'The seller has reviewed and confirmed your order. It is now being packaged and prepared for courier dispatch.'}
                              </p>
                            </div>
                          </div>
                        ) : null}

                        <div className="flex justify-between items-center text-xs font-black text-slate-800 dark:text-white">
                          <span>{language === 'bn' ? 'ডেলিভারি ট্র্যাকিং অগ্রগতি' : 'Delivery Tracking Milestones'}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                            {selectedOrder.courier?.estimatedDays ? `ETA: ${selectedOrder.courier.estimatedDays}` : 'Est: 1-3 Business Days'}
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="relative">
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
                              style={{ width: `${(currentStage / 5) * 100}%` }}
                            />
                          </div>

                          {/* 5 Milestone Points */}
                          <div className="grid grid-cols-5 text-center mt-3 gap-1">
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-1 ${
                                currentStage >= 1 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
                              }`}>
                                ✓
                              </div>
                              <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-700 dark:text-slate-300 leading-tight">
                                {language === 'bn' ? 'অর্ডার গৃহীত' : 'Placed'}
                              </span>
                            </div>

                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-1 ${
                                currentStage >= 2 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {currentStage >= 2 ? '✓' : '2'}
                              </div>
                              <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-700 dark:text-slate-300 leading-tight">
                                {language === 'bn' ? 'অর্ডার কনফার্মড' : 'Confirmed'}
                              </span>
                            </div>

                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-1 ${
                                currentStage >= 3 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {currentStage >= 3 ? '✓' : '3'}
                              </div>
                              <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-700 dark:text-slate-300 leading-tight">
                                {language === 'bn' ? 'প্যাকেজিং' : 'Packed'}
                              </span>
                            </div>

                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-1 ${
                                currentStage >= 4 ? 'bg-emerald-600 text-white shadow-xs animate-pulse' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {currentStage >= 4 ? '✓' : '4'}
                              </div>
                              <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-700 dark:text-slate-300 leading-tight">
                                {language === 'bn' ? 'অন-দ্য-ওয়ে' : 'In Transit'}
                              </span>
                            </div>

                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-1 ${
                                currentStage >= 5 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {currentStage >= 5 ? '✓' : '5'}
                              </div>
                              <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-700 dark:text-slate-300 leading-tight">
                                {language === 'bn' ? 'ডেলিভার্ড' : 'Delivered'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                  </div>

                  {/* PRODUCTS ORDERED LIST */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                      <Package className="w-4 h-4 text-[#da1c24]" />
                      <span>{language === 'bn' ? 'অর্ডারকৃত পণ্যসমূহ ও বিবরণ' : 'Ordered Items & Specifications'}</span>
                    </h4>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="py-3.5 flex items-start space-x-3.5">
                          {/* Image */}
                          <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            {item.productImage ? (
                              <img src={item.productImage} alt={item.productTitle} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-slate-400" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-extrabold text-xs text-slate-800 dark:text-white leading-snug">
                              {item.productTitle}
                            </h5>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              SKU: {item.sku || 'SKU-BD' + getOrder5Digit(selectedOrder)} • {item.sellerName || 'AmarBazar Verified'}
                            </p>

                            {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {Object.entries(item.selectedVariants).map(([k, v]) => (
                                  <span key={k} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[9px] font-bold">
                                    {k}: {v}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                              <span className="text-[11px] text-slate-500 font-semibold">
                                {currency} {item.price} × {item.quantity}
                              </span>
                              <span className="font-black text-xs text-[#da1c24] font-mono">
                                {currency} {item.price * item.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADDRESS, PAYMENT & BILLING SUMMARY */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Delivery & Customer Info */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
                      <div className="flex items-center space-x-2 text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <h4 className="text-xs font-black uppercase tracking-wider">
                          {language === 'bn' ? 'প্রাপক ও ডেলিভারি ঠিকানা' : 'Recipient & Delivery Details'}
                        </h4>
                      </div>

                      <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                        <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {selectedOrder.customerName}
                        </p>
                        <p className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{selectedOrder.customerPhone}</span>
                        </p>
                        <p className="pt-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                          🏠 {selectedOrder.shippingAddress?.fullAddress || 'House 12, Road 4, Dhanmondi, Dhaka'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-bold">
                          📍 {selectedOrder.shippingAddress?.thana || 'Dhanmondi'}, {selectedOrder.shippingAddress?.district || 'Dhaka'} ({selectedOrder.shippingAddress?.division || 'Dhaka'})
                        </p>
                      </div>
                    </div>

                    {/* Payment & Billing Breakdown */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
                      <div className="flex items-center space-x-2 text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                        <CreditCard className="w-4 h-4 text-[#da1c24] shrink-0" />
                        <h4 className="text-xs font-black uppercase tracking-wider">
                          {language === 'bn' ? 'পেমেন্ট ও বিলিং সারসংক্ষেপ' : 'Billing & Payment Summary'}
                        </h4>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>{language === 'bn' ? 'সাবটোটাল (পণ্যমূল্য):' : 'Subtotal:'}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                            {formatPrice(selectedOrder.subtotal)}
                          </span>
                        </div>

                        <div className="flex justify-between text-slate-500">
                          <span>{language === 'bn' ? 'ডেলিভারি ফি:' : 'Shipping Fee:'}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                            {formatPrice(selectedOrder.shippingFee)}
                          </span>
                        </div>

                        {selectedOrder.discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-600 font-bold">
                            <span>{language === 'bn' ? 'ডিসকাউন্ট:' : 'Discount:'}</span>
                            <span className="font-mono">-{formatPrice(selectedOrder.discountAmount)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span>{language === 'bn' ? 'মোট প্রদেয় টাকা:' : 'Total Amount:'}</span>
                          <span className="text-[#da1c24] font-mono text-base">
                            {formatPrice(selectedOrder.totalAmount)}
                          </span>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-[11px] font-bold border-t border-slate-100 dark:border-slate-800/80">
                          <span className="text-slate-500">{language === 'bn' ? 'পেমেন্ট মাধ্যম:' : 'Payment Method:'}</span>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-black text-slate-800 dark:text-slate-200 uppercase">
                            {selectedOrder.paymentMethod === 'cod' 
                              ? (language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery') 
                              : selectedOrder.paymentMethod.toUpperCase()}
                          </span>
                        </div>

                        {selectedOrder.transactionId && (
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>TrxID:</span>
                            <span className="font-bold text-slate-600 dark:text-slate-300">{selectedOrder.transactionId}</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* COURIER & LOGISTICS DETAILS */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-sky-500" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                          {language === 'bn' ? 'কুরিয়ার ডেলিভারি ও রিয়েল-টাইম ট্র্যাকিং' : 'Courier Logistics & Live Route'}
                        </h4>
                      </div>
                      <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                        {selectedOrder.courier?.provider || 'Pathao Express'} #{selectedOrder.courier?.trackingNumber || 'PTH-' + getOrder5Digit(selectedOrder)}
                      </span>
                    </div>

                    {/* Timeline logs */}
                    <div className="relative pl-6 space-y-4 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200 dark:before:bg-slate-800">
                      {selectedOrder.courier?.statusLogs && selectedOrder.courier.statusLogs.length > 0 ? (
                        selectedOrder.courier.statusLogs.map((log, idx) => (
                          <div key={idx} className="relative text-xs font-semibold">
                            <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 ${
                              idx === 0 ? 'bg-emerald-500 scale-110 shadow-sm' : 'bg-slate-300 dark:bg-slate-700'
                            }`} />
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-slate-800 dark:text-white">{log.status}</span>
                              <span className="text-[10px] text-slate-400 font-bold">{log.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{log.location}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-500 space-y-2 font-medium">
                          <p className="font-bold text-slate-800 dark:text-white">● {language === 'bn' ? 'পার্সেলটি হাব থেকে প্রস্তুত করা হয়েছে।' : 'Parcel prepared at fulfillment center.'}</p>
                          <p className="text-[11px] text-slate-400">{language === 'bn' ? 'কুরিয়ার রাইডারের কাছে হস্তান্তরের অপেক্ষায় রয়েছে।' : 'Awaiting courier pickup & handover.'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* REFUND TAB */}
              {activeTab === 'refund' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center space-x-2 text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                    <RefreshCw className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        {language === 'bn' ? 'রিফান্ড ও রিটার্ন আবেদন কেন্দ্র' : 'Instant Refund & Return Claim Desk'}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {language === 'bn' 
                          ? 'ভাঙা পণ্য, ভুল সাইজ বা মানের ঘাটতি থাকলে রিফান্ড আবেদন করুন। বিকাশ নম্বরে টাকা পৌঁছে দেওয়া হবে।' 
                          : 'Submit claims for damaged or wrong products. Instant refund to your bKash wallet.'}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleRefundSubmit} className="space-y-4 text-xs font-bold">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                        {language === 'bn' ? 'নির্বাচিত অর্ডার' : 'Selected Order'}
                      </span>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-800 dark:text-white">#{getOrder5Digit(selectedOrder)}</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">{formatPrice(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-600 dark:text-slate-300 block">{language === 'bn' ? 'সমস্যার ধরন (রিটার্ন কারণ)' : 'Refund / Return Reason'}</label>
                      <select 
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Damaged Product">{language === 'bn' ? 'পণ্যটি ভাঙা / নষ্ট পেয়েছি' : 'Product is physically damaged / broken'}</option>
                        <option value="Wrong Item">{language === 'bn' ? 'ভুল সাইজ বা মডেল পেয়েছি' : 'Received wrong item / incorrect model'}</option>
                        <option value="Low Quality">{language === 'bn' ? 'মানের চরম অভাব (আলাদা পণ্য)' : 'Quality is far lower than described'}</option>
                        <option value="Missing Parts">{language === 'bn' ? 'প্যাকেজের সাথে প্রয়োজনীয় অংশ নেই' : 'Package is missing parts or accessories'}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-600 dark:text-slate-300 block">{language === 'bn' ? 'বিস্তারিত এবং বিকাশ নম্বর' : 'Comment & bKash Wallet No.'}</label>
                      <textarea 
                        value={refundComments}
                        onChange={(e) => setRefundComments(e.target.value)}
                        rows={3}
                        placeholder={language === 'bn' ? 'আপনার বিকাশ নম্বর এবং সমস্যার বিস্তারিত এখানে লিখুন...' : 'Provide details and state your bKash wallet number for refund credit...'}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none min-h-[80px] leading-relaxed font-semibold"
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmittingRefund}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSubmittingRefund ? 'animate-spin' : ''}`} />
                      <span>{language === 'bn' ? 'রিফান্ড ও রিটার্ন ক্লেইম জমা দিন' : 'Submit Refund Claim'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* CHAT TAB */}
              {activeTab === 'chat' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between min-h-[420px]">
                  {/* Chat Header */}
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
                        <div className="w-8 h-8 rounded-full bg-[#da1c24] text-white flex items-center justify-center font-bold text-xs">
                          AB
                        </div>
                      </div>
                      <div>
                        <h5 className="font-black text-xs text-slate-800 dark:text-white leading-tight">AmarBazar Care</h5>
                        <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Online Agent</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[300px]">
                    {messages.map((m, idx) => (
                      <div 
                        key={idx}
                        className={`flex flex-col max-w-[85%] ${m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-[#da1c24] text-white rounded-tr-none' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                        }`}>
                          {m.text}
                        </div>
                        <span className="text-[8px] text-slate-400 mt-1 px-1 font-semibold">{m.time}</span>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex items-center space-x-1.5 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none max-w-[60px]">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={language === 'bn' ? 'আপনার বার্তা লিখুন...' : 'Type message...'}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none font-semibold"
                    />
                    <button 
                      type="submit" 
                      className="p-2.5 bg-[#da1c24] hover:bg-red-700 text-white rounded-xl transition shrink-0 flex items-center justify-center cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-2xl text-center space-y-3">
              <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
              <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-300">
                {language === 'bn' ? 'কোনো অর্ডার নির্বাচিত নেই' : 'No Order Selected'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {language === 'bn' 
                  ? 'বাঁ দিকের তালিকা থেকে একটি অর্ডার নির্বাচন করুন অথবা আপনার অর্ডার কোড দিয়ে সার্চ করুন।' 
                  : 'Select an order from the left list or enter an order code in the search bar.'}
              </p>
            </div>
          )}

        </div>

      </div>

      {/* FULL RECEIPT PREVIEW MODAL */}
      {showReceiptModal && selectedOrder && (
        <OrderReceiptSlip
          order={selectedOrder}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {/* ORDER CANCELLATION MODAL */}
      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100">
            
            {/* Modal Header */}
            <div className="p-4 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Ban className="w-5 h-5 text-red-200" />
                <h3 className="font-black text-sm sm:text-base">
                  {language === 'bn' ? 'অর্ডার বাতিল নিশ্চিতকরণ' : 'Cancel Order Confirmation'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCancelModal(false)}
                className="p-1 hover:bg-red-700 rounded-full transition text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              
              {/* Order Pill */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">
                    {language === 'bn' ? 'অর্ডার কোড' : 'Order ID'}
                  </span>
                  <span className="font-mono font-black text-sm text-[#da1c24] dark:text-red-400">
                    #{getOrder5Digit(selectedOrder)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold block text-[10px]">
                    {language === 'bn' ? 'মোট টাকা' : 'Total'}
                  </span>
                  <span className="font-black text-xs text-slate-800 dark:text-slate-200">
                    {formatPrice(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Policy Explanation */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-black flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{language === 'bn' ? 'অর্ডার বাতিল সংক্রান্ত নীতিমালা' : 'Cancellation Policy'}</span>
                </p>
                <p className="text-[11px] leading-relaxed font-semibold">
                  {language === 'bn' 
                    ? 'ডেলিভারি সম্পন্ন হওয়ার আগ পর্যন্ত আপনি সম্পূর্ণ বিনামূল্যে যেকোনো সময় অর্ডার বাতিল করতে পারেন। ক্যাশ অন ডেলিভারি অর্ডারে কোনো ফি কাটা হবে না। অনলাইন পেমেন্ট করা থাকলে বিকাশ/নগদে সম্পূর্ণ টাকা ফেরত দেওয়া হবে।' 
                    : 'You may cancel anytime prior to final delivery without any penalty. Online payments will be refunded in full.'}
                </p>
              </div>

              {/* Reason Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                  {language === 'bn' ? 'অর্ডার বাতিলের কারণ নির্বাচন করুন:' : 'Select Cancellation Reason:'}
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="ভুল পণ্য বা সাইজ অর্ডার করেছি">{language === 'bn' ? 'ভুল পণ্য বা সাইজ অর্ডার করেছি' : 'Ordered wrong item or size'}</option>
                  <option value="ডেলিভারি ঠিকানা পরিবর্তন করতে হবে">{language === 'bn' ? 'ডেলিভারি ঠিকানা পরিবর্তন করতে হবে' : 'Need to change delivery address'}</option>
                  <option value="পেমেন্ট মেথড পরিবর্তন করতে চাই">{language === 'bn' ? 'পেমেন্ট মেথড পরিবর্তন করতে চাই' : 'Want to change payment method'}</option>
                  <option value="ডেলিভারিতে অনেক বেশি সময় লাগছে">{language === 'bn' ? 'ডেলিভারিতে অনেক বেশি সময় লাগছে' : 'Delivery takes too long'}</option>
                  <option value="অন্য কোথাও থেকে কিনে নিয়েছি">{language === 'bn' ? 'অন্য কোথাও থেকে কিনে নিয়েছি' : 'Purchased from elsewhere'}</option>
                  <option value="পণ্যটির এখন আর প্রয়োজন নেই">{language === 'bn' ? 'পণ্যটির এখন আর প্রয়োজন নেই' : 'No longer need the product'}</option>
                  <option value="অন্যান্য কারণ">{language === 'bn' ? 'অন্যান্য কারণ' : 'Other reason'}</option>
                </select>
              </div>

              {/* Comments Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                  {language === 'bn' ? 'অতিরিক্ত মন্তব্য (ঐচ্ছিক):' : 'Additional Comments (Optional):'}
                </label>
                <textarea
                  value={cancelComments}
                  onChange={(e) => setCancelComments(e.target.value)}
                  placeholder={language === 'bn' ? 'বাতিলের কারণ সম্পর্কে কিছু লিখুন...' : 'Write reason or feedback...'}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none font-semibold"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  {language === 'bn' ? 'না, রেখে দিন' : 'No, Keep Order'}
                </button>

                <button
                  type="button"
                  id="btn-confirm-cancel-order"
                  onClick={handleConfirmCancelOrder}
                  disabled={isCancelling}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black rounded-xl text-xs transition shadow-md flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isCancelling ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Ban className="w-4 h-4" />
                  )}
                  <span>
                    {isCancelling 
                      ? (language === 'bn' ? 'বাতিল হচ্ছে...' : 'Cancelling...') 
                      : (language === 'bn' ? 'হ্যাঁ, বাতিল করুন' : 'Yes, Cancel Order')}
                  </span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
