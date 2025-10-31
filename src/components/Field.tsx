import { type FormError, useFieldValue } from "./form.js";
import { type Either, isLeft, isRight } from "../util.js";
import { useState } from "react";

export type FieldProps = {
  name: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
};

// TODO make the label clickable

// export function Field({
//   name,
//   label,
//   children,
// }: FieldProps) {
//   const [errors, setErrors] = useState<FormErrors>([]);
//   return (
//     <FormErrorBoundary setErrors={setErrors}>
//       <div className="my-4">
//         {label && <label className="font-bold">{label}</label>}
//         {children}
//         {errors.map(({ message }) => <p className="text-sm text-red-500">{message}</p>)}
//       </div>
//     </FormErrorBoundary>
//   );
// }

type GenericInputProps<T> = {
  // value?: T;
  onChange?: (result: Either<FormError[], T>) => void;
};

export function makeSimpleField<T, P>(Input: React.ComponentType<P & GenericInputProps<T>>) {
  return function ({ name, label, hint, onChange, ...props }: FieldProps & GenericInputProps<T> & P) {
    const [errors, setErrors] = useState<FormError[]>([]);
    const [value, setValue] = useFieldValue(name);
    return (
      <div className="my-4">
        {label && <label className="block font-bold my-1">{label}</label>}
        <Input
          onChange={result => {
            if (onChange !== undefined) {
              onChange(result);
            }
            // TODO maybe add e.defaultPrevented check
            setErrors(isLeft(result) ? result.value : []);
            if (isRight(result)) {
              setValue(result.value);
            }
          }}
          {...(props as P)}
        />
        {hint && <span className="block text-sm text-gray-500 my-1">{hint}</span>}
        {errors.map(({ message }) => <p className="text-sm text-red-500">{message}</p>)}
      </div>
    );
  }
}

