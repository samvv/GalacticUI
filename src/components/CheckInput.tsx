import { useId } from "react";

export type CheckInputProps = {
  text?: React.ReactNode;
  onChange?: (value: boolean) => void;
};

export function CheckInput({
  text,
  onChange,
}: CheckInputProps) {
  const inputId = useId();
  return (
    <div className="flex items-center">
      <input
        id={inputId}
        type="checkbox"
        className="size-5"
        onChange={e => {
          if (onChange !== undefined) {
            onChange(e.currentTarget.checked);
          }
        }}
      />
      {text && <label htmlFor={inputId} className="font-bold p-2">{text}</label>}
    </div>
  );
}
