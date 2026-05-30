export enum Role {
  Customer = "CUSTOMER",
  Cook = "COOK",
  Admin = "ADMIN"
}

export enum SpiceLevel {
  None = "NONE",
  Mild = "MILD",
  Medium = "MEDIUM",
  Hot = "HOT",
  VeryHot = "VERY_HOT"
}

export enum OrderStatus {
  Placed = "PLACED",
  Accepted = "ACCEPTED",
  Preparing = "PREPARING",
  Ready = "READY",
  CourierAssigned = "COURIER_ASSIGNED",
  PickedUp = "PICKED_UP",
  OnTheWay = "ON_THE_WAY",
  Delivered = "DELIVERED",
  Cancelled = "CANCELLED"
}

export enum PaymentStatus {
  Pending = "PENDING",
  Paid = "PAID",
  Refunded = "REFUNDED",
  Failed = "FAILED"
}

export enum RefundReason {
  NotDelivered = "NOT_DELIVERED",
  WrongItems = "WRONG_ITEMS",
  FoodQuality = "FOOD_QUALITY",
  CookCancelled = "COOK_CANCELLED",
  Other = "OTHER"
}

export enum RefundStatus {
  Pending = "PENDING",
  Approved = "APPROVED",
  Rejected = "REJECTED",
  Refunded = "REFUNDED"
}

export enum MessageType {
  Text = "TEXT",
  Image = "IMAGE",
  QuickReply = "QUICK_REPLY",
  System = "SYSTEM"
}

export enum NotificationType {
  OrderPlaced = "ORDER_PLACED",
  OrderAccepted = "ORDER_ACCEPTED",
  OrderPreparing = "ORDER_PREPARING",
  OrderReady = "ORDER_READY",
  OrderPickedUp = "ORDER_PICKED_UP",
  OrderDelivered = "ORDER_DELIVERED",
  OrderCancelled = "ORDER_CANCELLED",
  NewMessage = "NEW_MESSAGE",
  NewReview = "NEW_REVIEW",
  CookApproved = "COOK_APPROVED",
  Promo = "PROMO"
}

export interface TimestampedEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User extends TimestampedEntity {
  email: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  avatarVerified: boolean;
  role: Role;
  pushToken?: string | null;
  preferredLang: string;
  preferredCountry?: string | null;
  preferredCurrency?: string | null;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Cook extends TimestampedEntity {
  userId: string;
  user?: User;
  bio?: string | null;
  originCountry: string;
  currentCity: string;
  cuisines: string[];
  specialties: string[];
  availability?: string | null;
  prepTime?: string | null;
  isVerified: boolean;
  isActive: boolean;
  totalOrders: number;
  repeatCustomerRate: number;
  avgRatingOverall: number;
  avgRatingFood: number;
  avgRatingSpeed: number;
  avgRatingPackaging: number;
  avgRatingComm: number;
  locationLat?: number | null;
  locationLng?: number | null;
  locationCity?: string | null;
  locationArea?: string | null;
}

export interface Extra {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface Dish extends TimestampedEntity {
  cookId: string;
  cook?: Cook;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  imageVerified: boolean;
  cuisine: string;
  ingredients: string[];
  spiceLevel: SpiceLevel;
  prepTime: number;
  basePrice: number;
  isAvailable: boolean;
  isFeatured: boolean;
  tags: string[];
  sauces: Extra[];
  drinks: Extra[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  dishId: string;
  dish?: Dish;
  quantity: number;
  unitPrice: number;
  extras: Extra[];
  note?: string | null;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string | null;
  createdAt: string;
}

export interface Order extends TimestampedEntity {
  customerId: string;
  customer?: User;
  cookId: string;
  cook?: Cook;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  deliveryFee: number;
  serviceFee: number;
  currency: string;
  deliveryAddress: string;
  customerNote?: string | null;
  cancelReason?: string | null;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  trackingLat?: number | null;
  trackingLng?: number | null;
  statusHistory: OrderStatusHistory[];
}

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  sender?: User;
  content: string;
  type: MessageType;
  readAt?: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  cookId: string;
  ratingOverall: number;
  ratingFood: number;
  ratingSpeed: number;
  ratingPackaging: number;
  ratingComm: number;
  comment?: string | null;
  photoUrl?: string | null;
  createdAt: string;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  customerId: string;
  reason: RefundReason;
  description?: string | null;
  status: RefundStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  dishId?: string | null;
  cookId?: string | null;
  createdAt: string;
}

export enum TicketStatus {
  Open = "OPEN",
  WaitingForAgent = "WAITING_FOR_AGENT",
  AgentJoined = "AGENT_JOINED",
  Resolved = "RESOLVED",
  Closed = "CLOSED"
}

export interface SupportTicket extends TimestampedEntity {
  userId: string;
  status: TicketStatus;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  paymentMethods: string[];
}

export interface UserContext {
  countryCode?: string | null;
  city?: string | null;
  currency?: string | null;
  currencySymbol?: string | null;
  cuisinePrefs: string[];
}

export interface PaginatedResult<TItem> {
  items: TItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface Cuisine {
  id: string;
  name: string;
  emoji: string;
}

export const CUISINES = [
  { id: "all", name: "All", emoji: "🍽️" },
  { id: "egyptian", name: "Egyptian", emoji: "🇪🇬" },
  { id: "turkish", name: "Turkish", emoji: "🇹🇷" },
  { id: "syrian", name: "Syrian", emoji: "🇸🇾" },
  { id: "iraqi", name: "Iraqi", emoji: "🇮🇶" },
  { id: "yemeni", name: "Yemeni", emoji: "🇾🇪" },
  { id: "moroccan", name: "Moroccan", emoji: "🇲🇦" },
  { id: "pakistani", name: "Pakistani", emoji: "🇵🇰" },
  { id: "indian", name: "Indian", emoji: "🇮🇳" },
  { id: "afghan", name: "Afghan", emoji: "🇦🇫" },
  { id: "sudanese", name: "Sudanese", emoji: "🇸🇩" },
  { id: "lebanese", name: "Lebanese", emoji: "🇱🇧" },
  { id: "italian", name: "Italian", emoji: "🇮🇹" },
  { id: "japanese", name: "Japanese", emoji: "🇯🇵" },
  { id: "mexican", name: "Mexican", emoji: "🇲🇽" }
] as const satisfies readonly Cuisine[];

export type CuisineId = (typeof CUISINES)[number]["id"];

export interface FilterState {
  cuisines: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  maxPrepTime: number | null;
  availableNow: boolean;
  halalOnly: boolean;
  vegan: boolean;
  spicy: boolean;
}

export type DishSortBy = "rating" | "price_asc" | "price_desc" | "newest" | "popular";
export type CookSortBy = "rating" | "orders" | "newest";

export interface DishesResponse {
  dishes: Dish[];
  total: number;
  page: number;
  totalPages: number;
  nextPage: number | null;
}

export interface CooksResponse {
  cooks: Cook[];
  total: number;
  page: number;
  totalPages: number;
  nextPage: number | null;
}
