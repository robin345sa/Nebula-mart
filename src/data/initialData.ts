import { Product, Category, StoreSettings, Order, ProductReview, PaymentSettings, HeroBanner, AdminUser, CourierConfig } from '../types';

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  cod: {
    enabled: true,
    instructions: 'Pay with cash upon receiving product at your delivery address.',
    instructionsBn: 'পণ্য হাতে পেয়ে ডেলিভারি ম্যানকে ক্যাশ টাকা পরিশোধ করুন।'
  },
  bkash: {
    enabled: true,
    accountNumber: '018XXXXXXXX',
    accountType: 'Merchant',
    instructions: 'Make Payment to this Merchant number and enter the Transaction ID (TrxID) below.',
    instructionsBn: 'উক্ত বিকাশ মার্চেন্ট নম্বরে Payment করে নিচের বক্সে TrxID প্রদান করুন।'
  },
  nagad: {
    enabled: true,
    accountNumber: '017XXXXXXXX',
    accountType: 'Merchant',
    instructions: 'Send payment to this Nagad number and enter the Transaction ID below.',
    instructionsBn: 'উক্ত নগদ মার্চেন্ট নম্বরে পেমেন্ট সম্পন্ন করে TrxID প্রদান করুন।'
  },
  rocket: {
    enabled: true,
    accountNumber: '019XXXXXXXX',
    accountType: 'Merchant',
    instructions: 'Send payment to this Rocket number and enter the Transaction ID below.',
    instructionsBn: 'উক্ত রকেট মার্চেন্ট নম্বরে পেমেন্ট সম্পন্ন করে TrxID প্রদান করুন।'
  }
};

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Nebula Mart',
  storeNameBn: 'নেবুলা মার্ট',
  tagline: 'Premium, Trustworthy Online Shopping in Bangladesh',
  taglineBn: 'বাংলাদেশের বিশ্বস্ত ও প্রিমিয়াম অনলাইন শপিং প্ল্যাটফর্ম',
  logoUrl: '/logo/nebula-mart.svg?v=3',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  addressBn: '',
  deliveryChargeInsideDhaka: 80,
  deliveryChargeOutsideDhaka: 130,
  freeDeliveryThreshold: 5000,
  steadfastApiKey: '',
  steadfastSecretKey: '',
  pathaoClientId: '',
  pathaoClientSecret: '',
  isCourierSandbox: false,
  announcementEn: '🚚 Fast Cash on Delivery all across Bangladesh! Dhaka ৳80 | Outside Dhaka ৳130',
  announcementBn: '🚚 সমগ্র বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা! ঢাকা সিটিতে ৳৮০ | ঢাকার বাইরে ৳১৩০',
  paymentSettings: DEFAULT_PAYMENT_SETTINGS
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-gadgets',
    name: 'Smart Gadgets',
    nameBn: 'স্মার্ট গ্যাজেটস',
    slug: 'smart-gadgets',
    iconName: 'Smartphone',
    productCount: 0,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-audio',
    name: 'Audio & Sound',
    nameBn: 'অডিও ও সাউন্ড',
    slug: 'audio-sound',
    iconName: 'Headphones',
    productCount: 0,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-home',
    name: 'Home & Kitchen',
    nameBn: 'হোম ও কিচেন',
    slug: 'home-kitchen',
    iconName: 'Home',
    productCount: 0,
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-lifestyle',
    name: 'Lifestyle & Health',
    nameBn: 'লাইফস্টাইল ও হেলথ',
    slug: 'lifestyle-health',
    iconName: 'Activity',
    productCount: 0,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-accessories',
    name: 'Computer Accessories',
    nameBn: 'কম্পিউটার এক্সেসরিজ',
    slug: 'computer-accessories',
    iconName: 'Cpu',
    productCount: 0,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=80'
  }
];

// Completely empty for fresh custom catalog addition via Admin Panel
export const INITIAL_PRODUCTS: Product[] = [];

