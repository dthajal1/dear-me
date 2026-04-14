import { openDB, type IDBPDatabase, type DBSchema } from "idb";
import { DB_NAME, SCHEMA_VERSION, STORE_MEMOS, type Memo } from "./schema";

interface DearMeDB extends DBSchema {
  [STORE_MEMOS]: {
    key: string;
    value: Memo;
    indexes: {
      "by-createdAt": number;
      "by-status": string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<DearMeDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<DearMeDB>> {
  if (typeof window === "undefined") {
    throw new Error("getDb() called on the server — this is a client-only module");
  }
  if (!dbPromise) {
    dbPromise = openDB<DearMeDB>(DB_NAME, SCHEMA_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore(STORE_MEMOS, { keyPath: "id" });
          store.createIndex("by-createdAt", "createdAt");
          store.createIndex("by-status", "status");
        }
      },
    });
  }
  return dbPromise;
}
