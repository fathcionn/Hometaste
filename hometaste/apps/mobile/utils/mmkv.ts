import type { StateStorage } from "zustand/middleware";

interface SyncStateStorage extends StateStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

const inMemory = new Map<string, string>();

const inMemoryStorage: SyncStateStorage = {
  getItem: (key) => inMemory.get(key) ?? null,
  setItem: (key, value) => {
    inMemory.set(key, value);
  },
  removeItem: (key) => {
    inMemory.delete(key);
  }
};

function createMMKVStorage(): SyncStateStorage {
  try {
    // Dynamic require prevents Expo Go / CI from crashing before fallback.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MMKV } = require("react-native-mmkv") as typeof import("react-native-mmkv");
    const storage = new MMKV({ id: "hometaste-store" });
    return {
      getItem: (key) => storage.getString(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key)
    };
  } catch {
    return inMemoryStorage;
  }
}

export const MMKVStorage: SyncStateStorage = createMMKVStorage();
