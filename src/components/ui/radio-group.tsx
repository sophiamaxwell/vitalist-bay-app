"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  orientation?: "vertical" | "horizontal";
  variant?: "default" | "card";
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  error,
  required,
  orientation = "vertical",
  variant = "default",
}: RadioGroupProps) {
  const groupId = React.useId();

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <div
        className={cn(
          "flex gap-3",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap"
        )}
        role="radiogroup"
        aria-labelledby={label ? `${groupId}-label` : undefined}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex items-start cursor-pointer",
              variant === "card" &&
                "border-2 rounded-lg p-4 transition-all duration-200",
              variant === "card" &&
                value === option.value &&
                "border-primary bg-primary-50",
              variant === "card" &&
                value !== option.value &&
                "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
              option.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange?.(option.value)}
              disabled={option.disabled}
              className={cn(
                "h-5 w-5 mt-0.5 cursor-pointer",
                "text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2",
                "border-2 border-gray-300",
                option.disabled && "cursor-not-allowed"
              )}
            />
            <div className="ml-3">
              <span
                className={cn(
                  "text-sm font-medium",
                  option.disabled ? "text-gray-400" : "text-gray-900"
                )}
              >
                {option.label}
              </span>
              {option.description && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
