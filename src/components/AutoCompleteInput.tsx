"use client";

import { useEffect, useId, useRef, useState } from "react";

import { useKeyDown } from "../hooks/index.js";
import RawInput from "./RawInput.js";
import { type Either, isChildOf, isLeft, right } from "../util.js";
import { type FormError } from "./form.js";

export type AutoCompleteInputProps<T> = {
  required?: boolean;
  placeholder?: string;
  onChange?: (value: Either<FormError[], T | null>) => void;
  query: (text: string) => Promise<T[]>,
  suggestionKey: (suggestion: T) => any;
  renderSelection?: (item: T) => React.ReactNode;
  renderSuggestion?: (suggestion: T) => React.ReactNode;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
};

const identity = (value: any) => value;

function getter(key: any): (value: any) => any {
  if (typeof(key) === 'string') {
    return value => value[key];
  }
  if (typeof(key) === 'function') {
    return key;
  }
  throw new Error(`Could not lift ${key} into a getter`);
}

export function AutoCompleteInput<T>({
  required,
  placeholder,
  query,
  suggestionKey,
  renderSelection = identity,
  renderSuggestion = identity,
  onChange,
  onFocus,
  onBlur,
}: AutoCompleteInputProps<T>) {

  const getItemKey = getter(suggestionKey);

  // Unique ID shared by the label and the query input
  const id = useId();

  const [selection, setSelection] = useState(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<number | null>(null);

  // Used to detect whether the user clicked on the field or somewhere else
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const clickedRef = useRef<HTMLElement | null>(null);

  // Used to focus field when the field is cleared
  const inputRef = useRef<HTMLInputElement>(null);

  // Used to scroll to the selected suggestion when naviating with the keyboard
  const activeSuggestionRef = useRef<HTMLDivElement>(null);

  // State related to the suggestions
  const [isLoading, setIsLoading] = useState(false);
  const suggestionsRef = useRef<T[]>(undefined);
  const suggestions = suggestionsRef.current;

  const popupClassName = 'absolute bg-white border border-t-0 z-10000 rounded-b-md w-full ' + (open ? 'block' : 'hidden');

  const selected = (suggestions ?? []).find(item => getItemKey(item) === selection);

  // const blur = () => {
  //   const e = new CustomEvent('blur');
  //   if (onBlur !== undefined) {
  //     onBlur(e);
  //   }
  //   if (!e.defaultPrevented) {
  //     setOpen(false);
  //   }
  // }

  const clear = () => {

    if (onChange !== undefined) {
      // TODO enable e.preventDefault()
      onChange(right(null));
    }
    setSelection(null);

    // We use a timeout because the input element must be renderered first
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);

  }

  const select = (item: T) => {
    if (onChange !== undefined) {
      // TODO enable e.preventDefault()
      onChange(right(item));
    }
    setSelection(getItemKey(item));
  }

  const selectIndex = (i: number) => {
    if (suggestions) {
      select(suggestions[i]!);
    }
  }

  // This side-effect makes sure that if the user uses the keyboard to select a
  // suggestion then the suggestion will always be scrolled into view.
  useEffect(() => {
    const element = activeSuggestionRef.current;
    if (element !== null) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [ activeSuggestionRef.current ]);

  // This hook call enables the user to press the arrow keys to navigate the sugggestions
  useKeyDown(e => {
    if (!open || !suggestions) {
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIndex(i => i === null ? 0 : i === suggestions.length-1 ? null : i+1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIndex(i => i === null ? suggestions.length-1 : i === 0 ? null : i-1);
        break;
      case 'Enter':
        if (index !== null) {
          e.preventDefault();
          selectIndex(index);
        }
        break;
    }
  }, [ suggestions, index ]);

  // Tracks what field is clicked so that blurring might be prevented
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      clickedRef.current = e.target as HTMLElement | null;
    };
    window.addEventListener('mousedown', handler);
    return () => {
      window.removeEventListener('mousedown', handler);
    }
  }, []);

  if (selected !== undefined) {
    return (
      <div className="flex rounded-md border border-gray-200 bg-gray-200 p-2">
        <span className="flex-1">{renderSelection(selected)}</span>
        <span className="cursor-pointer flex-none text-sm text-white bg-gray-700 hover:bg-gray-600 rounded-full p-1" onClick={clear}>X</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <RawInput
        id={id}
        ref={inputRef}
        type="text"
        bottom={open}
        className={open ? 'border-b-0' : ''}
        placeholder={placeholder}
        onFocus={e => {
          if (onFocus !== undefined) {
            onFocus(e);
          }
          if (!e.defaultPrevented) {
            setOpen(true)
          }
        }}
        onBlur={e => {
          if (clickedRef.current && popupRef.current && isChildOf(clickedRef.current, popupRef.current)) {
            clickedRef.current = null; // TODO might need to place this in another event handler
            e.preventDefault();
            return;
          }
          if (onBlur !== undefined) {
            onBlur(e);
          }
          if (!e.defaultPrevented) {
            setOpen(false);
          }
        }}
        onChange={async result => {
          if (isLeft(result)) {
            // In theory this should never happen how this field is configured.
            return;
          }
          setIsLoading(true);
          let data;
          try {
            data = await query(result.value)
          } catch (error) {
            return;
          }
          setIsLoading(false);
          suggestionsRef.current = data;
        }}
      />
      <div ref={popupRef} className={popupClassName}>
        <hr className="mx-2" />
        {isLoading
          ? <div className="p-2">{fill(i => <SkelCard key={i} />, 3)}</div>
          : !suggestions || suggestions.length === 0
          ? <div className="text-center grid place-items-center p-2">
              <p className="text-4xl">?</p>
              <p className="text-sm">Geen suggesties gevonden. Probeer een andere zoekopdracht.</p>
            </div>
          : <div className="overflow-auto max-h-64">
              {suggestions.map((item, i) => {
                let className = "cursor-pointer p-2 duration-150 ease-in-out";
                if (i === index) {
                  className += ' pl-4 bg-red-300'
                }
                return (
                  <div
                    key={getItemKey(item)}
                    ref={i === index ? activeSuggestionRef : null}
                    onMouseOver={() => setIndex(i)}
                    className={className}
                    onClick={() => { select(item); }}
                  >
                    {renderSuggestion(item)}
                  </div>
                );
              })}
            </div>
        }
      </div>
    </div>
  );
}

function fill<T>(factory: (i: number) => T, count: number): T[] {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(factory(i));
  }
  return out;
}

function SkelCard() {
  return (
    <div className="flex animate-pulse space-x-4">
      <div className="size-10 rounded-full bg-gray-200"></div>
      <div className="flex-1 space-y-6 py-1">
        <div className="h-2 rounded bg-gray-200"></div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 h-2 rounded bg-gray-200"></div>
            <div className="col-span-1 h-2 rounded bg-gray-200"></div>
          </div>
          <div className="h-2 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

