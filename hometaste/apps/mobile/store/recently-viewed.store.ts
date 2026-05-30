import { create } from "zustand";
import { MMKVStorage } from "../utils/mmkv";

const STORAGE_KEY = "items";

export interface RecentlyViewedItem {
  id: string;
  type: "dish" | "cook";
  viewedAt: number;
}

interface RecentlyViewedStore {
  items: RecentlyViewedItem[];
  addItem: (id: string, type: RecentlyViewedItem["type"]) => void;
}

function readItems(): RecentlyViewedItem[] {
  const value = MMKVStorage.getItem(STORAGE_KEY);
  if (!value) return [];
  try {
    return JSON.parse(value) as RecentlyViewedItem[];
  } catch {
    return [];
  }
}

function writeItems(items: RecentlyViewedItem[]): void {
  MMKVStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>((set) => ({
  items: readItems(),
  addItem(id, type) {
    set((state) => {
      const next = [{ id, type, viewedAt: Date.now() }, ...state.items.filter((item) => item.id !== id || item.type !== type)].slice(0, 10);
      writeItems(next);
      return { items: next };
    });
  }
}));
