import { create } from "zustand";
import { COUNTRIES } from "../constants/countries";
import { MMKVStorage } from "../utils/mmkv";

const STORAGE_KEY = "cart";

export interface CartExtra {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  dishId: string;
  dishName: string;
  imageUrl: string | null;
  cookId: string;
  cookName: string;
  quantity: number;
  unitPrice: number;
  extras: CartExtra[];
  note: string;
}

interface PersistedCart {
  items: CartItem[];
  cookId: string | null;
  promoCode: string | null;
  discount: number;
}

export const FEE_CONFIG: Record<string, { deliveryFee: number; serviceFee: number }> = {
  TR: { deliveryFee: 30, serviceFee: 15 },
  DE: { deliveryFee: 4.5, serviceFee: 1.5 },
  ES: { deliveryFee: 4, serviceFee: 1.25 },
  GB: { deliveryFee: 3.5, serviceFee: 1.25 },
  EG: { deliveryFee: 25, serviceFee: 10 },
  DEFAULT: { deliveryFee: 5, serviceFee: 2 }
};

export interface CartStore extends PersistedCart {
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setPromo: (code: string | null, discount: number) => void;
  getSubtotal: () => number;
  getTotal: (countryCode: string | null | undefined) => number;
  getItemCount: () => number;
}

function readCart(): PersistedCart {
  const value = MMKVStorage.getItem(STORAGE_KEY);
  if (!value) return { items: [], cookId: null, promoCode: null, discount: 0 };
  try {
    return JSON.parse(value) as PersistedCart;
  } catch {
    return { items: [], cookId: null, promoCode: null, discount: 0 };
  }
}

function persist(state: PersistedCart): void {
  MMKVStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function lineTotal(item: CartItem): number {
  return (item.unitPrice + item.extras.reduce((sum, extra) => sum + extra.price, 0)) * item.quantity;
}

export function getPaymentMethods(countryCode: string | null | undefined): string[] {
  return COUNTRIES.find((country) => country.code === countryCode)?.paymentMethods ?? COUNTRIES.find((country) => country.code === "OTHER")!.paymentMethods;
}

export const useCartStore = create<CartStore>((set, get) => ({
  ...readCart(),
  addItem(item) {
    set((state) => {
      const next = {
        ...state,
        cookId: item.cookId,
        items: [...state.items, { ...item, id: `${item.dishId}-${Date.now()}` }]
      };
      persist(next);
      return next;
    });
  },
  removeItem(id) {
    set((state) => {
      const items = state.items.filter((item) => item.id !== id);
      const next = { ...state, items, cookId: items[0]?.cookId ?? null };
      persist(next);
      return next;
    });
  },
  updateQuantity(id, quantity) {
    set((state) => {
      const next = { ...state, items: state.items.map((item) => item.id === id ? { ...item, quantity: Math.min(20, Math.max(1, quantity)) } : item) };
      persist(next);
      return next;
    });
  },
  clearCart() {
    const next = { items: [], cookId: null, promoCode: null, discount: 0 };
    persist(next);
    set(next);
  },
  setPromo(code, discount) {
    set((state) => {
      const next = { ...state, promoCode: code, discount };
      persist(next);
      return next;
    });
  },
  getSubtotal() {
    return get().items.reduce((sum, item) => sum + lineTotal(item), 0);
  },
  getTotal(countryCode) {
    const fees = FEE_CONFIG[countryCode ?? ""] ?? FEE_CONFIG.DEFAULT;
    return Math.max(0, get().getSubtotal() + fees.deliveryFee + fees.serviceFee - get().discount);
  },
  getItemCount() {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  }
}));
