"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { useEventWizard } from "@/lib/stores/event-wizard-store";
import {
  eventDetailsSchema,
  EventDetailsFormData,
  EVENT_FORMATS,
  EVENT_SECTORS,
  TIMEZONES,
  LANGUAGES,
} from "@/lib/validations/event";
import { ArrowLeft, ArrowRight, MapPin, Globe, Laptop, Radio } from "lucide-react";

export function StepEventDetails() {
  const { state, updateData, nextStep, prevStep } = useEventWizard();

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<EventDetailsFormData>({
    resolver: zodResolver(eventDetailsSchema),
    defaultValues: {
      name: state.data.name || "",
      description: state.data.description || "",
      startDate: state.data.startDate || "",
      endDate: state.data.endDate || "",
      timezone: state.data.timezone || "America/Los_Angeles",
      language: state.data.language || "en",
      format: state.data.format || "IN_PERSON",
      sector: state.data.sector || "",
      venue: state.data.venue || "",
      address: state.data.address || "",
      city: state.data.city || "",
      country: state.data.country || "",
      virtualUrl: state.data.virtualUrl || "",
    },
  });

  const selectedFormat = watch("format");

  const onSubmit = (data: EventDetailsFormData) => {
    updateData(data);
    nextStep();
  };

  // Format options available for future UI enhancement
  void EVENT_FORMATS;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Tell us about your event
        </h1>
        <p className="text-gray-600">
          Fill in the details for your event
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
        {/* Event Name */}
        <Input
          label="Event name"
          placeholder="e.g., Tech Summit 2026"
          error={errors.name?.message}
          required
          {...register("name")}
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Describe your event..."
          rows={3}
          error={errors.description?.message}
          {...register("description")}
        />

        {/* Date/Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="datetime-local"
            label="Begins"
            error={errors.startDate?.message}
            required
            {...register("startDate")}
          />
          <Input
            type="datetime-local"
            label="Ends"
            error={errors.endDate?.message}
            required
            {...register("endDate")}
          />
        </div>

        {/* Timezone & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Time zone"
            options={TIMEZONES.map((tz) => ({ value: tz.value, label: tz.label }))}
            error={errors.timezone?.message}
            required
            {...register("timezone")}
          />
          <Select
            label="Default language"
            options={LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
            error={errors.language?.message}
            required
            {...register("language")}
          />
        </div>

        {/* Event Format */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Event format <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {EVENT_FORMATS.map((format) => {
              const isSelected = selectedFormat === format.value;
              const icons = {
                IN_PERSON: MapPin,
                VIRTUAL: Laptop,
                HYBRID: Radio,
              };
              const Icon = icons[format.value];

              return (
                <button
                  key={format.value}
                  type="button"
                  onClick={() => setValue("format", format.value)}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200",
                    isSelected
                      ? "border-primary bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6 mb-2",
                      isSelected ? "text-primary" : "text-gray-400"
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium text-sm",
                      isSelected ? "text-primary-700" : "text-gray-900"
                    )}
                  >
                    {format.label}
                  </span>
                  <span className="text-xs text-gray-500 text-center mt-1">
                    {format.description}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.format && (
            <p className="text-error text-sm">{errors.format.message}</p>
          )}
        </div>

        {/* Event Sector */}
        <Select
          label="Event sector"
          options={EVENT_SECTORS.map((s) => ({ value: s.value, label: s.label }))}
          placeholder="Select a sector"
          error={errors.sector?.message}
          required
          {...register("sector")}
        />

        {/* Location (conditional on format) */}
        {(selectedFormat === "IN_PERSON" || selectedFormat === "HYBRID") && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location Details
            </h3>
            <Input
              label="Venue name"
              placeholder="e.g., Convention Center"
              {...register("venue")}
            />
            <Input
              label="Address"
              placeholder="Street address"
              {...register("address")}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                placeholder="City"
                {...register("city")}
              />
              <Input
                label="Country"
                placeholder="Country"
                {...register("country")}
              />
            </div>
          </div>
        )}

        {/* Virtual URL (conditional on format) */}
        {(selectedFormat === "VIRTUAL" || selectedFormat === "HYBRID") && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Virtual Event Details
            </h3>
            <Input
              label="Virtual event URL"
              placeholder="https://..."
              type="url"
              error={errors.virtualUrl?.message}
              {...register("virtualUrl")}
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            leftIcon={<ArrowLeft className="w-5 h-5" />}
          >
            Back
          </Button>
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
