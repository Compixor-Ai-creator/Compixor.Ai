'use client';

import React, { useMemo } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';

export interface CxSelectOption<T extends string | number = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface CxSelectProps<T extends string | number = string> {
  value: T;
  onChange: (value: T) => void;
  options: (CxSelectOption<T> | T)[];
  placeholder?: string;
  ariaLabel?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  optionsClassName?: string;
  size?: 'sm' | 'md';
}

export default function CxSelect<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  id,
  name,
  disabled = false,
  className = '',
  buttonClassName = '',
  optionsClassName = '',
  size = 'md',
}: CxSelectProps<T>) {
  // Normalize options into standard { value, label, disabled } structure
  const normalizedOptions = useMemo<CxSelectOption<T>[]>(() => {
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null && 'value' in opt) {
        return opt as CxSelectOption<T>;
      }
      return {
        value: opt as T,
        label: String(opt),
      };
    });
  }, [options]);

  // Find currently selected option for label display
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === value);
  }, [normalizedOptions, value]);

  const displayLabel = selectedOption ? selectedOption.label : placeholder || String(value || '');

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-1.5 text-xs rounded-lg min-h-[32px]'
      : 'px-3.5 py-2.5 text-xs sm:text-sm rounded-xl min-h-[42px]';

  return (
    <div className={`relative w-full ${className}`}>
      <Listbox value={value} onChange={onChange} disabled={disabled} name={name}>
        {({ open }) => (
          <>
            <ListboxButton
              id={id}
              aria-label={ariaLabel}
              className={`w-full flex items-center justify-between gap-2 text-left bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium shadow-2xs hover:border-brand-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${buttonClassName}`}
            >
              <span className="block truncate">{displayLabel}</span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                  open ? 'rotate-180 text-brand-500' : ''
                }`}
                aria-hidden="true"
              />
            </ListboxButton>

            <ListboxOptions
              transition
              className={`absolute left-0 mt-1.5 w-full max-h-60 overflow-auto rounded-xl p-1.5 dropdown-glass z-50 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl focus:outline-none transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 ${optionsClassName}`}
            >
              {normalizedOptions.map((opt) => (
                <ListboxOption
                  key={String(opt.value)}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="group flex items-center justify-between gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg cursor-pointer select-none text-zinc-700 dark:text-zinc-200 data-[focus]:bg-brand-500/10 data-[focus]:text-brand-600 dark:data-[focus]:text-brand-400 data-[selected]:font-semibold data-[selected]:text-brand-600 dark:data-[selected]:text-brand-400 data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed transition-colors"
                >
                  {({ selected }) => (
                    <>
                      <span className="block truncate">{opt.label}</span>
                      {selected && (
                        <Check className="w-4 h-4 text-brand-500 shrink-0" aria-hidden="true" />
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </>
        )}
      </Listbox>
    </div>
  );
}
