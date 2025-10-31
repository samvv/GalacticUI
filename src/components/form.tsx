
import { createContext, useContext, useEffect, useMemo } from "react";
import { BehaviorSubject } from "rxjs";

import { Button, type ButtonProps } from "./Button.js";
import { useSubjectState } from "../hooks/index.js";

export type SubmitHandler = (obj: Record<string, any>) => void;

export type FormError = { message: string };

export type FormErrors = FormError[];

class FormManager {

  public values = new Map<string, BehaviorSubject<any>>();
  public errors = new Map<string, BehaviorSubject<FormErrors>>();

  public onSubmit?: SubmitHandler;

  // public setValue(name: string, value: any): void {
  //   let subject = this.values.get(name);
  //   if (subject === undefined) {
  //     subject = new BehaviorSubject(value);
  //     this.values.set(name, subject);
  //   } else {
  //     subject.next(value);
  //   }
  // }

  // public getValue(name: string): any {
  //   return this.values.get(name)?.value;
  // }

  public submit(): void {
    if (this.onSubmit === undefined) {
      return;
    }
    const obj = {} as Record<string, any>;
    for (const [name, subject] of this.values) {
      obj[name] = subject.value;
    }
    this.onSubmit(obj);
  }

}

type SetErrorsFn = (errors: FormErrors) => void;

const ErrorsContext = createContext<SetErrorsFn | undefined>(undefined);

export type FieldErrorsProviderProps = {
  children: React.ReactNode;
  setErrors: SetErrorsFn;
};

export function FormErrorBoundary({
  children,
  setErrors,
}: FieldErrorsProviderProps) {
  return (
    <ErrorsContext.Provider value={setErrors}>
      {children}
    </ErrorsContext.Provider>
  );
}

export function useHasErrors(): boolean {
  // TODO must be implemented
  return false;
}

export function useSetErrors(): SetErrorsFn | undefined {
  return useContext(ErrorsContext);
}

const FormContext = createContext<FormManager | null>(null);

export function useFormManager(): FormManager {
  const manager = useContext(FormContext);
  if (manager === null) {
    errorFieldNotInsideForm();
  }
  return manager;
}

function errorFieldNotInsideForm(): never {
  throw new Error(`A field was rendered without encompassing <Form />. Please check your code.`);
}

// class FieldErrorsModifier {

//   public constructor(
//     private subject: BehaviorSubject<Errors>,
//   ) {
//   }

//   public add(message: string): void {
//     this.subject.next([...this.subject.value, message]);
//   }

//   public clear(): void {
//     this.subject.next([]);
//   }

//   public get size(): number {
//     return this.subject.value.length;
//   }

// }

// export function useFieldErrorsModifier(name: string): FieldErrorsModifier {
//   const manager = useFormManager();
//   let subject = manager.errors.get(name);
//   if (subject === undefined) {
//     subject = new BehaviorSubject<Errors>([]);
//     manager.errors.set(name, subject);
//   }
//   return new FieldErrorsModifier(subject);
// }

// export function useFieldErrors(name: string): string[] {
//   const manager = useFormManager();
//   let subject = manager.errors.get(name);
//   if (subject === undefined) {
//     subject = new BehaviorSubject<Errors>([]);
//     manager.errors.set(name, subject);
//   }
//   return useSubjectValue(subject);
// }

export function useFieldValue<T = any>(name: string): [ T, (newValue: T) => void ] {
  const manager = useFormManager();
  let subject = manager.values.get(name);
  if (subject === undefined) {
    subject = new BehaviorSubject(undefined);
    manager.values.set(name, subject);
  }
  return useSubjectState(subject);
}

export type FormProps = {
  onSubmit?: SubmitHandler;
  children: React.ReactNode;
};

export function Form({
  onSubmit,
  children,
}: FormProps) {
  const manager = useMemo(() => new FormManager(), []);
  useEffect(() => {
    manager.onSubmit = onSubmit;
  }, [ onSubmit ]);
  return (
    <form onSubmit={e => {
      e.preventDefault();
      manager.submit();
    }}>
      <FormContext.Provider value={manager}>
        {children}
      </FormContext.Provider>
    </form>
  );
}

export type SubmitProps = Omit<ButtonProps, 'type'>;

export function Submit(props: SubmitProps) {
  return <Button {...props} type="submit" />;
}
