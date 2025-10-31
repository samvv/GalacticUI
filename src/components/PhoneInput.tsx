import { RawInput, type RawInputProps } from "./RawInput.js";

const PHONE_REGEX = /^(\+32[1-9][0-9]{7,8}|0?[1-9][0-9]{7,8})$/;

export type PhoneInputProps = RawInputProps<string>;

export function PhoneInput({
  regex: extraRegex,
  ...props
}: PhoneInputProps) {
  return <RawInput
    regex={PHONE_REGEX}
    {...props}
  />
}