// Sample catalog kept for manual "Load Sample Products" when requested
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Aroma Smart LED Flame Diffuser & Humidifier',
    nameBn: 'স্মার্ট অ্যারোমা ফ্লেম ডিফিউজার এবং হিউমিডিফায়ার',
    slug: 'aroma-smart-led-flame-diffuser',
    sku: 'NM-HD-101',
    category: 'Home & Kitchen',
    categoryBn: 'হোম ও কিচেন',
    price: 1450,
    compareAtPrice: 1850,
    discountPercentage: 22,
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Create a cozy, relaxing ambiance in your living room or office with ultra-realistic realistic fire flame LED lighting and whisper-quiet ultrasonic essential oil aroma diffusion.',
    descriptionBn: 'আপনার ঘর বা অফিসের পরিবেশকে শান্ত ও স্নিগ্ধ রাখতে ফায়ার ফ্লেম এলইডী লাইটিং এবং শব্দহীন আল্ট্রাসনিক এসেনশিয়াল অয়েল ডিফিউজার।',
    features: [
      'Realistic flame lighting effect with warm & soft glow',
      'Ultra-silent 25dB noise reduction technology',
      'Auto power-off when water runs out for safe operation',
      'Compact USB-C powered, fits easily anywhere'
    ],
    featuresBn: [
      'রিয়েলিস্টিক ফায়ার ফ্লেম লাইটিং এফেক্ট',
      '২৫ ডেসিবেল শব্দহীন আল্ট্রাসনিক প্রযুক্তি',
      'পানি শেষ হলে স্বয়ংক্রিয়ভাবে বন্ধ হওয়ার নিরাপত্তা ফিচার',
      'টাইপ-সি ইউএসবি পাওয়ার কেবল অন্তর্ভুক্ত'
    ],
    specifications: {
      'Water Tank Capacity': '180ml',
      'Mist Output': '15-20ml/hr',
      'Power Input': 'DC 5.0V / 2.0A Type-C',
      'Material': 'BPA-free ABS & PP'
    },
    rating: 4.9,
    reviewCount: 42,
    isFeatured: true,
    isLatest: true,
    isDiscount: true,
    inStock: true,
    brand: 'Nebula Living',
    createdAt: '2026-03-01'
  },
  {
    id: 'prod-002',
    name: 'Pro Wireless ANC Noise Cancelling Earbuds',
    nameBn: 'প্রো ওয়্যারলেস এএনসি নয়েজ ক্যানসেলিং ইয়ারবাডস',
    slug: 'pro-wireless-anc-noise-cancelling-earbuds',
    sku: 'NM-EB-202',
    category: 'Audio & Sound',
    categoryBn: 'অডিও ও সাউন্ড',
    price: 2190,
    compareAtPrice: 2850,
    discountPercentage: 23,
    stock: 19,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Active Noise Cancellation with Hi-Fi stereo surround bass, quad microphone for crystal-clear HD calling, and up to 36 hours total battery backup with charging case.',
    descriptionBn: 'হাই-ফাই স্টেরিও সারাউন্ড বাস, ক্রিস্টাল ক্লিয়ার এইচডি কলিংয়ের জন্য কোয়াড মাইক্রোফোন এবং ৩৬ ঘণ্টার ব্যাটারি ব্যাকআপ সমৃদ্ধ অ্যাক্টিভ নয়েজ ক্যান্সেলেশন ইয়ারবাডস।',
    features: [
      'Active Noise Cancellation up to 35dB',
      'Transparency mode for hearing surroundings clearly',
      'Quad Environmental Noise Cancellation (ENC) Mics',
      'IPX5 Sweat & Water Resistant for workouts'
    ],
    featuresBn: [
      '৩৫ ডেসিবেল অ্যাক্টিভ নয়েজ ক্যান্সেলেশন',
      'চারটি এইচডি মাইক্রোফোন দিয়ে পরিচ্ছন্ন কলিং সুবিধা',
      '৩৬ ঘণ্টার পাওয়ারফুল চার্জিং কেস ব্যাকআপ',
      'আইপিএক্স৫ সোয়েট এবং ওয়াটার রেজিস্ট্যান্ট'
    ],
    specifications: {
      'Bluetooth Version': '5.3 Ultra-Low Latency',
      'Playtime': '7 Hours single charge (36 Hours total)',
      'Charging Time': '1 Hour Fast Charge',
      'Driver Size': '13mm Titanium Composite'
    },
    rating: 4.8,
    reviewCount: 68,
    isFeatured: true,
    isLatest: true,
    isDiscount: true,
    inStock: true,
    brand: 'Nebula Sound',
    createdAt: '2026-03-03'
  },
  {
    id: 'prod-003',
    name: 'Smart Fitness Tracker with AMOLED Display & SpO2',
    nameBn: 'স্মার্ট ফিটনেস ট্র্যাকার এমোলেড ডিসপ্লে ও এসপিও২',
    slug: 'smart-fitness-tracker-amoled-display',
    sku: 'NM-SW-303',
    category: 'Smart Gadgets',
    categoryBn: 'স্মার্ট গ্যাজেটস',
    price: 2650,
    compareAtPrice: 3200,
    discountPercentage: 17,
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Brilliant 1.43-inch AMOLED display with continuous heart rate monitoring, blood oxygen SpO2 tracking, sleep analysis, and smart notifications for Android and iPhone.',
    descriptionBn: '১.৪৩ ইঞ্চি উজ্জ্বল এমোলেড ডিসপ্লে, ২৪ ঘণ্টা হার্ট রেট ও রক্তের অক্সিজেন (SpO2) ট্র্যাকিং এবং দীর্ঘ ব্যাটারি ব্যাকআপযুক্ত প্রিমিয়াম স্মার্টওয়াচ।',
    features: [
      '1.43" Vivid Always-On AMOLED Display',
      'Over 100 sports tracking & workout modes',
      'Bluetooth phone call answer & notification alerts',
      'Up to 10-day regular battery life'
    ],
    featuresBn: [
      '১.৪৩ ইঞ্চি উজ্জ্বল অলওয়েজ-অন অ্যামোলেড ডিসপ্লে',
      '১০০+ স্পোর্টস ও জিম ট্র্যাকিং মোড',
      'ব্লুটুথ কলিং এবং বাংলা নোটিফিকেশন সুবিধা',
      'এক চার্জে ১০ দিন পর্যন্ত স্বাভাবিক ব্যাটারি ব্যাকআপ'
    ],
    specifications: {
      'Screen Resolution': '466 x 466 HD',
      'Water Resistance': '5ATM / 50 meters',
      'Compatibility': 'Android 6.0+ / iOS 11.0+',
      'Battery': '300mAh Li-Po'
    },
    rating: 4.9,
    reviewCount: 54,
    isFeatured: true,
    isLatest: false,
    isDiscount: true,
    inStock: true,
    brand: 'Nebula Wear',
    createdAt: '2026-03-05'
  },
  {
    id: 'prod-004',
    name: 'High-Speed 65W GaN Fast Charger with Dual Type-C',
    nameBn: '৬৫ ওয়াট গ্যান ফাস্ট চার্জার ডুয়াল টাইপ-সি পোর্ট',
    slug: 'high-speed-65w-gan-fast-charger',
    sku: 'NM-CH-404',
    category: 'Computer Accessories',
    categoryBn: 'কম্পিউটার এক্সেসরিজ',
    price: 1850,
    compareAtPrice: 2200,
    discountPercentage: 16,
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Compact Gallium Nitride (GaN III) fast charger capable of charging laptops, MacBooks, iPads, iPhones, and Android smartphones at lightning speeds with safe heat control.',
    descriptionBn: 'উন্নত গ্যালিয়াম নাইট্রাইড (GaN) প্রযুক্তিযুক্ত কমপ্যাক্ট ৬৫ ওয়াট ফাস্ট চার্জার যা একইসাথে ল্যাপটপ, ম্যাকবুক, ট্যাবলেট ও স্মার্টফোন সুপার ফাস্ট চার্জ করে।',
    features: [
      '65W Max Power Delivery (PD 3.0 & PPS support)',
      '3 Ports: 2x Type-C + 1x USB-A QC 3.0',
      'Charges MacBook Air to 50% in just 30 minutes',
      'Multi-protection against over-voltage and overheating'
    ],
    featuresBn: [
      'সর্বোচ্চ ৬৫ ওয়াট পাওয়ার ডেলিভারি সাপোর্ট',
      'একসাথে ৩টি ডিভাইস চার্জ করার জন্য ৩টি পোর্ট',
      'ল্যাপটপ ও ম্যাকবুক দ্রুত চার্জ করার সক্ষমতা',
      'ওভার-হিটিং ও ওভার-ভোল্টেজ প্রটেকশন'
    ],
    specifications: {
      'Input': '100-240V ~ 50/60Hz 1.5A',
      'Output C1/C2': '65W Max (5V/3A, 9V/3A, 12V/3A, 15V/3A, 20V/3.25A)',
      'Output USB-A': '30W Max',
      'Technology': 'GaN III Semiconductor'
    },
    rating: 4.7,
    reviewCount: 31,
    isFeatured: false,
    isLatest: true,
    isDiscount: false,
    inStock: true,
    brand: 'Nebula Power',
    createdAt: '2026-03-08'
  },
  {
    id: 'prod-005',
    name: 'Ergonomic Memory Foam Lumbar Support Pillow',
    nameBn: 'এরগনোমিক মেমোরি ফোম লাম্বার সাপোর্ট কুশন',
    slug: 'ergonomic-memory-foam-lumbar-support-pillow',
    sku: 'NM-LF-505',
    category: 'Lifestyle & Health',
    categoryBn: 'লাইফস্টাইল ও হেলথ',
    price: 1290,
    compareAtPrice: 1599,
    discountPercentage: 19,
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Relieve spine fatigue and lower back pain during long hours of office desk work or car driving. High-density breathable memory foam designed for orthopedic alignment.',
    descriptionBn: 'দীর্ঘ সময় ডেস্কে বসে কাজ করা বা ড্রাইভিং করার সময় কোমর ও পিঠের ব্যথা উপশমে প্রিমিয়াম হাই-ডেনসিটি মেমোরি ফোম কুশন।',
    features: [
      'Contoured orthopedic curve supports lower spinal alignment',
      '100% pure high-density therapeutic memory foam',
      'Breathable 3D mesh cover, removable & washable',
      'Adjustable dual straps firmly grip any office chair or car seat'
    ],
    featuresBn: [
      'মেরুদণ্ডের সঠিক পজিশন বজায় রাখতে অর্থোপেডিক ডিজাইন',
      '১০০% প্রিমিয়াম মেমোরি ফোম',
      'ওয়াশেবল ব্রিদেবল মেশ কভার',
      'যেকোনো অফিস চেয়ার বা গাড়ির সিটে লাগানোর জন্য স্ট্র্যাপ'
    ],
    specifications: {
      'Dimensions': '44 x 38 x 12 cm',
      'Core': '100% Polyurethane High-Density Memory Foam',
      'Cover Material': 'Breathable 3D Mesh Fabric',
      'Weight': '650g'
    },
    rating: 4.8,
    reviewCount: 39,
    isFeatured: true,
    isLatest: false,
    isDiscount: true,
    inStock: true,
    brand: 'Nebula Ortho',
    createdAt: '2026-03-09'
  },
  {
    id: 'prod-006',
    name: 'Stainless Steel Temperature Display Vacuum Flask 500ml',
    nameBn: 'স্মার্ট টেম্পারেচার ডিসপ্লে ভ্যাকুয়াম ফ্লাস্ক ৫০০মিলি',
    slug: 'smart-temperature-display-vacuum-flask',
    sku: 'NM-FK-606',
    category: 'Home & Kitchen',
    categoryBn: 'হোম ও কিচেন',
    price: 690,
    compareAtPrice: 950,
    discountPercentage: 27,
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Touch-sensitive LED temperature display cap with double-wall food grade 304 stainless steel vacuum insulation. Keeps beverages hot or cold for up to 12 hours.',
    descriptionBn: 'এলইডী টাচ স্ক্রিন ডিসপ্লেযুক্ত থার্মো ফ্লাস্ক, যাতে পানীয়র তাপমাত্রা দেখা যায়। ১২ ঘণ্টা পর্যন্ত গরম বা ঠান্ডা বজায় রাখে।',
    features: [
      'Smart touch-activated LED cap displays liquid temperature',
      'Double-wall 304 food-grade stainless steel',
      'Keeps hot for 12 hours / cold for 24 hours',
      'Leak-proof silicone seal ring and built-in tea infuser'
    ],
    featuresBn: [
      'টাচ করলেই পানির তাপমাত্রা দেখানোর স্মার্ট ক্যাপ',
      'ফুড গ্রেড ৩০৪ স্টেইনলেস স্টিল মেটেরিয়াল',
      '১২ ঘণ্টা গরম এবং ২৪ ঘণ্টা ঠান্ডা রাখার ক্ষমতা',
      '১০০% লিকপ্রুফ ও সহজে বহনযোগ্য'
    ],
    specifications: {
      'Capacity': '500ml',
      'Material': 'SUS 304 Stainless Steel + Food-Grade PP',
      'Thermal Performance': '6-12 hours above 60°C',
      'Battery Life': 'Over 50,000 temperature touches'
    },
    rating: 4.6,
    reviewCount: 88,
    isFeatured: false,
    isLatest: true,
    isDiscount: true,
    inStock: true,
    brand: 'Nebula Living',
    createdAt: '2026-03-10'
  }
];

