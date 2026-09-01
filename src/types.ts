// Types for Sabay BBQ Web Ordering App

export type Language = 'zh' | 'en' | 'ko' | 'ja' | 'th' | 'vi' | 'ru' | 'es';

export interface CustomAddOn {
  id: string;
  name: { [key in Language]?: string } | string;
  price: number;
  qty?: number;
}

export interface FoodCustomization {
  spiciness: number; // 0=None, 1=Spicy
  noodleType?: 'rice-noodle' | 'vermicelli' | 'none'; // for Tom Yum noodles
  soupBase?: 'plain' | 'coconut-milk'; // +50
  notes: string;
  selectedAddOns?: CustomAddOn[];
}

export interface MenuItem {
  id: string;
  category: string;
  name: { [key in Language]?: string };
  price: number;
  image: string;
  thumbnailUrl?: string;
  avifUrl?: string;
  avifThumbnailUrl?: string;
  description: { [key in Language]?: string };
  available: boolean;
  isAvailable?: boolean;
  isSetMeal?: boolean;
  requiredSaucesOption?: boolean; // needs dipping options
  hasNoodlesOption?: boolean;
  hasCoconutsMilkOption?: boolean;
  containsBeef?: boolean;
  containsPork?: boolean;
  containsSeafood?: boolean;
  isNotSpicy?: boolean;
  customAddOns?: CustomAddOn[];
  recipe?: { ingredientId: string; amount: number }[];
  orderIndex?: number;
  isTakeoutAvailable?: boolean;
  soldOutAt?: string | null;
  showOnCustomerPage?: boolean;
}

export interface OrderItem {
  id: string; // instance id
  menuItemId: string;
  name: { [key in Language]?: string };
  price: number;
  qty: number;
  customization: FoodCustomization;
  isPrepared?: boolean;
  isCompleted?: boolean;
}

export type OrderStatus = 'pending' | 'preparing' | 'paid' | 'completed' | 'cancelled';

export type PaymentMethod = 'cash' | 'credit' | 'member' | 'twqr' | string;

export interface RefundLog {
  id?: string;
  timestamp: string;
  amount?: number;
  type?: string;
  itemName?: string;
  pricePerUnit?: number;
  qtyChange?: number;
  totalDiff?: number;
  reason?: string;
  notes?: string;
  authorizedByPin?: string;
  items?: { id: string; name: string; qty: number; price: number }[];
  refundedBy?: string;
}

export interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  serviceCharge: number; // 10% for dine-in if credit card, or 10% standard fee
  total: number;
  status: OrderStatus;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
  customerAvatar: string;
  paymentMethod: PaymentMethod;
  isMember: boolean;
  isPaid?: boolean;
  guestCount?: number;
  refundLogs?: RefundLog[];
  discount?: number;
  quickNotes?: string;
  isFlagged?: boolean;
  flagReason?: string;
  takeoutInfo?: {
    customerName?: string;
    phone?: string;
    pickupTime?: string;
  };
  pickupTime?: string;
  rating?: number;
  feedback?: string;
  isOfflinePending?: boolean;
  clientOrderId?: string;
  reservationNo?: string;
  reservationDate?: string;
  reservationTime?: string;
}

export interface Ingredient {
  id: string;
  name: { [key in Language]?: string };
  stock: number;
  minThreshold: number; // triggers alerts
  unit: string;
}

// Map menu food item ID to its ingredient cost mapping
export interface IngredientCost {
  ingredientId: string;
  amount: number;
}

export interface Category {
  id: string;
  name: { [key in Language]?: string };
  showOnCustomerPage?: boolean;
  orderIndex?: number;
}

export type TableStatus = 'available' | 'preserved' | 'reserved' | 'in_use' | 'pending_checkout' | 'cleaning';

export interface TableConfig {
  id: string;
  qrCodeUrl: string;
  status?: TableStatus;
  preservedFor?: string;
  mergedWith?: string;
  positionX?: number;
  positionY?: number;
  isOfflinePending?: boolean;
  maxCapacity?: number;
  cleaningStartedAt?: string | null;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'completed' | 'checked_out' | 'upcoming';

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  guestCount: number;
  tableNumber: string;
  date: string;
  time: string;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
  reservationNo?: string;
}

export interface OperatingHourSlot {
  id: string;
  name: string;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  days: number[]; // days of week, 0-6 (0 is Sunday, 6 is Saturday)
  isActive: boolean;
  isReservableOnly?: boolean; // 可預約時段 (營業時間外只開放給已預約顧客)
}

export interface OrderHistoryUserStatus {
  isMember: boolean;
  memberId?: string;
  hasPastOrders: boolean;
}

export interface OrderHistoryBillStatus {
  hasUnpaidBillOnTable: boolean;
  tableNumber?: string;
}

export interface MemberRewardItem {
  id: string;
  menuItemId: string;
  cost: number;
  fallbackPrice: number;
  enabled: boolean;
  fallbackName?: { [key in Language]?: string } | string;
}

export interface MembersConfig {
  pointsRatio: number; // 消費多少元獲得 1 點
  vipThreshold: number; // 升級 VIP 門檻點數
  vipDiscountRate: number; // VIP 折扣比例 (例如 0.9 = 9折)
  enablePointsDiscount: boolean; // 是否啟用點數折抵現金
  pointsRedeemRate: number; // 每 1 點折抵多少元現金
  rewards: MemberRewardItem[];
}


