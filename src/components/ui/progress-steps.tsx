"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface Step {
  id: string;
  label: string;
}

export interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function ProgressSteps({
  steps,
  currentStep,
  className,
}: ProgressStepsProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              index < currentStep
                ? "bg-primary"
                : index === currentStep
                ? "bg-primary"
                : "bg-gray-200"
            )}
          />
        ))}
      </div>

      {/* Step indicator text */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="font-medium text-gray-700">
          {steps[currentStep]?.label}
        </span>
      </div>
    </div>
  );
}

// Alternative circular progress indicator
export interface CircularProgressProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function CircularProgress({
  steps,
  currentStep,
  className,
}: CircularProgressProps) {
  return (
    <nav className={cn("flex items-center justify-center", className)}>
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200",
                index < currentStep
                  ? "bg-primary text-white"
                  : index === currentStep
                  ? "bg-primary text-white ring-4 ring-primary-100"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {index < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 mx-1",
                  index < currentStep ? "bg-primary" : "bg-gray-200"
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