export const INITIAL_ORDERS: Order[] = [];

export const SAMPLE_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'NM-98241',
    customerName: 'Customer #101',
    customerPhone: '01XXXXXXXXX',
    customerEmail: '',
    district: 'Dhaka',
    districtBn: 'ঢাকা',
    thana: 'Dhanmondi',
    address: 'Sector 4, Uttara, Dhaka',
    orderNote: 'Call before delivery',
    items: [],
    subtotal: 1450,
    deliveryCharge: 80,
    total: 1530,
    paymentMethod: 'Cash on Delivery',
    status: 'shipped',
    courier: 'steadfast',
    courierTrackingId: 'SF-BD-892110',
    courierStatus: 'In Transit via Steadfast Courier',
    createdAt: '2026-03-13T10:15:00Z'
  }
];

export const INITIAL_REVIEWS: ProductReview[] = [];

export const INITIAL_BANNERS: HeroBanner[] = [
  {
    id: 'banner-1',
    title: "HIMALAYA NATURE'S BEST SALE",
    titleBn: 'হিমালয়া নেচারস বেস্ট সেল অফার',
    subtitle: 'Shop Smart. Choose Nature.',
    subtitleBn: 'স্মার্ট শপিং করুন • সেরা মানের অরজিনাল প্রোডাক্টস',
    badge: 'dm DarazMall | BRAND DAY',
    badgeBn: 'dm দারাজমল | ব্র্যান্ড ডে',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1600&auto=format&fit=crop&q=80',
    ctaText: 'Shop Now',
    ctaTextBn: 'এখনই কিনুন',
    linkType: 'all',
    bgColor: '#FAF9F5',
    textColor: 'dark',
    isActive: true,
    order: 1,
    createdAt: '2026-03-01'
  },
  {
    id: 'banner-2',
    title: 'MEGA ELECTRONICS & GADGET FAIR',
    titleBn: 'মেগা ইলেকট্রনিক্স ও স্মার্ট গ্যাজেট মেলা',
    subtitle: 'Up to 50% Off On Authentic Lifestyle Gadgets',
    subtitleBn: 'প্রিমিয়াম গ্যাজেটে সর্বোচ্চ ৫০% পর্যন্ত আকর্ষণীয় ছাড়',
    badge: 'dm NebulaMall | FLASH DEALS',
    badgeBn: 'dm নেবুলামল | ফ্ল্যাশ ডিল',
    imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&auto=format&fit=crop&q=80',
    ctaText: 'Shop Now',
    ctaTextBn: 'এখনই কিনুন',
    linkType: 'category',
    linkValue: 'Smart Gadgets',
    bgColor: '#FDFBF7',
    textColor: 'dark',
    isActive: true,
    order: 2,
    createdAt: '2026-03-02'
  },
  {
    id: 'banner-3',
    title: 'STUDIO SOUND & WIRELESS ANC',
    titleBn: 'প্রো ওয়্যারলেস অডিও ও সাউন্ড সিস্টেম',
    subtitle: 'Ultra Bass, Pure Noise Cancellation & COD',
    subtitleBn: 'ক্রিস্টাল ক্লিয়ার সাউন্ড এবং হাতে পেয়ে মূল্য পরিশোধের সুবিধা',
    badge: 'dm NebulaMall | AUDIO WEEK',
    badgeBn: 'dm নেবুলামল | অডিও উইক',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
    ctaText: 'Shop Audio',
    ctaTextBn: 'অডিও কালেকশন',
    linkType: 'category',
    linkValue: 'Audio & Sound',
    bgColor: '#F5F5F0',
    textColor: 'dark',
    isActive: true,
    order: 3,
    createdAt: '2026-03-03'
  }
];

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'user-admin-1',
    name: 'Master Admin',
    email: 'admin@nebulamart.com',
    password: 'admin123',
    role: 'admin',
    permissions: {
      dashboard: true,
      orders: true,
      products: true,
      categories: true,
      banners: true,
      couriers: true,
      payments: true,
      staff: true,
      settings: true
    },
    status: 'active',
    createdAt: '2026-01-01'
  },
  {
    id: 'user-mod-1',
    name: 'Store Moderator',
    email: 'moderator@nebulamart.com',
    password: 'mod123',
    role: 'moderator',
    permissions: {
      dashboard: true,
      orders: true,
      products: true,
      categories: true,
      banners: true,
      couriers: false,
      payments: false,
      staff: false,
      settings: false
    },
    status: 'active',
    createdAt: '2026-02-15'
  }
];

