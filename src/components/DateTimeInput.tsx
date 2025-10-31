import { useId, useRef, useState } from "react";

import { DateInput } from "./DateInput.js";
import { TimeInput } from "./TimeInput.js";
import { type Either, isLeft, left, right, type XDate, type XTime } from "../util.js";
import { type  FormError } from "./form.js";

export type HandlerFn<T = Date> = (date: Date) => Generator<FormError, T>;

export type ChangeFn<T = Date> = (value: Either<FormError[], T>) => void;

export type DateTimeInputProps<T = Date> = {
  required?: boolean;
  handler?: HandlerFn<T>;
  onChange?: ChangeFn<T>;
  past?: boolean;
  future?: boolean;
};

function* identity<T>(value: T): Generator<FormError, T> {
  return value;
}

export function DateTimeInput<T = Date>({
  required,
  handler = identity as HandlerFn<T>,
  onChange,
  past,
  future,
}: DateTimeInputProps<T>) {

  const dateRef = useRef<Either<FormError[], XDate>>(left([]));
  const timeRef = useRef<Either<FormError[], XTime>>(left([]));

  const [hasErrors, setHasErrors] = useState(false);

  // TODO actually use this to make the label clickable
  const dateInputId = useId();

  const update = () => {
    let result;
    const errors = [];
    if (isLeft(dateRef.current) || isLeft(timeRef.current)) {
      if (isLeft(dateRef.current)) {
        errors.push(...dateRef.current.value);
      }
      if (isLeft(timeRef.current)) {
        errors.push(...timeRef.current.value);
      }
      result = left(errors);
      setHasErrors(errors.length > 0);
    } else {
      const [year, month, day] = dateRef.current.value;
      const [hour, minute] = timeRef.current.value;
      const date = new Date(year, month, day, hour, minute);
      const now = new Date();
      now.setSeconds(0);
      now.setMilliseconds(0);
      if (future && date < now) {
        errors.push({ message: 'De geselecteerde datum moet in de toekomst liggen.' });
      }
      if (past && date > now) {
        errors.push({ message: 'De geselecteerde datum moet in het verleden liggen.' });
      }
      let out;
      const iter = handler(date);
      for (;;) {
        const { done, value } = iter.next();
        if (done) {
          out = value;
          break;
        } else {
          errors.push(value);
        }
      }
      setHasErrors(errors.length > 0);
      result = errors.length > 0 ? left(errors) : right(out);
    }
    if (onChange !== undefined) {
      onChange(result);
    }
  }

  let inputClassName = "flex items-center relative border rounded-md w-full";
  if (hasErrors) {
    inputClassName += " border-red-500";
  }
  return (
    <div className={inputClassName}>
      <DateInput
        bare
        onChange={result => {
          dateRef.current = result;
          update();
        }}
      />
      <TimeInput
        bare
        onChange={result => {
          timeRef.current = result;
          update();
        }}
      />
    </div>
  );
}

export default DateTimeInput;
