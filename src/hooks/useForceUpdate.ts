
import { useCallback, useState } from "react";

export function useForceUpdate(): VoidFunction {
  const [, setValue] = useState<Record<string, never>>(() => ({}));
  return useCallback((): void => {
    setValue({});
  }, []);
}

