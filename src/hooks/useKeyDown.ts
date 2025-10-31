
import { useCallback, useEffect } from "react";

export function useKeyDown(fn: (e: KeyboardEvent) => void, deps: any[]) {
  const callback = useCallback(fn, deps);
  useEffect(() => {
    window.addEventListener('keydown', callback);
    return () => {
      window.removeEventListener('keydown', callback);
    }
  }, [ callback ]);
}
