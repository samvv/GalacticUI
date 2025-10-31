import { faClock } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { RawInput, type RawInputProps } from "./RawInput.js";

import { type XTime } from "../util.js";
import { type FormError } from "./form.js";

export type TimeInputProps = RawInputProps<XTime> & {
  past?: boolean;
  future?: boolean;
};

const TIME_REGEX = /^(\d{2}):(\d{2})$/;

export function TimeInput({
  past,
  future,
  ...props
}: TimeInputProps) {

  const [open, setOpen] = useState(false);

  function* handleTime(text: string): Generator<FormError, XTime | undefined> {
    const matches = TIME_REGEX.exec(text);
    if (matches === null) {
      yield { message: 'Ongelid tijdsformaat. Voer een tijd in zoals 12:30 of 22:41.' };
      return;
    }
    const hours = Number(matches[1]);
    const minutes = Number(matches[2]);
    const now = new Date();
    if (past && (hours < now.getHours() || (hours === now.getHours() && minutes < now.getMinutes()))) {
      yield { message: 'Het tijdstip moet in het verleden liggen.' };
    } else if (future && (hours > now.getHours() || (hours === now.getHours() && minutes > now.getMinutes()))) {
      yield { message: 'Het tijdstip moet in de toekomst liggen.' };
    } else {
      return [hours, minutes];
    }
  }

  return (
    <RawInput
      icon={faClock}
      handler={handleTime}
      onFocus={() => setOpen(true)}
      maxLength={5}
      {...props}
    />
  );
}
