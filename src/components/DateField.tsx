import { type DateInputProps, DateInput } from "./DateInput.js";
import { type FieldProps, makeSimpleField } from "./Field.js";

export type DateFieldProps = DateInputProps & FieldProps;

export const DateField = makeSimpleField(DateInput);

// export function DateField({
//   name,
// }: DateFieldProps) {
//   return (
//     <Field name={name}>
//       <DateInput name={name} />
//     </Field>
//   );
// }
