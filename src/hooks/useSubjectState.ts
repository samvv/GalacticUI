
import type { BehaviorSubject } from "rxjs";

import { useSubjectValue } from "./useSubjectValue.js";

export function useSubjectState<T>(subject: BehaviorSubject<T>): [T, (value: T) => void] {
  return [
    useSubjectValue(subject),
    subject.next.bind(subject),
  ]
}

