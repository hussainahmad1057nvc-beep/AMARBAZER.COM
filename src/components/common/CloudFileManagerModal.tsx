import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  X, FolderOpen, Upload, Trash2, Eye, Download, Copy, Check, 
  FileText, Image as ImageIcon, Music, Database, HardDrive, 
  Search, Filter, ShieldCheck, AlertCircle, RefreshCw, Sparkles, 
  Flame, Zap, ArrowUpRight, Layers
} from 'lucide-react';
import { StorageFile } from '../../types';
import { storageManager, formatBytes } from '../../lib/storageManager';
import { FirebaseStorageUpgradeModal } from './FirebaseStorageUpgradeModal';

interface CloudFileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
  sellerId?: string;
  storeName?: string;
  planName?: string;
  totalCapacityGb?: number;
  onStorageUpdated?: () => void;
}

export const CloudFileManagerModal: React.FC<CloudFileManagerModalProps> = ({
  isOpen,
  onClose,
  language = 'bn',
  sellerId = 'sel-1',
  storeName = 'আমার বাজার শপ',
  planName = 'ফায়ারবেস লাইভ স্টোরেজ',
  totalCapacityGb: propTotalCapacityGb,
  onStorageUpdated
}) => {
  const [files, setFiles] = useState<StorageFile[]>(() => storageManager.getFiles(sellerId));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>('');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [currentLimitGb, setCurrentLimitGb] = useState<number>(() => 
    storageManager.getEffectiveStorageLimit(sellerId, undefined, propTotalCapacityGb)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync capacity when updated
  useEffect(() => {
    const handleQuotaUpdate = (e: any) => {
      if (e?.detail?.totalGb) {
        setCurrentLimitGb(e.detail.totalGb);
      }
    };
    window.addEventListener('amarbazar_storage_quota_updated', handleQuotaUpdate);
    return () => window.removeEventListener('amarbazar_storage_quota_updated', handleQuotaUpdate);
  }, []);

  // Update limit if prop changes
  useEffect(() => {
    if (propTotalCapacityGb && propTotalCapacityGb > 0) {
      setCurrentLimitGb(propTotalCapacityGb);
    }
  }, [propTotalCapacityGb]);

  // Recalculate stats live (including Firestore database memory)
  const stats = useMemo(() => {
    return storageManager.calculateStats(files, currentLimitGb, sellerId);
  }, [files, currentLimitGb, sellerId]);

  // Filter files
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchCat = selectedCategory === 'all' || file.category === selectedCategory;
      const matchSearch = !searchQuery || 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (file.associatedWith && file.associatedWith.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [files, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFileList = e.target.files;
    if (!uploadedFileList || uploadedFileList.length === 0) return;

    setIsUploading(true);
    const file = uploadedFileList[0];

    // Determine category
    let category: StorageFile['category'] = 'data';
    if (file.type.startsWith('image/')) category = 'image';
    else if (file.type === 'application/pdf') category = 'pdf';
    else if (file.type.startsWith('audio/')) category = 'audio';
    else if (file.type.includes('word') || file.type.includes('text') || file.type.includes('document')) category = 'document';

    // Create file reader
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string || '#';
      
      storageManager.addFile({
        name: file.name,
        url: dataUrl,
        sizeBytes: file.size,
        category,
        mimeType: file.type || 'application/octet-stream',
        associatedWith: `Manual Upload (${new Date().toLocaleDateString()})`,
        sellerId
      });

      const updated = storageManager.getFiles(sellerId);
      setFiles(updated);
      setIsUploading(false);
      setUploadSuccessMsg(language === 'bn' ? `"${file.name}" সফলভাবে ফায়ারবেসে আপলোড হয়েছে!` : `"${file.name}" uploaded to Firebase successfully!`);
      if (onStorageUpdated) onStorageUpdated();

      setTimeout(() => setUploadSuccessMsg(''), 4000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteFile = (id: string, fileName: string) => {
    const confirmMsg = language === 'bn' 
      ? `আপনি কি নিশ্চিত যে "${fileName}" ফাইলটি ফায়ারবেস ক্লাউড থেকে স্থায়ীভাবে ডিলিট করতে চান? এতে স্টোরেজ স্পেস খালি হবে।`
      : `Are you sure you want to delete "${fileName}"? This will free up storage space.`;
    
    if (window.confirm(confirmMsg)) {
      const updated = storageManager.deleteFile(id);
      setFiles(updated);
      if (previewFile?.id === id) setPreviewFile(null);
      if (onStorageUpdated) onStorageUpdated();
      setUploadSuccessMsg(language === 'bn' ? `"${fileName}" ডিলিট করা হয়েছে এবং মেমোরি খালি হয়েছে।` : `"${fileName}" deleted successfully.`);
      setTimeout(() => setUploadSuccessMsg(''), 4000);
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePlanUpgraded = (newCapacityGb: number) => {
    setCurrentLimitGb(newCapacityGb);
    if (onStorageUpdated) onStorageUpdated();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-blue-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'audio':
        return <Music className="w-4 h-4 text-amber-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <Database className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 text-xs">
        
        {/* TOP HEADER BAR */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-950/80 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                  {language === 'bn' ? 'ফায়ারবেস স্টোরেজ ও ফাইল ম্যানেজার' : 'Firebase Storage & Database Manager'}
                </h3>
                <span className="inline-flex items-center space-x-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full text-[9.5px] font-black border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Firebase Live Cloud</span>
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                {storeName} • <span className="font-semibold text-amber-600 dark:text-amber-400">{currentLimitGb} GB Allocated</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-[10.5px] flex items-center space-x-1 transition cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'মেমোরি কিনুন' : 'Buy Storage'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NOTIFICATION MESSAGE */}
        {uploadSuccessMsg && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </div>
            <button onClick={() => setUploadSuccessMsg('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* CAPACITY AND REAL-TIME METER CARD */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider">
                    {language === 'bn' ? 'ফায়ারবেস লাইভ স্টোরেজ মিটার' : 'Live Firebase Storage Meter'}
                  </span>
                </div>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                    {stats.formattedUsed}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    / {stats.formattedTotal} ({stats.percentage}% {language === 'bn' ? 'ব্যবহৃত' : 'used'})
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,application/pdf,audio/*,.doc,.docx,.json,.txt"
                />
                
                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-amber-400 font-bold rounded-xl transition flex items-center space-x-1.5 border border-amber-500/30 cursor-pointer text-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'স্টোরেজ বৃদ্ধি করুন' : 'Upgrade Quota'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition flex items-center space-x-1.5 shadow-md cursor-pointer disabled:opacity-50 text-xs"
                >
                  <Upload className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
                  <span>
                    {isUploading 
                      ? (language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...')
                      : (language === 'bn' ? '+ ফাইল আপলোড' : '+ Upload File')
                    }
                  </span>
                </button>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="mt-4 space-y-1.5">
              <div className="w-full bg-slate-800/90 rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-700/60">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    stats.percentage >= 85 
                      ? 'bg-gradient-to-r from-rose-500 to-amber-500' 
                      : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(2, stats.percentage))}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10.5px] text-slate-400 font-semibold px-0.5">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                  <span>{language === 'bn' ? 'ব্যবহৃত:' : 'Used:'} <strong className="text-slate-200 font-mono">{stats.formattedUsed}</strong></span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                  <span>{language === 'bn' ? 'ফাঁকা রয়েছে:' : 'Free Space:'} <strong className="text-slate-200 font-mono">{stats.formattedFree}</strong></span>
                </span>
              </div>
            </div>

            {/* MINI STATS TILES (INCLUDING FIRESTORE DB) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-[10.5px]">
              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block">{language === 'bn' ? 'ফায়ারস্টোর ডাটাবেজ:' : 'Firestore DB:'}</span>
                <span className="font-extrabold text-emerald-400 font-mono">
                  {stats.breakdown.firestore.formattedSize}
                </span>
              </div>
              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block">{language === 'bn' ? 'পণ্য ও ব্যানার ছবি:' : 'Images:'}</span>
                <span className="font-extrabold text-blue-400 font-mono">
                  {stats.breakdown.image.formattedSize} ({stats.breakdown.image.count})
                </span>
              </div>
              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block">{language === 'bn' ? 'পিডিএফ ও চালান:' : 'PDFs & Memos:'}</span>
                <span className="font-extrabold text-rose-400 font-mono">
                  {stats.breakdown.pdf.formattedSize} ({stats.breakdown.pdf.count})
                </span>
              </div>
              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block">{language === 'bn' ? 'ভয়েস ও অডিও নোট:' : 'Chat Audio:'}</span>
                <span className="font-extrabold text-amber-400 font-mono">
                  {stats.breakdown.audio.formattedSize} ({stats.breakdown.audio.count})
                </span>
              </div>
            </div>
          </div>

          {/* CONTROLS: CATEGORY TABS & SEARCH */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
            {/* Category Filter Chips */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'all', label: language === 'bn' ? 'সব ফাইল' : 'All Files', count: files.length },
                { id: 'firestore_db', label: language === 'bn' ? '🔥 ফায়ারস্টোর ডাটা' : '🔥 Firestore DB', count: stats.firestoreDb.collections.length },
                { id: 'image', label: language === 'bn' ? 'ছবি ও ব্যানার' : 'Images', count: stats.breakdown.image.count },
                { id: 'pdf', label: language === 'bn' ? 'পিডিএফ ও ইনভয়েস' : 'PDF & Docs', count: stats.breakdown.pdf.count },
                { id: 'audio', label: language === 'bn' ? 'অডিও ও ভয়েস' : 'Voice/Audio', count: stats.breakdown.audio.count },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 whitespace-nowrap text-[11px] cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                    selectedCategory === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative shrink-0 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'bn' ? 'ফাইল খুঁজুন...' : 'Search files...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* FIRESTORE LIVE DB SECTION VIEW */}
          {selectedCategory === 'firestore_db' ? (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div className="p-3 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 rounded-2xl flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-bold text-amber-700 dark:text-amber-300">
                    {language === 'bn' 
                      ? `ফায়ারস্টোর ডাটাবেজ মোট সাইজ: ${stats.firestoreDb.formattedSize}`
                      : `Firestore Database Total Size: ${stats.firestoreDb.formattedSize}`
                    }
                  </span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                  Real-time NoSQL Sync
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {stats.firestoreDb.collections.map(col => (
                  <div 
                    key={col.name}
                    className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
                          {language === 'bn' ? col.nameBn : col.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {col.count} {language === 'bn' ? 'টি আইটেম / রেকর্ড' : 'documents'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black font-mono text-xs text-amber-600 dark:text-amber-400 block">
                        {col.formattedSize}
                      </span>
                      <span className="text-[9px] text-emerald-500 font-bold">
                        ● Live Sync
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* FILES LIST / GRID */
            filteredFiles.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50/50 dark:bg-slate-850/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                    {language === 'bn' ? 'কোনো ফাইল পাওয়া যায়নি' : 'No files found'}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {searchQuery 
                      ? (language === 'bn' ? 'আপনার সার্চ অনুযায়ী কোনো ফাইল নেই।' : 'No files match your query.')
                      : (language === 'bn' ? 'ফায়ারবেস স্টোরেজ খালি রয়েছে। নতুন ছবি বা ফাইল আপলোড করতে উপরের বাটনে ক্লিক করুন।' : 'Storage is empty. Upload images or PDFs to see them here.')
                    }
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-black rounded-xl hover:bg-amber-600 transition inline-flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ফাইল আপলোড করুন' : 'Upload File'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-amber-500/40 hover:shadow-xs transition group"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-center space-x-3 truncate min-w-0">
                      {/* Thumbnail / Icon */}
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
                        {file.category === 'image' && file.url && file.url !== '#' ? (
                          <img 
                            src={file.url} 
                            alt={file.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          getCategoryIcon(file.category)
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="truncate min-w-0">
                        <p className="font-extrabold text-slate-800 dark:text-slate-100 truncate text-[11.5px]" title={file.name}>
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5 truncate">
                          <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-xs">
                            {file.formattedSize}
                          </span>
                          <span>•</span>
                          <span className="truncate">{file.uploadedAt}</span>
                        </div>
                        {file.associatedWith && (
                          <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5" title={file.associatedWith}>
                            📁 {file.associatedWith}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-1 shrink-0">
                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        title={language === 'bn' ? 'ফাইল দেখুন' : 'Preview'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Copy Link Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyLink(file.url, file.id)}
                        title={language === 'bn' ? 'লিংক কপি করুন' : 'Copy Link'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition cursor-pointer"
                      >
                        {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        title={language === 'bn' ? 'ডিলিট করুন' : 'Delete'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

        </div>

        {/* BOTTOM FOOTER BAR */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 flex items-center justify-between text-slate-500 text-[11px] shrink-0">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {language === 'bn' 
                ? 'গুগল ফায়ারবেস ক্লাউড স্টোরেজ ও নো-এসকিউএল ডাটাবেজ সম্পূর্ণ এনক্রিপ্টেড এবং নিরাপদ'
                : 'Google Firebase Cloud Storage & Firestore NoSQL DB is fully encrypted & secure'
              }
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-extrabold rounded-xl transition cursor-pointer flex items-center space-x-1"
            >
              <Zap className="w-3 h-3" />
              <span>{language === 'bn' ? 'মেমোরি আপগ্রেড' : 'Upgrade Storage'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>

      </div>

      {/* FULL-SIZE PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-4 space-y-3 shadow-2xl border border-slate-700 overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="truncate">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 truncate">{previewFile.name}</h4>
                <p className="text-[10px] text-slate-400">{previewFile.formattedSize} • {previewFile.mimeType}</p>
              </div>
              <button 
                onClick={() => setPreviewFile(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-slate-950 rounded-2xl p-2 min-h-[220px]">
              {previewFile.category === 'image' ? (
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name} 
                  className="max-h-[55vh] object-contain rounded-xl shadow"
                  referrerPolicy="no-referrer"
                />
              ) : previewFile.category === 'audio' ? (
                <div className="w-full max-w-md p-4 text-center space-y-3">
                  <Music className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
                  <p className="text-white font-bold">{previewFile.name}</p>
                  <audio controls className="w-full">
                    <source src={previewFile.url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : (
                <div className="text-center p-8 space-y-3 text-slate-300">
                  <FileText className="w-14 h-14 text-rose-500 mx-auto" />
                  <p className="font-bold">{previewFile.name}</p>
                  <p className="text-xs text-slate-400">
                    {language === 'bn' ? 'ডকুমেন্ট / ফায়ারবেস প্রিভিউ' : 'Document / Firebase File Preview'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => handleDeleteFile(previewFile.id, previewFile.name)}
                className="px-3 py-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 font-bold rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ডিলিট করুন' : 'Delete'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(previewFile.url, previewFile.id)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition flex items-center space-x-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === previewFile.id ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'লিংক কপি' : 'Copy Link')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition cursor-pointer"
                >
                  {language === 'bn' ? 'ঠিক আছে' : 'Done'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPGRADE MODAL */}
      <FirebaseStorageUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        language={language}
        sellerId={sellerId}
        storeName={storeName}
        currentCapacityGb={currentLimitGb}
        onPlanUpgraded={handlePlanUpgraded}
      />
    </div>
  );
};
