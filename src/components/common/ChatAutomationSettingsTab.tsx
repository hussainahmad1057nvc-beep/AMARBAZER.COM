import React, { useState, useEffect } from 'react';
import { 
  Bot, Sparkles, MessageSquare, Plus, Trash2, Edit2, Check, 
  Save, AlertCircle, RefreshCw, Smartphone, Zap, ShieldCheck, 
  HelpCircle, Eye, Power, CheckCircle2, Sliders, MessageCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  chatAutomationService, 
  ChatAutomationConfig, 
  QuickReplyOption, 
  KeywordTrigger 
} from '../../services/chatAutomationService';

interface ChatAutomationSettingsTabProps {
  customUserId?: string;
  customRole?: 'admin' | 'seller' | 'customer';
  onBack?: () => void;
}

export const ChatAutomationSettingsTab: React.FC<ChatAutomationSettingsTabProps> = ({
  customUserId,
  customRole,
  onBack
}) => {
  const { currentUser, language } = useApp();
  const effectiveUserId = customUserId || currentUser?.id || 'usr-seller-1';
  const effectiveRole = customRole || currentUser?.role || 'seller';

  const [config, setConfig] = useState<ChatAutomationConfig>(() => {
    return chatAutomationService.getConfig(effectiveUserId, effectiveRole as any);
  });

  const [isSavedToast, setIsSavedToast] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'welcome' | 'quick_faqs' | 'keywords' | 'test'>('quick_faqs');

  // New FAQ form state
  const [newQuestionBn, setNewQuestionBn] = useState('');
  const [newQuestionEn, setNewQuestionEn] = useState('');
  const [newAnswerBn, setNewAnswerBn] = useState('');
  const [newAnswerEn, setNewAnswerEn] = useState('');
  const [newCategory, setNewCategory] = useState<QuickReplyOption['category']>('general');
  const [showAddFaqForm, setShowAddFaqForm] = useState(false);

  // New Keyword form state
  const [newKeywordsInput, setNewKeywordsInput] = useState('');
  const [newKeywordResponseBn, setNewKeywordResponseBn] = useState('');
  const [newKeywordResponseEn, setNewKeywordResponseEn] = useState('');
  const [showAddKeywordForm, setShowAddKeywordForm] = useState(false);

  // Live Test simulator state
  const [testInput, setTestInput] = useState('');
  const [testMessages, setTestMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: language === 'bn' ? config.welcomeMessageBn : config.welcomeMessage,
      time: 'Just now'
    }
  ]);

  // Sync if userId changes
  useEffect(() => {
    const loaded = chatAutomationService.getConfig(effectiveUserId, effectiveRole as any);
    setConfig(loaded);
  }, [effectiveUserId, effectiveRole]);

  const handleSaveAll = () => {
    chatAutomationService.saveConfig(config);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const handleAddFaq = () => {
    if (!newQuestionBn.trim() || !newAnswerBn.trim()) return;
    const newOpt: QuickReplyOption = {
      id: `opt-${Date.now()}`,
      question: newQuestionEn.trim() || newQuestionBn.trim(),
      questionBn: newQuestionBn.trim(),
      answer: newAnswerEn.trim() || newAnswerBn.trim(),
      answerBn: newAnswerBn.trim(),
      category: newCategory
    };

    const updated = {
      ...config,
      quickOptions: [...config.quickOptions, newOpt]
    };
    setConfig(updated);
    chatAutomationService.saveConfig(updated);

    setNewQuestionBn('');
    setNewQuestionEn('');
    setNewAnswerBn('');
    setNewAnswerEn('');
    setShowAddFaqForm(false);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  const handleDeleteFaq = (id: string) => {
    const updated = {
      ...config,
      quickOptions: config.quickOptions.filter(o => o.id !== id)
    };
    setConfig(updated);
    chatAutomationService.saveConfig(updated);
  };

  const handleAddKeyword = () => {
    if (!newKeywordsInput.trim() || !newKeywordResponseBn.trim()) return;
    const kws = newKeywordsInput.split(',').map(k => k.trim()).filter(Boolean);
    const newTrig: KeywordTrigger = {
      id: `kw-${Date.now()}`,
      keywords: kws,
      response: newKeywordResponseEn.trim() || newKeywordResponseBn.trim(),
      responseBn: newKeywordResponseBn.trim()
    };

    const updated = {
      ...config,
      keywordTriggers: [...config.keywordTriggers, newTrig]
    };
    setConfig(updated);
    chatAutomationService.saveConfig(updated);

    setNewKeywordsInput('');
    setNewKeywordResponseBn('');
    setNewKeywordResponseEn('');
    setShowAddKeywordForm(false);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  const handleDeleteKeyword = (id: string) => {
    const updated = {
      ...config,
      keywordTriggers: config.keywordTriggers.filter(k => k.id !== id)
    };
    setConfig(updated);
    chatAutomationService.saveConfig(updated);
  };

  const handleTestSend = (userMsg?: string) => {
    const text = userMsg || testInput.trim();
    if (!text) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newHistory = [...testMessages, { sender: 'user' as const, text, time: timeNow }];
    setTestMessages(newHistory);
    setTestInput('');

    // Simulate instant bot resolution
    setTimeout(() => {
      const botAnswer = chatAutomationService.findAutomatedAnswer(
        text,
        config.userId,
        config.role,
        language as 'en' | 'bn'
      );

      const fallback = language === 'bn'
        ? `ধন্যবাদ আপনার মেসেজের জন্য। বিক্রেতা শীঘ্রই আপনার সাথে সরাসরি যোগাযোগ করবেন।`
        : `Thank you for reaching out. The seller will connect with you live shortly.`;

      setTestMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: botAnswer || fallback,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Header Banner */}
      <div className="p-5 bg-linear-to-r from-emerald-600 to-teal-700 rounded-3xl text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black">
            <Bot className="w-4 h-4 text-yellow-300 animate-bounce" />
            <span>{language === 'bn' ? 'মেসেঞ্জার ও হোয়াটসঅ্যাপ স্টাইল অটোমেশন বট' : 'Smart Chat Automation Bot'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            {language === 'bn' ? 'চ্যাট অটো-রিপ্লাই ও কুইক এফএকিউ ব্যাকএন্ড' : 'Chat Automation & Auto-Reply Backend'}
          </h2>
          <p className="text-xs text-white/90 max-w-xl">
            {language === 'bn'
              ? 'গ্রাহক যখন চ্যাট শুরু করবে তখন আপনার সেট করা প্রশ্ন ও উত্তর স্বয়ংক্রিয়ভাবে দেখাবে এবং কি-ওয়ার্ড মিললে সাথে সাথে উত্তর দেবে।'
              : 'Configure welcome messages, automated FAQ option buttons, and keyword triggers for instant 24/7 replies.'}
          </p>
        </div>

        {/* Global Toggle & Save */}
        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => {
              const updated = { ...config, isAutoReplyEnabled: !config.isAutoReplyEnabled };
              setConfig(updated);
              chatAutomationService.saveConfig(updated);
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-md ${
              config.isAutoReplyEnabled 
                ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{config.isAutoReplyEnabled ? (language === 'bn' ? 'অটোমেশন সক্রিয়' : 'Bot Active') : (language === 'bn' ? 'অটোমেশন বন্ধ' : 'Bot Inactive')}</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'bn' ? 'সব সংরক্ষণ করুন' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('quick_faqs')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'quick_faqs'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '১. কুইক বাটন ও এফএকিউ (FAQ)' : '1. Quick FAQ Buttons'} ({config.quickOptions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('keywords')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'keywords'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '২. কি-ওয়ার্ড অটো-রিপ্লাই' : '2. Keyword Triggers'} ({config.keywordTriggers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('welcome')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'welcome'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '৩. স্বাগত ও অফলাইন বার্তা' : '3. Welcome & Away Message'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('test')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'test'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '৪. লাইভ বট সিমুলেটর' : '4. Test Bot Live'}</span>
        </button>
      </div>

      {/* SUB-TAB 1: QUICK FAQS & BUTTONS */}
      {activeSubTab === 'quick_faqs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {language === 'bn' ? 'চ্যাটে প্রদর্শিত কুইক অ্যাকশন বাটনসমূহ' : 'Quick Action FAQ Buttons in Chat'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? 'গ্রাহক চ্যাট ওপেন করলে এই প্রশ্নগুলো বাটনের মতো সামনে আসবে। ক্লিকে স্বয়ংক্রিয় উত্তর চলে যাবে।'
                  : 'These appear as interactive chips when a customer opens chat. Clicking triggers the instant answer.'}
              </p>
            </div>

            <button
              onClick={() => setShowAddFaqForm(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন প্রশ্ন যোগ করুন' : 'Add New FAQ'}</span>
            </button>
          </div>

          {/* Add FAQ Form Modal/Box */}
          {showAddFaqForm && (
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border-2 border-emerald-500/40 space-y-3">
              <h4 className="font-black text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {language === 'bn' ? 'নতুন অটোমেটেড প্রশ্ন ও উত্তর ফরম' : 'Add New Automated FAQ Option'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'প্রশ্ন (বাংলায়) *' : 'Question (Bangla) *'}
                  </label>
                  <input
                    type="text"
                    value={newQuestionBn}
                    onChange={(e) => setNewQuestionBn(e.target.value)}
                    placeholder="যেমন: ডেলিভারি সময় কত লাগবে?"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'প্রশ্ন (ইংরেজিতে)' : 'Question (English)'}
                  </label>
                  <input
                    type="text"
                    value={newQuestionEn}
                    onChange={(e) => setNewQuestionEn(e.target.value)}
                    placeholder="e.g. What is the delivery timeframe?"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'স্বয়ংক্রিয় উত্তর (বাংলায়) *' : 'Automated Answer (Bangla) *'}
                  </label>
                  <textarea
                    rows={2}
                    value={newAnswerBn}
                    onChange={(e) => setNewAnswerBn(e.target.value)}
                    placeholder="যেমন: ঢাকার ভেতরে ২৪ ঘণ্টা এবং বাইরে ৪৮ ঘণ্টায় পৌঁছে দেওয়া হয়।"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'স্বয়ংক্রিয় উত্তর (ইংরেজিতে)' : 'Automated Answer (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={newAnswerEn}
                    onChange={(e) => setNewAnswerEn(e.target.value)}
                    placeholder="e.g. Inside Dhaka takes 24 hrs, outside takes 48 hrs."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddFaqForm(false)}
                  className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  onClick={handleAddFaq}
                  disabled={!newQuestionBn.trim() || !newAnswerBn.trim()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs disabled:opacity-50"
                >
                  {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save FAQ'}
                </button>
              </div>
            </div>
          )}

          {/* List of FAQs */}
          <div className="grid grid-cols-1 gap-3">
            {config.quickOptions.map((opt, idx) => (
              <div
                key={opt.id}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {opt.questionBn}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl mt-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{language === 'bn' ? 'উত্তর: ' : 'Answer: '}</span>
                    {opt.answerBn}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteFaq(opt.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer shrink-0"
                  title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: KEYWORD TRIGGERS */}
      {activeSubTab === 'keywords' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {language === 'bn' ? 'কি-ওয়ার্ড ম্যাচিং ও অটোমেটিক উত্তর' : 'Keyword Matching & Automatic Responses'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? 'গ্রাহকের মেসেজে নির্দিষ্ট কি-ওয়ার্ড থাকলে বট সরাসরি সঠিক উত্তর প্রদান করবে।'
                  : 'When a customer types these keywords, the bot responds with the pre-configured reply immediately.'}
              </p>
            </div>

            <button
              onClick={() => setShowAddKeywordForm(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন কি-ওয়ার্ড রুল' : 'Add Keyword Rule'}</span>
            </button>
          </div>

          {/* Add Keyword Form */}
          {showAddKeywordForm && (
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border-2 border-emerald-500/40 space-y-3">
              <h4 className="font-black text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {language === 'bn' ? 'নতুন কি-ওয়ার্ড রুল ফরম' : 'Add New Keyword Trigger Rule'}
              </h4>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  {language === 'bn' ? 'কি-ওয়ার্ডসমূহ (কমা দিয়ে আলাদা করুন) *' : 'Keywords (Comma separated) *'}
                </label>
                <input
                  type="text"
                  value={newKeywordsInput}
                  onChange={(e) => setNewKeywordsInput(e.target.value)}
                  placeholder="যেমন: দাম, price, koto, কত টাকা"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'স্বয়ংক্রিয় উত্তর (বাংলা) *' : 'Automated Response (Bangla) *'}
                  </label>
                  <textarea
                    rows={2}
                    value={newKeywordResponseBn}
                    onChange={(e) => setNewKeywordResponseBn(e.target.value)}
                    placeholder="কি-ওয়ার্ড পেলে যে উত্তরটি কাস্টমারকে দেওয়া হবে"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'স্বয়ংক্রিয় উত্তর (ইংরেজি)' : 'Automated Response (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={newKeywordResponseEn}
                    onChange={(e) => setNewKeywordResponseEn(e.target.value)}
                    placeholder="English response for the keyword"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddKeywordForm(false)}
                  className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  onClick={handleAddKeyword}
                  disabled={!newKeywordsInput.trim() || !newKeywordResponseBn.trim()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs disabled:opacity-50"
                >
                  {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Rule'}
                </button>
              </div>
            </div>
          )}

          {/* List of Keyword rules */}
          <div className="grid grid-cols-1 gap-3">
            {config.keywordTriggers.map((trig) => (
              <div
                key={trig.id}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-start justify-between gap-3"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    {trig.keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 rounded-lg text-[10px] font-black border border-teal-200 dark:border-teal-800/40">
                        #{kw}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl leading-relaxed">
                    <span className="font-bold text-teal-600 dark:text-teal-400">{language === 'bn' ? 'উত্তর: ' : 'Response: '}</span>
                    {trig.responseBn}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteKeyword(trig.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer shrink-0"
                  title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WELCOME & AWAY MESSAGE */}
      {activeSubTab === 'welcome' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {language === 'bn' ? 'স্বাগত বার্তা (Welcome Greeting)' : 'Welcome Greeting Message'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? 'গ্রাহক যখন প্রথম আপনার সাথে চ্যাট উইন্ডো ওপেন করবে, তখন এই বার্তাটি স্বয়ংক্রিয়ভাবে পাঠানো হবে।'
                  : 'Sent automatically when a customer opens the conversation window.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  {language === 'bn' ? 'বাংলা স্বাগত বার্তা' : 'Bangla Welcome Message'}
                </label>
                <textarea
                  rows={3}
                  value={config.welcomeMessageBn}
                  onChange={(e) => setConfig({ ...config, welcomeMessageBn: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  {language === 'bn' ? 'ইংরেজি স্বাগত বার্তা' : 'English Welcome Message'}
                </label>
                <textarea
                  rows={3}
                  value={config.welcomeMessage}
                  onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {language === 'bn' ? 'অফলাইন / ব্যস্ততার বার্তা (Away Message)' : 'Away Message'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <textarea
                    rows={2}
                    value={config.awayMessageBn}
                    onChange={(e) => setConfig({ ...config, awayMessageBn: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    value={config.awayMessage}
                    onChange={(e) => setConfig({ ...config, awayMessage: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveAll}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{language === 'bn' ? 'বার্তা সংরক্ষণ করুন' : 'Save Greetings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: LIVE BOT SIMULATOR */}
      {activeSubTab === 'test' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col h-[420px]">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {language === 'bn' ? 'লাইভ অটোমেশন বট প্রিভিউ' : 'Live Bot Test Sandbox'}
                </span>
              </div>
              <button
                onClick={() => setTestMessages([{ sender: 'bot', text: language === 'bn' ? config.welcomeMessageBn : config.welcomeMessage, time: 'Just now' }])}
                className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
              </button>
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {testMessages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                  }`}>
                    {m.sender === 'bot' && (
                      <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">
                        <Bot className="w-3 h-3" />
                        <span>Smart Bot Auto-Reply</span>
                      </div>
                    )}
                    <p className="leading-relaxed">{m.text}</p>
                    <span className="text-[9px] opacity-70 block text-right mt-1">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive chips */}
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
              {config.quickOptions.slice(0, 3).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleTestSend(opt.questionBn)}
                  className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/40 transition cursor-pointer"
                >
                  {opt.questionBn}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div className="pt-2 flex gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTestSend()}
                placeholder={language === 'bn' ? 'যেকোনো মেসেজ বা কি-ওয়ার্ড লিখে টেস্ট করুন...' : 'Type a test message or keyword...'}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <button
                onClick={() => handleTestSend()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black"
              >
                {language === 'bn' ? 'পাঠান' : 'Send'}
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700/80 space-y-3 text-xs">
            <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              <span>{language === 'bn' ? 'কীভাবে কাজ করে?' : 'How It Works'}</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'bn'
                ? '১. আপনি যা কিছু এখানে লিখে রাখবেন, তা সেভ করার সাথে সাথে আপনার স্টোরের চ্যাট সিস্টেমে লাইভ যুক্ত হয়ে যাবে।'
                : '1. Anything you configure here immediately syncs with your live customer store chat.'}
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'bn'
                ? '২. কোনো কাস্টমার প্রশ্ন সিলেক্ট করলে বা মেসেজ দিলে বট ২ সেকেন্ডের মধ্যে ইনস্ট্যান্ট সঠিক উত্তর পাঠিয়ে দেয়।'
                : '2. When a customer taps an option or types a matching keyword, the bot answers within seconds.'}
            </p>
          </div>
        </div>
      )}

      {/* Saved Toast Alert */}
      {isSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-black animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          <span>{language === 'bn' ? 'চ্যাট অটোমেশন সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Chat automation settings saved successfully!'}</span>
        </div>
      )}

    </div>
  );
};
