"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const checkboxId = id || React.useId();

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            className={cn(
              "h-5 w-5 rounded border-2 cursor-pointer",
              "transition-colors duration-150",
              "text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2",
              error ? "border-error" : "border-gray-300 hover:border-gray-400",
              "checked:bg-primary checked:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${checkboxId}-error`
                : description
                ? `${checkboxId}-description`
                : undefined
            }
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "text-sm font-medium cursor-pointer",
                  props.disabled ? "text-gray-400" : "text-gray-700"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                id={`${checkboxId}-description`}
                className="text-sm text-gray-500"
              >
                {description}
              </p>
            )}
            {error && (
              <p id={`${checkboxId}-error`} className="text-sm text-error mt-1">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
