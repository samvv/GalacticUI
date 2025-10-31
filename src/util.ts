
export function assert(test: boolean): asserts test {
  if (!test) {
    throw new Error(`Assertion failed. This is a bug. See the stack trace for more information.`);
  }
}

/**
 * Determine if one HTML element is logically within another HTML element.
 */
export function isChildOf(child: HTMLElement, parent: HTMLElement): boolean {
  let curr: HTMLElement | null = child;
  for (;;) {
    if (curr === parent) {
      return true;
    }
    curr = curr.parentElement;
    if (curr === null) {
      break;
    }
  }
  return false;
}

/**
 * A structure that only tracks the date and not the time.
 */
export type XDate = [year: number, month: number, day: number];

/**
 * A structure that only tracks the time up to the second and not the date.
 */
export type XTime = [hours: number, minutes: number, seconds?: number];

class Left<T> {

  public constructor(
    public value: T,
  ) {

  }

  public unwrap(): never {
    throw new Error(`Trying to unwrap a left-valued Either object with value ${this.value}.`);
  }

}

class Right<T> {

  public constructor(
    public value: T,
  ) {

  }

  public unwrap(): T {
    return this.value;
  }

}

export type { Left, Right };

export type Either<L, R> = Left<L> | Right<R>;

export function left<T>(value: T): Left<T> {
  return new Left(value);
}

export function right<T>(value: T): Right<T> {
  return new Right(value);
}

export function isLeft<L, R>(value: Either<L, R>): value is Left<L> {
  return value instanceof Left;
}

export function isRight<L, R>(value: Either<L, R>): value is Right<R> {
  return value instanceof Right;
}