export const INITIAL_COURIERS: CourierConfig[] = [
  {
    id: 'courier-steadfast',
    name: 'Steadfast Courier',
    code: 'steadfast',
    enabled: true,
    isDefault: true,
    apiKey: '',
    secretKey: '',
    insideDhakaCharge: 80,
    outsideDhakaCharge: 130,
    instructions: 'Next-day delivery inside Dhaka and fast district sub-office coverage nationwide.'
  },
  {
    id: 'courier-pathao',
    name: 'Pathao Courier',
    code: 'pathao',
    enabled: true,
    isDefault: false,
    apiKey: '',
    secretKey: '',
    clientId: '',
    insideDhakaCharge: 80,
    outsideDhakaCharge: 140,
    instructions: 'Merchant API integration with automated live tracking and OTP handoff.'
  }
];

export const SAMPLE_REVIEWS: ProductReview[] = [
  {
    id: 'rev-1',
    productId: 'prod-001',
    userName: 'Kazi Mahbub',
    rating: 5,
    comment: 'অসাধারণ প্রোডাক্ট! ফ্লেম ইফেক্ট দেখতে হুবহু আসল আগুনের শিখার মতো লাগে। ডিফিউজারটা রাতে ঘুমের সময় খুব রিলাক্স দেয়। ঢাকা সিটিতে ২ দিনের মধ্যে ডেলিভারি পেয়েছি।',
    date: '2026-03-11',
    verified: true
  },
  {
    id: 'rev-2',
    productId: 'prod-001',
    userName: 'Raihan Karim',
    rating: 5,
    comment: 'Authentic item, build quality 10/10. Cash on delivery was seamless and packaging was very secure.',
    date: '2026-03-10',
    verified: true
  },
  {
    id: 'rev-3',
    productId: 'prod-002',
    userName: 'Tasnimul Hasan',
    rating: 5,
    comment: 'ANC noise cancelling really works during commuting on bus. Bass is punchy and mic voice is very crisp.',
    date: '2026-03-09',
    verified: true
  },
  {
    id: 'rev-4',
    productId: 'prod-005',
    userName: 'Dr. Shahrier Kabir',
    rating: 5,
    comment: 'অফিসে সারাদিন কম্পিউটারের সামনে বসে কাজ করতে গিয়ে কোমরে অনেক ব্যথা হতো। এই কুশনটা ব্যবহারের পর ব্যাক পেইন অনেক কমে গেছে। মেমোরি ফোমটা খুব ভালো মানের।',
    date: '2026-03-12',
    verified: true
  }
];
