import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconProp as FontAwesomeIconProp } from "@fortawesome/fontawesome-svg-core";
import { useId, useState } from "react";

import { type FormError } from "./form.js";
import { assert, type Either, left as makeLeft, right as makeRight } from "./util.js";

export type HandlerFn<T, R = T> = (value: T) => Generator<FormError, R | undefined>;

export type ChangeFn<T> = (result: Either<FormError[], T>) => void;

export type RawInputProps<T> = Omit<React.HTMLProps<HTMLInputElement>, 'onChange'> & {
  onChange?: ChangeFn<T>;
  required?: boolean;
  bare?: boolean;
  regex?: RegExp;
  icon?: FontAwesomeIconProp,
  top?: boolean;
  left?: boolean;
  bottom?: boolean;
  right?: boolean;
  handler?: HandlerFn<string, T>;
};

function* identity(value: string): Generator<FormError, string | undefined> {
  return value;
};

function composeHandlers<T1, T2, T3>(a: HandlerFn<T2, T3>, b: HandlerFn<T1, T2>): HandlerFn<T1, T3>;

function composeHandlers(...handlers: HandlerFn<any, any>[]): HandlerFn<any, any> {
  return function*(value: any) {
    let out = value;
    for (let i = handlers.length; --i >= 0; ) {
      const handler = handlers[i];
      const iter = handler(out);
      for (;;) {
        const { done, value } = iter.next();
        if (done) {
          out = value;
          break;
        } else {
          yield value;
        }
      }
    }
    return out;
  }
}

export function RawInput<T = string>({
  className: extraClassName,
  icon,
  handler = identity as HandlerFn<string, T>,
  onChange,
  id,
  regex,
  bare = false,
  top = false,
  left = false,
  bottom = false,
  right = false,
  ...props
}: RawInputProps<T>) {

  if (regex !== undefined) {
    handler = composeHandlers(
      handler,
      function* (value: string) {
        if (!regex.test(value)) {
          yield { message: 'De opgegeven tekst kwam niet overeen met het gevraagde patroon.' };
        }
        return value;
      },
    );
  }

  const inputId = useId();

  const [hasErrors, setHasErrors] = useState(false);

  let wrapperClassName = 'flex size-full text-md bg-grey-50 active:bg-white';
  if (!bare) {
    wrapperClassName += ' border';
    if (hasErrors) {
      wrapperClassName += ' border-red-400';
    } else {
      wrapperClassName += ' border-black';
    }
    const corners = getCorners(top, left, bottom, right);
    if (corners & Corner.TopLeft) {
      wrapperClassName += ' rounded-tl-md';
    }
    if (corners & Corner.TopRight) {
      wrapperClassName += ' rounded-tr-md';
    }
    if (corners & Corner.BottomLeft) {
      wrapperClassName += ' rounded-bl-md';
    }
    if (corners & Corner.BottomRight) {
      wrapperClassName += ' rounded-br-md';
    }
  }
  if (extraClassName) {
    wrapperClassName += ' ' + extraClassName;
  }

  let iconClassName = "";
  if (hasErrors) {
    iconClassName += " text-red-500";
  }

  return (
    <div className={wrapperClassName}>
      {icon && (
        <label htmlFor={inputId} className="cursor-pointer p-2">
          <FontAwesomeIcon icon={icon} size="lg" className={iconClassName} />
        </label>
      )}
      <input
        {...props}
        id={id ?? inputId}
        onInput={e => {
          const errors: FormError[] = [];
          const iter = handler(e.currentTarget.value);
          let out: T | undefined;
          for (;;) {
            const { done, value } = iter.next();
            if (done) {
              out = value;
              break;
            }
            errors.push(value);
          }
          setHasErrors(errors.length > 0);
          if (onChange !== undefined) {
            if (errors.length > 0) {
              // assert(out === undefined);
              onChange(makeLeft(errors));
            } else {
              assert(out !== undefined);
              onChange(makeRight(out));
            }
          }
        }}
        className="outline-none p-2 w-full"
      />
    </div>
  );
}

export const enum Corner {

  TopLeft = 1,
  TopRight = 2,
  BottomLeft = 4,
  BottomRight = 8,

  // Derived directions
  Top = TopLeft | TopRight,
  Left = TopLeft | BottomLeft,
  Bottom = BottomLeft | BottomRight,
  Right = TopRight | BottomRight,
}

function getCorners(top: boolean, left: boolean, bottom: boolean, right: boolean): Corner {
  let out = ~0;
  if (top) {
    out &= ~Corner.Top;
  }
  if (left) {
    out &= ~Corner.Left;
  }
  if (bottom) {
    out &= ~Corner.Bottom;
  }
  if (right) {
    out &= ~Corner.Right;
  }
  return out;
}

export default RawInput;
