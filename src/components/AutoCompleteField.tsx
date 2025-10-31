import { AutoCompleteInput } from "./AutoCompleteInput.js";
import { makeSimpleField } from "./Field.js";

export const AutoCompleteField = makeSimpleField(AutoCompleteInput);

export type AutoCompleteFieldProps = React.ComponentPropsWithRef<typeof AutoCompleteField>;
