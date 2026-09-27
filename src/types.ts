export type Language = 'en' | 'bn';
export type Theme = 'light' | 'dark';

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  sku: string;
  category: string;
  categoryBn: string;
  price: number;
  compareAtPrice: number;
  discountPercentage: number;
  stock: number;
  images: string[];
  description: string;
  descriptionBn: string;
  features: string[];
  featuresBn: string[];
  specifications?: Record<string, string>;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isHotSelling?: boolean;
  isFlashDeal?: boolean;
  isLatest?: boolean;
  isDiscount?: boolean;
  badge?: string;
  inStock: boolean;
  brand?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  iconName: string;
  productCount: number;
  image?: string;
  bannerImage?: string;
  isFeatured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type CourierProvider = 'none' | 'steadfast' | 'pathao';

export interface CourierDispatchInfo {
  provider: 'Steadfast' | 'Pathao' | string;
  consignmentId: string;
  trackingUrl?: string;
  status: string;
  dispatchedAt: string;
}

export type PaymentMethodType = 'Cash on Delivery' | 'bKash' | 'Nagad' | 'Rocket';

export interface PaymentMethodConfig {
  enabled: boolean;
  accountNumber?: string;
  accountType?: 'Personal' | 'Merchant' | 'Agent';
  instructions?: string;
  instructionsBn?: string;
}

export interface PaymentSettings {
  cod: PaymentMethodConfig;
  bkash: PaymentMethodConfig;
  nagad: PaymentMethodConfig;
  rocket?: PaymentMethodConfig;
}

export interface HeroBanner {
  id: string;
  title: string;
  titleBn?: string;
  subtitle?: string;
  subtitleBn?: string;
  badge?: string;
  badgeBn?: string;
  imageUrl: string;
  ctaText?: string;
  ctaTextBn?: string;
  linkType?: 'category' | 'product' | 'all' | 'custom';
  linkValue?: string;
  bgColor?: string;
  textColor?: 'light' | 'dark';
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface AdminPermissions {
  dashboard: boolean;
  orders: boolean;
  products: boolean;
  categories: boolean;
  banners: boolean;
  couriers: boolean;
  payments: boolean;
  staff: boolean;
  settings: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'moderator';
  permissions: AdminPermissions;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

export interface CourierConfig {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  isDefault?: boolean;
  apiKey?: string;
  secretKey?: string;
  clientId?: string;
  insideDhakaCharge: number;
  outsideDhakaCharge: number;
  instructions?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productNameBn: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  district: 'Dhaka' | 'Outside Dhaka' | string;
  districtBn?: string;
  thana?: string;
  address: string;
  orderNote?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: PaymentMethodType;
  transactionId?: string;
  status: OrderStatus;
  courier: CourierProvider | CourierDispatchInfo | any;
  courierTrackingId?: string;
  courierStatus?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeNameBn: string;
  tagline: string;
  taglineBn: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  addressBn: string;
  deliveryChargeInsideDhaka: number;
  deliveryChargeOutsideDhaka: number;
  freeDeliveryThreshold: number;
  steadfastApiKey: string;
  steadfastSecretKey: string;
  pathaoClientId: string;
  pathaoClientSecret: string;
  isCourierSandbox: boolean;
  announcementEn: string;
  announcementBn: string;
  paymentSettings?: PaymentSettings;
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}
