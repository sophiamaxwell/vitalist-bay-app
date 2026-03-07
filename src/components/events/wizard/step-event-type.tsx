"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useEventWizard } from "@/lib/stores/event-wizard-store";
import {
  eventTypeSchema,
  EventTypeFormData,
  EVENT_TYPES,
} from "@/lib/validations/event";
import {
  Building2,
  Users,
  Landmark,
  Briefcase,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  exhibition: Building2,
  conference: Users,
  congress: Landmark,
  corporate: Briefcase,
  other: LayoutGrid,
};

export function StepEventType() {
  const { state, updateData, nextStep } = useEventWizard();

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<EventTypeFormData>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: {
      eventType: state.data.eventType,
    },
  });

  const selectedType = watch("eventType");

  const onSubmit = (data: EventTypeFormData) => {
    updateData(data);
    nextStep();
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          What type of event are you creating?
        </h1>
        <p className="text-gray-600">
          Select the type that best describes your event
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
        <div className="space-y-3 mb-8">
          {EVENT_TYPES.map((type) => {
            const Icon = iconMap[type.value];
            const isSelected = selectedType === type.value;

            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setValue("eventType", type.value)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                  isSelected
                    ? "border-primary bg-primary-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-lg",
                    isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span
                    className={cn(
                      "font-medium text-lg",
                      isSelected ? "text-primary-700" : "text-gray-900"
                    )}
                  >
                    {type.label}
                  </span>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    isSelected ? "border-primary bg-primary" : "border-gray-300"
                  )}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {errors.eventType && (
          <p className="text-error text-sm text-center mb-4">
            {errors.eventType.message}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
