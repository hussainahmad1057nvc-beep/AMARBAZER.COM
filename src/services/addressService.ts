import { Address, User } from '../types';

export const BD_DIVISIONS = [
  'Dhaka', 
  'Chittagong', 
  'Rajshahi', 
  'Khulna', 
  'Sylhet', 
  'Barisal', 
  'Rangpur', 
  'Mymensingh'
];

export const BD_DISTRICTS: Record<string, string[]> = {
  Dhaka: ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Faridpur', 'Narsingdi', 'Manikganj', 'Munshiganj', 'Kishoreganj', 'Gopalganj', 'Madaripur', 'Rajbari', 'Shariatpur'],
  Chittagong: ['Chittagong', "Cox's Bazar", 'Comilla', 'Feni', 'Noakhali', 'Brahmanbaria', 'Chandpur', 'Lakshmipur', 'Rangamati', 'Khagrachhari', 'Bandarban'],
  Rajshahi: ['Rajshahi', 'Bogra', 'Pabna', 'Naogaon', 'Natore', 'Sirajganj', 'Chapai Nawabganj', 'Joypurhat'],
  Khulna: ['Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Kushtia', 'Jhenaidah', 'Chuadanga', 'Meherpur', 'Magura', 'Narail'],
  Sylhet: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Barisal: ['Barisal', 'Bhola', 'Patuakhali', 'Pirojpur', 'Barguna', 'Jhalokati'],
  Rangpur: ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon'],
  Mymensingh: ['Mymensingh', 'Netrokona', 'Sherpur', 'Jamalpur']
};

export const BD_POPULAR_AREAS: Record<string, string[]> = {
  'Dhaka': ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur', 'Badda', 'Motijheel', 'Old Dhaka / Lalbagh', 'Khilgaon', 'Bashundhara R/A', 'Farmgate', 'Tejgaon', 'Malibagh', 'Jatrabari'],
  'Chittagong': ['Agrabad', 'GEC Circle', 'Nasirabad', 'Halishahar', 'Khulshi', 'Panchlaish', 'Chawkbazar', 'Kotwali', 'Muradpur', 'Pahartali'],
  'Rajshahi': ['Boalia', 'Motihar', 'Rajpara', 'Shah Makhdum', 'Kazla', 'Talaimari'],
  'Khulna': ['Sonadanga', 'Khalishpur', 'Daulatpur', 'Boyra', 'Rupsha'],
  'Sylhet': ['Zindabazar', 'Ambarkhana', 'Subidbazar', 'Upashahar', 'Mirabazar'],
  'Barisal': ['Sadat Road', 'Natullabad', 'Rupatali', 'Band Road'],
  'Rangpur': ['Dhap', 'Jahaj Company Mor', 'Modern Mor', 'Radhaballav'],
  'Mymensingh': ['Town Hall Mor', 'Charkpara', 'Ganginar Par', 'Maskanda']
};

const STORAGE_KEY_PREFIX = 'amarbazar_saved_addresses_';

export const addressService = {
  getStorageKey(userId?: string): string {
    return `${STORAGE_KEY_PREFIX}${userId || 'guest'}`;
  },

  getSavedAddresses(currentUser?: User | null): Address[] {
    const key = this.getStorageKey(currentUser?.id);
    const stored = localStorage.getItem(key);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse saved addresses:', e);
      }
    }

    // If user object already has addresses
    if (currentUser?.addresses && currentUser.addresses.length > 0) {
      this.saveAddresses(currentUser.addresses, currentUser.id);
      return currentUser.addresses;
    }

    // Default template address for easy demo/first checkout
    const defaultAddresses: Address[] = [
      {
        id: 'addr-default-1',
        title: 'Home Address',
        recipientName: currentUser?.name || 'Rahim Chowdhury',
        phone: currentUser?.phone || '01712345678',
        division: 'Dhaka',
        district: 'Dhaka',
        thana: 'Dhanmondi',
        fullAddress: 'House 42, Road 10/A, Dhanmondi R/A, Dhaka-1209',
        isDefault: true
      }
    ];

    this.saveAddresses(defaultAddresses, currentUser?.id);
    return defaultAddresses;
  },

  saveAddresses(addresses: Address[], userId?: string): void {
    const key = this.getStorageKey(userId);
    try {
      localStorage.setItem(key, JSON.stringify(addresses));
    } catch (e) {
      console.warn('Failed to save addresses to storage:', e);
    }
  },

  addAddress(address: Omit<Address, 'id'>, userId?: string): Address {
    const currentList = this.getSavedAddresses({ id: userId } as any);
    const isFirst = currentList.length === 0;
    
    const newAddress: Address = {
      ...address,
      id: `addr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      isDefault: address.isDefault || isFirst
    };

    let updatedList: Address[];
    if (newAddress.isDefault) {
      updatedList = [
        newAddress,
        ...currentList.map(a => ({ ...a, isDefault: false }))
      ];
    } else {
      updatedList = [newAddress, ...currentList];
    }

    this.saveAddresses(updatedList, userId);
    return newAddress;
  },

  updateAddress(address: Address, userId?: string): Address[] {
    const currentList = this.getSavedAddresses({ id: userId } as any);
    let updatedList = currentList.map(a => a.id === address.id ? address : a);

    if (address.isDefault) {
      updatedList = updatedList.map(a => ({
        ...a,
        isDefault: a.id === address.id
      }));
    }

    this.saveAddresses(updatedList, userId);
    return updatedList;
  },

  deleteAddress(id: string, userId?: string): Address[] {
    const currentList = this.getSavedAddresses({ id: userId } as any);
    const updatedList = currentList.filter(a => a.id !== id);
    
    // If the default was deleted and there are remaining items, make the first one default
    if (updatedList.length > 0 && !updatedList.some(a => a.isDefault)) {
      updatedList[0].isDefault = true;
    }

    this.saveAddresses(updatedList, userId);
    return updatedList;
  },

  setDefaultAddress(id: string, userId?: string): Address[] {
    const currentList = this.getSavedAddresses({ id: userId } as any);
    const updatedList = currentList.map(a => ({
      ...a,
      isDefault: a.id === id
    }));

    this.saveAddresses(updatedList, userId);
    return updatedList;
  },

  getDefaultAddress(currentUser?: User | null): Address | null {
    const list = this.getSavedAddresses(currentUser);
    return list.find(a => a.isDefault) || list[0] || null;
  }
};
