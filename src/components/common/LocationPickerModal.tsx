import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, Plus, CheckCircle2, Home, Briefcase, 
  Trash2, Edit3, ChevronRight, Truck, AlertCircle, 
  ArrowLeft, Search, Building2, Phone, User as UserIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Address } from '../../types';
import { 
  addressService, 
  BD_DIVISIONS, 
  BD_DISTRICTS, 
  BD_POPULAR_AREAS 
} from '../../services/addressService';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    setCurrentUser, 
    language,
    deliveryLocation,
    setDeliveryLocation,
    selectedDeliveryAddress,
    setSelectedDeliveryAddress,
    savedAddresses,
    addSavedAddress,
    updateSavedAddress,
    deleteSavedAddress,
    setDefaultDeliveryAddress
  } = useApp();

  const [mode, setMode] = useState<'select' | 'add' | 'edit'>('select');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Address Form States
  const [title, setTitle] = useState<'Home' | 'Office' | 'Other'>('Home');
  const [customTitle, setCustomTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('Dhanmondi');
  const [fullAddress, setFullAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [formError, setFormError] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [pincodeInput, setPincodeInput] = useState('');

  // Pre-fill form when opening or editing
  useEffect(() => {
    if (!isOpen) {
      setMode('select');
      setFormError('');
      return;
    }
  }, [isOpen]);

  // Update district when division changes
  useEffect(() => {
    const districts = BD_DISTRICTS[division] || [];
    if (!districts.includes(district)) {
      setDistrict(districts[0] || 'Dhaka');
    }
  }, [division]);

  // Update popular thana/area when district changes
  useEffect(() => {
    const areas = BD_POPULAR_AREAS[district] || [];
    if (areas.length > 0 && !areas.includes(thana)) {
      setThana(areas[0]);
    }
  }, [district]);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setTitle('Home');
    setCustomTitle('');
    setRecipientName(currentUser?.name || '');
    setPhone(currentUser?.phone || '');
    setDivision('Dhaka');
    setDistrict('Dhaka');
    setThana('Dhanmondi');
    setFullAddress('');
    setIsDefault(savedAddresses.length === 0);
    setDeliveryNote('');
    setFormError('');
    setMode('add');
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddressId(addr.id);
    if (addr.title === 'Home' || addr.title === 'Office' || addr.title === 'Other') {
      setTitle(addr.title as any);
      setCustomTitle('');
    } else {
      setTitle('Other');
      setCustomTitle(addr.title);
    }
    setRecipientName(addr.recipientName);
    setPhone(addr.phone);
    setDivision(addr.division);
    setDistrict(addr.district);
    setThana(addr.thana);
    setFullAddress(addr.fullAddress);
    setIsDefault(addr.isDefault);
    setDeliveryNote('');
    setFormError('');
    setMode('edit');
  };

  const handleSelectAddress = (addr: Address) => {
    setSelectedDeliveryAddress(addr);
    const locLabel = `${addr.thana || addr.district}, ${addr.division}`;
    setDeliveryLocation(locLabel);
    addressService.setActiveDeliveryLocation(locLabel, addr);
    onClose();
  };

  const handleSelectCityDirect = (cityName: string) => {
    setDeliveryLocation(cityName);
    setSelectedDeliveryAddress(null);
    addressService.setActiveDeliveryLocation(cityName, null);
    onClose();
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      setFormError(language === 'bn' ? 'অনুগ্রহ করে প্রাপকের নাম লিখুন!' : 'Please enter recipient name');
      return;
    }
    if (!phone.trim() || phone.trim().length < 6) {
      setFormError(language === 'bn' ? 'অনুগ্রহ করে সঠিক মোবাইল নাম্বার লিখুন!' : 'Please enter a valid phone number');
      return;
    }
    if (!fullAddress.trim()) {
      setFormError(language === 'bn' ? 'অনুগ্রহ করে পূর্ণ ঠিকানা (বাড়ি/রোড/ফ্ল্যাট) লিখুন!' : 'Please enter full street address');
      return;
    }

    const finalTitle = title === 'Other' && customTitle.trim() ? customTitle.trim() : title;

    if (mode === 'add') {
      const newAddr = addSavedAddress({
        title: finalTitle,
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        division,
        district,
        thana: thana.trim() || district,
        fullAddress: fullAddress.trim(),
        isDefault
      });
      handleSelectAddress(newAddr);
    } else if (mode === 'edit' && editingAddressId) {
      const updatedAddr: Address = {
        id: editingAddressId,
        title: finalTitle,
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        division,
        district,
        thana: thana.trim() || district,
        fullAddress: fullAddress.trim(),
        isDefault
      };
      updateSavedAddress(updatedAddr);
      handleSelectAddress(updatedAddr);
    }
  };

  const currentDistricts = BD_DISTRICTS[division] || ['Dhaka'];
  const popularAreas = BD_POPULAR_AREAS[district] || [];

  const allDistricts = Object.values(BD_DISTRICTS).flat();
  const filteredQuickDistricts = searchDistrict.trim()
    ? allDistricts.filter(d => d.toLowerCase().includes(searchDistrict.toLowerCase()))
    : ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Gazipur', 'Narayanganj', "Cox's Bazar", 'Bogra', 'Comilla', 'Jessore'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 overflow-hidden">
        
        {/* Amazon-style Red/Dark Header */}
        <div className="bg-[#da1c24] text-white px-4 py-3.5 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center space-x-2">
            {mode !== 'select' ? (
              <button 
                onClick={() => setMode('select')}
                className="p-1 hover:bg-white/20 rounded-lg transition mr-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <MapPin className="w-5 h-5 text-yellow-300 shrink-0" />
            )}
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                {mode === 'add' 
                  ? (language === 'bn' ? 'নতুন ডেলিভারি লোকেশন যোগ করুন' : 'Add a New Delivery Address')
                  : mode === 'edit'
                  ? (language === 'bn' ? 'ডেলিভারি ঠিকানা সম্পাদনা করুন' : 'Edit Delivery Address')
                  : (language === 'bn' ? 'আপনার ডেলিভারি লোকেশন নির্বাচন করুন' : 'Choose Your Delivery Location')}
              </h3>
              {mode === 'select' && (
                <p className="text-[10px] text-white/80 leading-none mt-0.5">
                  {language === 'bn' ? 'পণ্য প্রাপ্যতা ও ডেলিভারি সময় দেখতে এলাকা বা ঠিকানা সিলেক্ট করুন' : 'Select a location to see accurate product stock & delivery speeds'}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-xl transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {mode === 'select' ? (
            <>
              {/* Active Current Location Badge */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block">
                      {language === 'bn' ? 'বর্তমান ডেলিভারি এলাকা' : 'Current Active Location'}
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white truncate block">
                      {deliveryLocation || 'Dhaka'}
                    </span>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shrink-0">
                  {language === 'bn' ? 'সক্রিয়' : 'ACTIVE'}
                </span>
              </div>

              {/* Saved Addresses (Amazon-style Radio List) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
                  <span>{language === 'bn' ? 'আপনার সংরক্ষিত ঠিকানাসমূহ' : 'Your Saved Addresses'} ({savedAddresses.length})</span>
                </div>

                {savedAddresses.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
                    <MapPin className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">
                      {language === 'bn' ? 'এখনো কোন ঠিকানা সংরক্ষণ করা নেই।' : 'No saved delivery addresses found.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedDeliveryAddress?.id === addr.id;
                      return (
                        <div 
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`p-3 rounded-xl border transition cursor-pointer relative flex items-start space-x-3 ${
                            isSelected 
                              ? 'border-[#da1c24] bg-red-50/60 dark:bg-red-950/30 ring-1 ring-[#da1c24]' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                          }`}
                        >
                          {/* Radio Icon */}
                          <div className="mt-0.5 shrink-0">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#da1c24] bg-[#da1c24]' : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>

                          {/* Address Details */}
                          <div className="flex-1 min-w-0 text-xs">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {addr.recipientName}
                              </span>
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                                {addr.title.toLowerCase().includes('office') || addr.title.toLowerCase().includes('work') ? (
                                  <Briefcase className="w-2.5 h-2.5" />
                                ) : (
                                  <Home className="w-2.5 h-2.5" />
                                )}
                                <span>{addr.title}</span>
                              </span>
                              {addr.isDefault && (
                                <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                              {addr.fullAddress}, {addr.thana}, {addr.district}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                              📞 {addr.phone}
                            </p>
                          </div>

                          {/* Edit / Delete Buttons */}
                          <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(addr)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                              title="Edit address"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteSavedAddress(addr.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                              title="Delete address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Primary Button: + Add an Address (Amazon-style) */}
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'bn' ? '+ নতুন ডেলিভারি ঠিকানা যোগ করুন' : '+ Add an Address / New Location'}</span>
                </button>
              </div>

              {/* Quick Area / City Selector */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{language === 'bn' ? 'দ্রুত শহর বা জেলা নির্বাচন করুন' : 'Or select city / district directly'}</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                    placeholder={language === 'bn' ? 'জেলা খুঁজুন (যেমন: ঢাকা, চট্টগ্রাম, সিলেট)...' : 'Search city or district...'}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                  {filteredQuickDistricts.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleSelectCityDirect(city)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                        deliveryLocation.includes(city)
                          ? 'bg-[#da1c24] text-white border-[#da1c24]'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* ADD / EDIT ADDRESS FORM (Amazon-style) */
            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-xs flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Address Type Tabs (Home, Office, Other) */}
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'ঠিকানার ধরণ:' : 'Address Label:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTitle('Home')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center space-x-1.5 font-bold transition ${
                      title === 'Home'
                        ? 'bg-red-50 dark:bg-red-950/40 border-[#da1c24] text-[#da1c24]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'বাসা (Home)' : 'Home'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTitle('Office')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center space-x-1.5 font-bold transition ${
                      title === 'Office'
                        ? 'bg-red-50 dark:bg-red-950/40 border-[#da1c24] text-[#da1c24]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'অফিস (Office)' : 'Office'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTitle('Other')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center space-x-1.5 font-bold transition ${
                      title === 'Other'
                        ? 'bg-red-50 dark:bg-red-950/40 border-[#da1c24] text-[#da1c24]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'অন্যান্য (Other)' : 'Other'}</span>
                  </button>
                </div>

                {title === 'Other' && (
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: ভাইয়ের বাসা, কারখানা, ডরমিটরি' : 'e.g. Factory, Brother\'s Place, Dorm'}
                    className="w-full mt-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 text-xs"
                  />
                )}
              </div>

              {/* Recipient Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'প্রাপকের পূর্ণ নাম *' : 'Full Name (Recipient) *'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Rahim Chowdhury"
                      className="w-full pl-8 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
                      required
                    />
                    <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'মোবাইল নাম্বার *' : 'Mobile Phone *'}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full pl-8 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono font-medium"
                      required
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Division & District Cascade */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'বিভাগ (Division) *' : 'Division *'}
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    {BD_DIVISIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? 'জেলা (District) *' : 'District *'}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    {currentDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Thana / Area & Quick Area Chips */}
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'থানা / উপজেলা / এলাকা *' : 'Thana / Upazila / Area *'}
                </label>
                <input
                  type="text"
                  value={thana}
                  onChange={(e) => setThana(e.target.value)}
                  placeholder="e.g. Dhanmondi, Gulshan, Halishahar"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
                  required
                />
                {popularAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {popularAreas.slice(0, 6).map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setThana(a)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                          thana === a 
                            ? 'bg-red-500 text-white border-red-500' 
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Detailed Street Address / House / Flat */}
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'পূর্ণ ঠিকানা (বাড়ি নং, রোড, ফ্ল্যাট, ল্যান্ডমার্ক) *' : 'Full Street Address (House, Flat, Road, Landmark) *'}
                </label>
                <textarea
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  rows={2}
                  placeholder={language === 'bn' ? 'যেমন: বাসা ৪২, রোড ১০/এ, ধানমন্ডি আ/এ, ঢাকা-১২০৯ (মসজিদের বিপরীতে)' : 'e.g. House 42, Road 10/A, Dhanmondi R/A, Dhaka-1209 (Opposite to Jame Masjid)'}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 text-xs"
                  required
                />
              </div>

              {/* Set as Default Switch */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="loc-default-check"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="loc-default-check" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  {language === 'bn' ? 'এটি আমার ডিফল্ট ডেলিভারি ঠিকানা হিসেবে সেট করুন' : 'Use as my default delivery address'}
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className="w-1/3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-[#da1c24] hover:bg-red-700 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সংরক্ষণ ও এই ঠিকানায় ডেলিভারি' : 'Save & Deliver Here'}</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
