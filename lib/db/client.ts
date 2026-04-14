import { openDB, type IDBPDatabase, type DBSchema } from "idb";
import {
  DB_NAME,
  SCHEMA_VERSION,
  STORE_CHECK_INS,
  STORE_INSIGHT_THREADS,
  STORE_MEMOS,
  type CheckIn,
  type InsightThread,
  type Memo,
} from "./schema";

interface DearMeDB extends DBSchema {
  [STORE_MEMOS]: {
    key: string;
    value: Memo;
    indexes: {
      "by-createdAt": number;
      "by-status": string;
    };
  };
  [STORE_INSIGHT_THREADS]: {
    key: string;
    value: InsightThread;
    indexes: {
      "by-updatedAt": number;
    };
  };
  [STORE_CHECK_INS]: {
    key: string;
    value: CheckIn;
    indexes: {
      "by-createdAt": number;
      "by-source": string;
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
          const memos = db.createObjectStore(STORE_MEMOS, { keyPath: "id" });
          memos.createIndex("by-createdAt", "createdAt");
          memos.createIndex("by-status", "status");
        }
        if (oldVersion < 2) {
          const threads = db.createObjectStore(STORE_INSIGHT_THREADS, {
            keyPath: "id",
          });
          threads.createIndex("by-updatedAt", "updatedAt");
        }
        if (oldVersion < 3) {
          const checkIns = db.createObjectStore(STORE_CHECK_INS, {
            keyPath: "id",
          });
          checkIns.createIndex("by-createdAt", "createdAt");
          checkIns.createIndex("by-source", "source");
        }
      },
      blocked() {
        console.warn(
          "[dear-me] insights schema upgrade blocked by another tab holding the old version",
        );
      },
      blocking() {
        // We're the old-version holder while another tab tries to upgrade.
        // Close our connection AND null the cached promise so the next getDb()
        // call re-invokes openDB at the new version instead of handing back a
        // closed connection.
        dbPromise?.then((db) => db.close()).catch(() => undefined);
        dbPromise = null;
      },
    });
  }
  return dbPromise;
}
