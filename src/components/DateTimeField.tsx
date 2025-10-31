
import { DateTimeInput, type DateTimeInputProps } from "./DateTimeInput.js";
import { type FieldProps, makeSimpleField } from "./Field.js";

export type DateTimeFieldProps = DateTimeInputProps & Pick<FieldProps, 'name' | 'label'>;

export const DateTimeField = makeSimpleField(DateTimeInput);
