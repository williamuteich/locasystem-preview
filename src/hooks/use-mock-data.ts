import { useEffect, useState } from "react";
import { mockDb, subscribe } from "@/lib/mock-data";

export function useMockData<T>(selector: (db: typeof mockDb) => T): T {
  const [value, setValue] = useState<T>(() => selector(mockDb));
  useEffect(() => {
    const unsub = subscribe(() => setValue(selector(mockDb)));
    return () => {
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
