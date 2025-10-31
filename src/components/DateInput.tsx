import { type XDate } from "../util.js";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { RawInput, type RawInputProps } from "./RawInput.js";
import type { FormError } from "./form.js";

export type DateInputProps = {
  past?: boolean;
  future?: boolean;
} & RawInputProps<XDate>;

const DATE_REGEX = /^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month+1, 0).getDate();
}

export function DateInput({
  past,
  future,
  ...props
}: DateInputProps) {

  // Whether the date picker popup is open
  const [open, setOpen] = useState(false);

  function* validateDate(text: string): Generator<FormError, XDate | undefined> {
      const now = new Date();
      const matches = DATE_REGEX.exec(text);
      if (matches === null) {
        yield { message: `Dit is geen geldige datum. Een datum is bijvoorbeeld 19/03/2025.` };
        return;
      }
      const year = Number(matches[3]);
      const month = Number(matches[2])-1;
      if (month < 0) {
        yield { message: `Maand moet groter of gelijk aan 1 zijn.` };
      } else if (month >= 12) {
        yield { message: `Maand moet kleiner of gelijk aan 12 zijn.` };
      }
      const day = Number(matches[1]);
      const daysInMonth = getDaysInMonth(year, month);
      if (day < 1) {
        yield { message: `Dag moet groter of gelijk aan 1 zijn.` };
      } else if (day > daysInMonth) {
        yield { message: `Dag mag niet groter dan ${daysInMonth} zijn.` };
      }
      const date = new Date(year, month, day);
      if (past && date > now) {
        yield { message: `U mag enkel datum in het verleden selecteren.` };
        return;
      }
      if (future && date < now) {
        yield { message: `U mag enkel een datum in de toekomst selecteren.` };
        return;
      }
      return [year, month, day];
  }

  return (
    <RawInput
      icon={faCalendarDays}
      handler={validateDate}
      onFocus={() => setOpen(true) }
      maxLength={10}
      {...props}
    />
  );

}

export default DateInput;
