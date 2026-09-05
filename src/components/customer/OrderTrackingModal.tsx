import React, { useState, useEffect } from 'react';
import { 
  X, Truck, CheckCircle2, PackageCheck, MapPin, Clock, Search,
  Download, Printer, Ban, AlertTriangle, RefreshCw, Check, Copy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { api } from '../../services/api';
import { OrderReceiptSlip } from './OrderReceiptSlip';

export const OrderTrackingModal: React.FC = () => {
  const { trackingOrderId, setTrackingOrderId, language, currency, formatPrice, triggerBanner } = useApp() as any;

  const [order, setOrder] = useState<Order | null>(null);
  const [searchId, setSearchId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Receipt & Cancel Modals
  const [showSlipModal, setShowSlipModal] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('ভুল পণ্য বা সাইজ অর্ডার করেছি');
  const [cancelComments, setCancelComments] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const fetchOrder = async (id: string) => {
    setIsLoading(true);
    setError('');
    try {
      const cleanId = id.trim().replace('#', '');
      // Try direct API first
      let ord: Order | null = null;
      try {
        ord = await api.getOrderById(cleanId);
      } catch {}

      // If not directly found, search all orders
      if (!ord) {
        const allOrders = await api.getOrders();
        ord = allOrders.find(o => 
          o.id === cleanId || 
          (o.orderNumber && o.orderNumber.toLowerCase() === cleanId.toLowerCase()) ||
          (o.order5DigitId && o.order5DigitId === cleanId) ||
          (o.customerPhone && o.customerPhone.includes(cleanId))
        ) || null;
      }

      if (ord) {
        setOrder(ord);
      } else {
        setError(language === 'bn' ? 'অর্ডার পাওয়া যায়নি। সঠিক অর্ডার আইডি দিন।' : 'Order not found. Please check your Order ID.');
        setOrder(null);
      }
    } catch (err) {
      setError(language === 'bn' ? 'অর্ডার ট্র্যাকিং এ সমস্যা হয়েছে।' : 'Error retrieving order.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (trackingOrderId) {
      setSearchId(trackingOrderId);
      fetchOrder(trackingOrderId);
    }
  }, [trackingOrderId]);

  if (!trackingOrderId) return null;

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      fetchOrder(searchId.trim());
    }
  };

  const getOrder5Digit = (ord: Order) => {
    return ord.order5DigitId || 
           (ord.orderNumber ? ord.orderNumber.replace(/[^0-9]/g, '').slice(-5) : '') || 
           (ord.id ? ord.id.replace(/[^0-9]/g, '').slice(-5) : '') || 
           '20712';
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    if (triggerBanner) {
      triggerBanner(language === 'bn' ? 'অর্ডার কোড কপি করা হয়েছে!' : 'Order code copied!');
    }
  };

  // Direct download receipt
  const handleDownloadReceipt = (orderObj: Order) => {
    const fiveDigitId = getOrder5Digit(orderObj);
    const isCod = orderObj.paymentMethod === 'cod';

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
    .calculation-table { width: 340px; margin-left: auto; border-collapse: collapse; margin-bottom: 16px; }
    .calculation-table td { padding: 5px 8px; font-size: 12px; }
    .calculation-table .total-row td { font-size: 16px; font-weight: 900; color: #da1c24; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; padding-top: 8px; padding-bottom: 8px; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #64748b; text-align: center; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-logo">AMAR BAZAR BD</div>
      <div class="sub-brand">Official Customer Slip & Delivery Memo</div>
      <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b;">Helpline: 09612-BAZAR • support@amarbazar.bd</p>
    </div>
    <div style="text-align: right;">
      <h1 class="invoice-title">${language === 'bn' ? 'অফিশিয়াল অর্ডার ও ডেলিভারি স্লিপ' : 'OFFICIAL INVOICE & DELIVERY SLIP'}</h1>
      <div><span class="order-badge">5-DIGIT ID: ${fiveDigitId}</span></div>
      <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Date: ${new Date(orderObj.createdAt).toLocaleString()}</p>
    </div>
  </div>

  <div class="grid">
    <div class="info-box">
      <h4>${language === 'bn' ? 'গ্রাহক ও ডেলিভারি ঠিকানা' : 'CUSTOMER & DELIVERY DETAILS'}</h4>
      <strong>${orderObj.customerName}</strong><br/>
      <span>📞 ${orderObj.customerPhone}</span><br/>
      <span>🏠 ${orderObj.shippingAddress?.fullAddress || 'Address on file'}</span><br/>
      <span>📍 ${orderObj.shippingAddress?.thana || 'Dhanmondi'}, ${orderObj.shippingAddress?.district || 'Dhaka'}</span>
    </div>
    <div class="info-box">
      <h4>${language === 'bn' ? 'পেমেন্ট ও কুরিয়ার' : 'PAYMENT & COURIER'}</h4>
      <div><strong>${language === 'bn' ? 'পেমেন্ট:' : 'Payment:'}</strong> ${orderObj.paymentMethod.toUpperCase()} (${orderObj.paymentStatus.toUpperCase()})</div>
      <div><strong>${language === 'bn' ? 'কুরিয়ার:' : 'Courier:'}</strong> ${orderObj.courier?.provider || 'Pathao Express'}</div>
      <div><strong>${language === 'bn' ? 'ট্র্যাকিং:' : 'Tracking:'}</strong> ${orderObj.courier?.trackingNumber || 'PTH-' + fiveDigitId}</div>
      <div><strong>${language === 'bn' ? 'স্ট্যাটাস:' : 'Status:'}</strong> <strong style="color: #da1c24;">${orderObj.status.toUpperCase()}</strong></div>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>#</th>
        <th>${language === 'bn' ? 'পণ্য' : 'PRODUCT'}</th>
        <th class="text-right">${language === 'bn' ? 'মূল্য' : 'PRICE'}</th>
        <th style="text-align: center;">${language === 'bn' ? 'পরিমাণ' : 'QTY'}</th>
        <th class="text-right">${language === 'bn' ? 'মোট' : 'TOTAL'}</th>
      </tr>
    </thead>
    <tbody>
      ${orderObj.items.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${item.productTitle}</strong></td>
          <td class="text-right">${currency} ${item.price}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td class="text-right"><strong>${currency} ${item.price * item.quantity}</strong></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <table class="calculation-table">
    <tr>
      <td>${language === 'bn' ? 'সাবটোটাল:' : 'Subtotal:'}</td>
      <td class="text-right">${currency} ${orderObj.subtotal}</td>
    </tr>
    <tr>
      <td>${language === 'bn' ? 'ডেলিভারি চার্জ:' : 'Shipping Fee:'}</td>
      <td class="text-right">${currency} ${orderObj.shippingFee}</td>
    </tr>
    <tr class="total-row">
      <td><strong>${language === 'bn' ? 'সর্বমোট প্রদেয়:' : 'Total Amount:'}</strong></td>
      <td class="text-right"><strong>${currency} ${orderObj.totalAmount}</strong></td>
    </tr>
  </table>

  <div class="footer">
    <p>${language === 'bn' ? 'আমার বাজার-এ কেনাকাটা করার জন্য ধন্যবাদ!' : 'Thank you for shopping with AmarBazar!'}</p>
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
      triggerBanner(language === 'bn' ? 'অর্ডার রসিদ ডাউনলোড সম্পন্ন হয়েছে!' : 'Receipt downloaded!');
    }
  };

  // Cancellation Allowed Prior to Delivery
  const isCancellable = (ord: Order) => {
    return ord.status !== 'delivered' && ord.status !== 'cancelled';
  };

  const handleConfirmCancel = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      const note = `Cancelled by Customer. Reason: ${cancelReason}${cancelComments ? ' - ' + cancelComments : ''}`;
      await api.updateOrderStatus(order.id, 'cancelled', note);
      
      const updatedOrder: Order = {
        ...order,
        status: 'cancelled',
        courier: order.courier ? {
          ...order.courier,
          statusLogs: [
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'Order Cancelled', location: 'Customer Modal' },
            ...(order.courier.statusLogs || [])
          ]
        } : undefined
      };

      setOrder(updatedOrder);
      setShowCancelModal(false);

      if (triggerBanner) {
        triggerBanner(language === 'bn' ? 'অর্ডারটি সফলভাবে বাতিল করা হয়েছে!' : 'Order cancelled successfully!');
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm sm:text-base">
                {language === 'bn' ? 'লাইভ কুরিয়ার ও অর্ডার ট্র্যাকিং' : 'Live Courier Order Tracking'}
              </h3>
            </div>
            <button 
              onClick={() => setTrackingOrderId(null)} 
              className="p-1 hover:bg-slate-700 rounded-full transition text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* Search Bar */}
            <form onSubmit={handleManualSearch} className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder={language === 'bn' ? 'অর্ডার কোড (যেমন: 17869) বা ফোন নম্বর' : 'Order ID (e.g., 17869) or Phone'}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2.5 bg-[#da1c24] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (language === 'bn' ? 'ট্র্যাক' : 'Track')}
              </button>
            </form>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            {order && (
              <div className="space-y-4">
                
                {/* Order Top Bar & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-slate-500">{language === 'bn' ? 'অর্ডার:' : 'Order:'}</span>
                      <span className="font-mono font-black text-sm text-[#da1c24]">#{getOrder5Digit(order)}</span>
                      <button 
                        onClick={() => handleCopyCode(getOrder5Digit(order))}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                        title="Copy"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase mt-1 inline-block ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 line-through'
                      : order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : order.status === 'processing' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      : order.status === 'shipped' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {order.status === 'delivered' ? (language === 'bn' ? 'ডেলিভার্ড' : 'Delivered')
                        : order.status === 'shipped' ? (language === 'bn' ? 'অন-দ্য-ওয়ে' : 'Shipped')
                        : order.status === 'confirmed' ? (language === 'bn' ? 'কনফার্মড' : 'Confirmed')
                        : order.status === 'processing' ? (language === 'bn' ? 'প্রসেসিং' : 'Processing')
                        : order.status === 'cancelled' ? (language === 'bn' ? 'বাতিল' : 'Cancelled')
                        : (language === 'bn' ? 'পেন্ডিং (অপেক্ষমাণ)' : 'Pending')}
                    </span>
                  </div>

                  {/* Actions: Download Receipt & Cancel Order */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadReceipt(order)}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>{language === 'bn' ? 'রসিদ' : 'Receipt'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowSlipModal(true)}
                      className="py-1.5 px-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>{language === 'bn' ? 'ভিউ' : 'View'}</span>
                    </button>

                    {isCancellable(order) && (
                      <button
                        type="button"
                        onClick={() => setShowCancelModal(true)}
                        className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-black rounded-lg text-xs transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Ban className="w-3 h-3 text-red-600" />
                        <span>{language === 'bn' ? 'বাতিল' : 'Cancel'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Cancelled Alert */}
                {order.status === 'cancelled' && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold">
                    {language === 'bn' ? 'এই অর্ডারটি ডেলিভারির পূর্বেই সফলভাবে বাতিল করা হয়েছে।' : 'This order has been cancelled prior to delivery.'}
                  </div>
                )}

                {/* Order Details Grid */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{language === 'bn' ? 'কুরিয়ার পার্টনার:' : 'Courier Partner:'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{order.courier?.provider || 'Pathao Express'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{language === 'bn' ? 'ট্র্যাকিং কোড:' : 'Tracking Code:'}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{order.courier?.trackingNumber || 'PTH-' + getOrder5Digit(order)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{language === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Address:'}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-right max-w-[240px] truncate">{order.shippingAddress?.fullAddress || 'Dhaka, BD'}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5 font-bold">
                    <span className="text-slate-500">{language === 'bn' ? 'মোট টাকা:' : 'Total Amount:'}</span>
                    <span className="text-[#da1c24] font-mono text-sm">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div>
                  <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-3">
                    {language === 'bn' ? 'কুরিয়ার ট্র্যাকিং টাইমলাইন:' : 'Logistics Timeline:'}
                  </h4>
                  <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-500/30 pl-8">
                    {order.courier?.statusLogs && order.courier.statusLogs.length > 0 ? (
                      order.courier.statusLogs.map((log, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-800 dark:text-slate-100">{log.status}</p>
                            <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                              <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{log.time}</span>
                              <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{log.location}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500">
                        ● {language === 'bn' ? 'পার্সেল প্রস্তুত করা হয়েছে।' : 'Parcel prepared.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                  <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-2">
                    {language === 'bn' ? 'প্যাকেজের পণ্যসমূহ:' : 'Package Items:'}
                  </h4>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <img src={item.productImage} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{item.productTitle}</p>
                            {item.selectedVariants && (
                              <div className="flex gap-1 mt-0.5 text-[9px] text-slate-500">
                                {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="font-bold shrink-0">x{item.quantity} ({formatPrice(item.price * item.quantity)})</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>

      {/* Slip Modal */}
      {showSlipModal && order && (
        <OrderReceiptSlip
          order={order}
          onClose={() => setShowSlipModal(false)}
        />
      )}

      {/* Cancel Modal */}
      {showCancelModal && order && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between text-red-600 font-black text-sm">
              <span className="flex items-center space-x-1.5">
                <Ban className="w-4 h-4" />
                <span>{language === 'bn' ? 'অর্ডার বাতিল করুন' : 'Cancel Order'}</span>
              </span>
              <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-300 font-medium">
              {language === 'bn' 
                ? 'ডেলিভারি পৌঁছানোর পূর্ব পর্যন্ত আপনি সম্পূর্ণ বিনামূল্যে অর্ডার বাতিল করতে পারেন।' 
                : 'You may cancel this order prior to final delivery without any charges.'}
            </p>

            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold"
            >
              <option value="ভুল পণ্য বা সাইজ">{language === 'bn' ? 'ভুল পণ্য বা সাইজ অর্ডার করেছি' : 'Wrong item / size'}</option>
              <option value="ঠিকানা পরিবর্তন">{language === 'bn' ? 'ডেলিভারি ঠিকানা পরিবর্তন করতে হবে' : 'Change address'}</option>
              <option value="দেরি হচ্ছে">{language === 'bn' ? 'ডেলিভারিতে বেশি সময় লাগছে' : 'Takes too long'}</option>
              <option value="অন্যান্য">{language === 'bn' ? 'অন্যান্য কারণ' : 'Other'}</option>
            </select>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-300"
              >
                {language === 'bn' ? 'না' : 'No'}
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black disabled:opacity-50"
              >
                {isCancelling ? '...' : (language === 'bn' ? 'হ্যাঁ, বাতিল করুন' : 'Yes, Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
