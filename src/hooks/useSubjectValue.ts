
import type { BehaviorSubject } from "rxjs";
import { useEffect } from "react";

import { useForceUpdate } from "./useForceUpdate.js";

export function useSubjectValue<T>(subject: BehaviorSubject<T>): T {
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    const subscription = subject.subscribe(forceUpdate);
    return () => { subscription.unsubscribe(); }
  }, [ subject ]);
  return subject.value;
}

