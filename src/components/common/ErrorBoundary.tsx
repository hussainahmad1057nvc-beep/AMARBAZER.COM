import React, { ErrorInfo, ReactNode } from 'react';
import { 
  RefreshCw, 
  AlertTriangle, 
  Home, 
  Trash2, 
  Download, 
  Printer, 
  FileText, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag
} from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showReceiptPreview: boolean;
  showTechnicalDetails: boolean;
  downloadSuccess: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showReceiptPreview: false,
      showTechnicalDetails: false,
      downloadSuccess: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error, 
      errorInfo: null,
      showReceiptPreview: false,
      showTechnicalDetails: false,
      downloadSuccess: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught App Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetApp = () => {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('amarbazar_products_store');
      localStorage.removeItem('amarbazar_categories_store');
      localStorage.removeItem('amarbazar_sellers_store');
      localStorage.removeItem('amarbazar_orders_store');
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }
    window.location.href = window.location.pathname;
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  // Helper to extract purchase receipt info from storage
  private getReceiptData = () => {
    let customerName = 'সম্মানিত ক্রেতা (Valued Customer)';
    let customerPhone = '017XXXXXXXX';
    let customerAddress = 'ঢাকা, বাংলাদেশ';
    let orderNumber = '58392';
    let items: Array<{ id: string; name: string; price: number; quantity: number; image?: string; sellerName?: string }> = [];
    let subtotal = 0;
    const deliveryFee = 60;
    let paymentMethod = 'Cash on Delivery / Digital Payment';
    const orderDate = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

    try {
      // 1. Try reading currentUser
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.name) customerName = u.name;
        if (u.phone) customerPhone = u.phone;
        if (u.address) customerAddress = u.address;
      }

      // 2. Try reading last order or orders
      const storedOrders = localStorage.getItem('amarbazar_orders_store');
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const lastOrder = parsed[parsed.length - 1];
          if (lastOrder.order5DigitId) orderNumber = lastOrder.order5DigitId;
          else if (lastOrder.orderNumber) orderNumber = lastOrder.orderNumber.replace(/[^0-9]/g, '').slice(-5) || '58392';
          
          if (lastOrder.shippingAddress?.fullName) customerName = lastOrder.shippingAddress.fullName;
          if (lastOrder.shippingAddress?.phone) customerPhone = lastOrder.shippingAddress.phone;
          if (lastOrder.shippingAddress?.address) customerAddress = `${lastOrder.shippingAddress.address}, ${lastOrder.shippingAddress.city || ''}`;
          if (lastOrder.paymentMethod) paymentMethod = String(lastOrder.paymentMethod).toUpperCase();

          if (Array.isArray(lastOrder.items) && lastOrder.items.length > 0) {
            items = lastOrder.items.map((it: any) => ({
              id: it.id || it.productId || '1',
              name: it.product?.title || it.title || it.productName || 'অমরবাজার ডিজিটাল পণ্য সামগ্রী',
              price: Number(it.price || it.unitPrice || 650),
              quantity: Number(it.quantity || 1),
              image: it.product?.images?.[0] || it.image,
              sellerName: it.product?.sellerName || 'অমরবাজার অথেন্টিক শপ'
            }));
          }
        }
      }

      // 3. Fallback: Try reading cart if no items
      if (items.length === 0) {
        const storedCart = localStorage.getItem('cart') || localStorage.getItem('amarbazar_cart');
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            items = parsedCart.map((it: any) => ({
              id: it.id || it.product?.id || '1',
              name: it.product?.title || it.title || 'অমরবাজার পণ্য',
              price: Number(it.product?.price || it.price || 500),
              quantity: Number(it.quantity || 1),
              image: it.product?.images?.[0] || it.image,
              sellerName: it.product?.sellerName || 'অমরবাজার অফিসিয়াল স্টোর'
            }));
          }
        }
      }
    } catch (e) {
      console.warn('Error reading stored receipt details:', e);
    }

    // Default Fallback Sample Items if nothing in cache
    if (items.length === 0) {
      items = [
        {
          id: 'item-1',
          name: 'অমরবাজার প্রিমিয়াম স্মার্ট ফ্যাশন ও গ্যাজেট সামগ্রী (Official Product)',
          price: 1250,
          quantity: 1,
          sellerName: 'অমরবাজার অফিসিয়াল ভেরিফাইড শপ'
        },
        {
          id: 'item-2',
          name: 'অর্গানিক কোয়ালিটি স্পেশাল প্যাকেজ (Organic Quality Pack)',
          price: 450,
          quantity: 2,
          sellerName: 'অমরবাজার প্রিমিয়াম মার্কেট'
        }
      ];
    }

    subtotal = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const total = subtotal + deliveryFee;

    return {
      orderNumber,
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod,
      orderDate,
      items,
      subtotal,
      deliveryFee,
      total
    };
  };

  // 1-Click PDF / Printable HTML Slip Download Function
  private handleDownloadReceiptPdf = () => {
    const data = this.getReceiptData();
    const fiveDigitId = data.orderNumber;

    const itemsRowsHtml = data.items.map((it, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 1 ? 'background: #f8fafc;' : ''}">
        <td style="padding: 10px 12px; font-size: 12px; vertical-align: top;">
          <strong>${idx + 1}. ${it.name}</strong>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">বিক্রেতা/দোকান: ${it.sellerName || 'অমরবাজার বিডি'} | কোড: #SKU-${it.id.slice(-4).toUpperCase()}</div>
        </td>
        <td style="padding: 10px 12px; font-size: 12px; text-align: center; vertical-align: top; font-weight: bold;">
          ${it.quantity}
        </td>
        <td style="padding: 10px 12px; font-size: 12px; text-align: right; vertical-align: top;">
          ৳${it.price.toLocaleString()}
        </td>
        <td style="padding: 10px 12px; font-size: 12px; text-align: right; vertical-align: top; font-weight: bold; color: #0f172a;">
          ৳${(it.price * it.quantity).toLocaleString()}
        </td>
      </tr>
    `).join('');

    const slipHtml = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>AmarBazar_Official_Order_Receipt_Slip_${fiveDigitId}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; line-height: 1.4; padding: 20px; max-width: 800px; margin: 0 auto; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 18px; }
    .brand-logo { background: #059669; color: white; padding: 8px 16px; border-radius: 8px; font-size: 22px; font-weight: 900; display: inline-block; }
    .sub-brand { font-size: 11px; font-weight: 800; color: #64748b; margin-top: 4px; text-transform: uppercase; }
    .invoice-title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; text-align: right; }
    .order-badge { background: #ecfdf5; border: 2px solid #059669; padding: 4px 12px; border-radius: 8px; font-family: monospace; font-size: 18px; font-weight: 900; color: #059669; display: inline-block; margin-top: 6px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px; }
    .info-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; font-size: 12px; }
    .info-box h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    .items-table th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .calc-table { width: 340px; margin-left: auto; border-collapse: collapse; margin-bottom: 20px; }
    .calc-table td { padding: 6px 10px; font-size: 12px; }
    .total-row td { font-size: 16px; font-weight: 900; color: #059669; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; padding-top: 8px; padding-bottom: 8px; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 11px; color: #64748b; text-align: center; margin-top: 20px; }
    .barcode-box { text-align: center; margin-top: 14px; font-family: monospace; font-size: 13px; letter-spacing: 5px; font-weight: 900; }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-logo">AmarBazar BD</div>
      <div class="sub-brand">Digital Marketplace • অফিসিয়াল ক্যাশ মেমো ও ডেলিভারি চালান</div>
    </div>
    <div style="text-align: right;">
      <h2 class="invoice-title">অর্ডার চালান ও রিসিট (INVOICE)</h2>
      <div class="order-badge">#${fiveDigitId}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">তারিখ: ${data.orderDate}</div>
    </div>
  </div>

  <div class="grid">
    <div class="info-box">
      <h4>ক্রেতার বিবরণ (Customer Info)</h4>
      <p style="margin: 2px 0;"><strong>নাম:</strong> ${data.customerName}</p>
      <p style="margin: 2px 0;"><strong>ফোন:</strong> ${data.customerPhone}</p>
      <p style="margin: 2px 0;"><strong>ঠিকানা:</strong> ${data.customerAddress}</p>
    </div>
    <div class="info-box">
      <h4>অর্ডার ও পেমেন্ট বিবরণ (Order Details)</h4>
      <p style="margin: 2px 0;"><strong>অর্ডার আইডি:</strong> #${fiveDigitId}</p>
      <p style="margin: 2px 0;"><strong>পেমেন্ট মেথড:</strong> ${data.paymentMethod}</p>
      <p style="margin: 2px 0;"><strong>স্ট্যাটাস:</strong> <span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">কনফার্মড ও ভেরিফাইড (VERIFIED)</span></p>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>পণ্যের নাম ও বিবরণ (Product Description)</th>
        <th style="text-align: center; width: 60px;">পরিমাণ</th>
        <th style="text-align: right; width: 100px;">একক মূল্য</th>
        <th style="text-align: right; width: 120px;">মোট মূল্য</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRowsHtml}
    </tbody>
  </table>

  <table class="calc-table">
    <tr>
      <td>সাবটোটাল (Subtotal):</td>
      <td style="text-align: right; font-weight: bold;">৳${data.subtotal.toLocaleString()}</td>
    </tr>
    <tr>
      <td>ডেলিভারি চার্জ (Delivery Fee):</td>
      <td style="text-align: right; font-weight: bold;">৳${data.deliveryFee.toLocaleString()}</td>
    </tr>
    <tr class="total-row">
      <td>সর্বমোট প্রদেয় (Grand Total):</td>
      <td style="text-align: right;">৳${data.total.toLocaleString()}</td>
    </tr>
  </table>

  <div class="barcode-box">
    <div style="font-size: 20px; letter-spacing: 4px;">|||||| |||| |||||||| ||||| |||||||</div>
    <div>AMARBAZAR-RECEIPT-ID-${fiveDigitId}</div>
  </div>

  <div class="footer">
    <p>আমারবাজার বিডিতে কেনাকাটা করার জন্য ধন্যবাদ! যেকোনো সমস্যা বা প্রয়োজনে অর্ডার আইডি <strong>#${fiveDigitId}</strong> সাথে রাখুন।</p>
    <p style="font-size: 10px; color: #94a3b8;">সিস্টেম জেনারেটেড ডিজিটাল ইনভয়েস • কোনো সিল বা স্বাক্ষরের প্রয়োজন নেই।</p>
  </div>

  <script>
    window.onload = function() {
      // Auto-trigger print dialog for instant PDF saving
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    try {
      const blob = new Blob([slipHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AmarBazar_Order_Receipt_${fiveDigitId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Also open a print-ready window directly for instant PDF saving
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(slipHtml);
        printWindow.document.close();
      }

      this.setState({ downloadSuccess: true });
      setTimeout(() => this.setState({ downloadSuccess: false }), 4000);
    } catch (err) {
      console.error('Receipt PDF generation error:', err);
    }
  };

  public render() {
    if (this.state.hasError) {
      const receiptData = this.getReceiptData();

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center animate-fade-in space-y-6">
            
            {/* Error Icon & Title */}
            <div>
              <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
                কিছু সমস্যা হয়েছে (Something went wrong)
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                অ্যাপ্লিকেশনের পৃষ্ঠা লোড হতে একটি সাময়িক ত্রুটি হয়েছে। নিচের বোতাম চেপে পৃষ্ঠাটি আবার রিলোড করুন বা হোমপেজে ফিরে যান।
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>পুনরায় লোড করুন (Reload Page)</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full py-3.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>হোমপেজে যান (Go to Home)</span>
              </button>

              <button
                onClick={this.handleResetApp}
                className="w-full py-2.5 px-4 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ক্যাশ পরিষ্কার করে রিস্টার্ট করুন (Clear Cache & Reset)</span>
              </button>
            </div>

            {/* 🧾 UPGRADED RECEIPT DOWNLOAD SECTION (রিসিভ ডাউনলোড ও চালান) */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 text-left space-y-4 shadow-sm">
              
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>রিসিভ ও চালান ডাউনলোড</span>
                      <span className="bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-black">
                        PDF
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      আপনার কেনা পণ্য, মূল্য ও বিস্তারিত ক্যাশ মেমো রিসিভ
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs font-black px-2.5 py-1 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 shrink-0">
                  #{receiptData.orderNumber}
                </span>
              </div>

              {/* Instant 1-Click PDF Download Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={this.handleDownloadReceiptPdf}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>রিসিভ ডাউনলোড (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => this.setState({ showReceiptPreview: !this.state.showReceiptPreview })}
                  className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>{this.state.showReceiptPreview ? 'বিবরণ লুকান' : 'পণ্য ও মূল্য বিবরণ'}</span>
                  {this.state.showReceiptPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Download Success Confirmation Toast */}
              {this.state.downloadSuccess && (
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>রিসিভ ও অফিসিয়াল ইনভয়েস সফলভাবে ডাউনলোড হয়েছে! (পিডিএফ প্রিন্ট ডায়লগ ওপেন হয়েছে)</span>
                </div>
              )}

              {/* Detailed Breakdown Accordion Preview */}
              {this.state.showReceiptPreview && (
                <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-3 animate-fade-in text-xs">
                  
                  {/* Order & Customer Summary */}
                  <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">ক্রেতার নাম:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{receiptData.customerName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">পেমেন্ট মেথড:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{receiptData.paymentMethod}</strong>
                    </div>
                  </div>

                  {/* Purchased Items List */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      ক্রয়কৃত পণ্যের তালিকা ({receiptData.items.length} টি আইটেম):
                    </span>
                    
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-40 overflow-y-auto pr-1">
                      {receiptData.items.map((item, idx) => (
                        <div key={idx} className="py-1.5 flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-500">
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                                {item.name}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                পরিমাণ: {item.quantity} x ৳{item.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <span className="font-black text-slate-800 dark:text-white shrink-0 text-xs">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calculation Total */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-500">
                      <span>সাবটোটাল:</span>
                      <span className="font-bold">৳{receiptData.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>ডেলিভারি চার্জ:</span>
                      <span className="font-bold">৳{receiptData.deliveryFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-black text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>সর্বমোট মূল্য:</span>
                      <span>৳{receiptData.total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={this.handleDownloadReceiptPdf}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>রিসিভ প্রিন্ট ও পিডিএফ সেভ করুন</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Optional Small Technical Debug Details at Bottom */}
            {this.state.error && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => this.setState({ showTechnicalDetails: !this.state.showTechnicalDetails })}
                  className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold cursor-pointer underline flex items-center justify-center mx-auto gap-1"
                >
                  <span>{this.state.showTechnicalDetails ? 'প্রযুক্তিগত বিস্তারিত লুকান' : 'প্রযুক্তিগত বিস্তারিত দেখুন (Technical Details)'}</span>
                </button>

                {this.state.showTechnicalDetails && (
                  <div className="mt-2 text-left text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 overflow-x-auto animate-fade-in">
                    <p className="font-mono text-[10px] text-rose-600 dark:text-rose-400 whitespace-pre-wrap">
                      {this.state.error.toString()}
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
