import { useEffect } from "react";
import { useRecentlyViewedStore, type RecentlyViewedItem } from "../store/recently-viewed.store";

export function useRecentlyViewed(id: string, type: RecentlyViewedItem["type"]): void {
  const addItem = useRecentlyViewedStore((state) => state.addItem);

  useEffect(() => {
    addItem(id, type);
  }, [addItem, id, type]);
}
