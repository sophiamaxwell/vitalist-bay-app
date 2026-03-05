"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Select, Checkbox } from "@/components/ui";
import { useEventWizard } from "@/lib/stores/event-wizard-store";
import {
  organizationSetupSchema,
  OrganizationSetupFormData,
  ORGANIZATION_TYPES,
  COUNTRIES,
} from "@/lib/validations/event";
import { ArrowLeft, ArrowRight, Building, Users, Calendar } from "lucide-react";

const EVENTS_PER_YEAR_OPTIONS = [
  { value: "1-5", label: "1-5 events" },
  { value: "6-15", label: "6-15 events" },
  { value: "16-25", label: "16-25 events" },
  { value: "26-40", label: "26-40 events" },
  { value: "40+", label: "40+ events" },
];

const EXPECTED_ATTENDEES_OPTIONS = [
  { value: "0-100", label: "0-100 attendees" },
  { value: "100-1000", label: "100-1,000 attendees" },
  { value: "1000-5000", label: "1,000-5,000 attendees" },
  { value: "5000-10000", label: "5,000-10,000 attendees" },
  { value: "10000+", label: "10,000+ attendees" },
];

export function StepOrganization() {
  const { state, updateData, nextStep, prevStep } = useEventWizard();

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationSetupFormData>({
    resolver: zodResolver(organizationSetupSchema),
    defaultValues: {
      organizationName: state.data.organizationName || "",
      organizationType: state.data.organizationType || "",
      organizationCountry: state.data.organizationCountry || "",
      eventsPerYear: state.data.eventsPerYear,
      expectedAttendees: state.data.expectedAttendees,
      acceptTerms: state.data.acceptTerms || false,
    },
  });

  const eventsPerYear = watch("eventsPerYear");
  const expectedAttendees = watch("expectedAttendees");

  const onSubmit = (data: OrganizationSetupFormData) => {
    updateData(data);
    nextStep();
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Tell us about your organization
        </h1>
        <p className="text-gray-600">
          This helps us customize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
        {/* Organization Name */}
        <Input
          label="Organization name"
          placeholder="e.g., Acme Corporation"
          error={errors.organizationName?.message}
          required
          leftIcon={<Building className="w-5 h-5" />}
          {...register("organizationName")}
        />

        {/* Organization Type & Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Organization type"
            options={ORGANIZATION_TYPES.map((t) => ({
              value: t.value,
              label: t.label,
            }))}
            placeholder="Select type"
            error={errors.organizationType?.message}
            required
            {...register("organizationType")}
          />
          <Select
            label="Country"
            options={COUNTRIES.map((c) => ({ value: c.value, label: c.label }))}
            placeholder="Select country"
            error={errors.organizationCountry?.message}
            required
            {...register("organizationCountry")}
          />
        </div>

        {/* Events Per Year */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            How many events do you organize per year?
            <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {EVENTS_PER_YEAR_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setValue(
                    "eventsPerYear",
                    option.value as OrganizationSetupFormData["eventsPerYear"]
                  )
                }
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                  eventsPerYear === option.value
                    ? "border-primary bg-primary-50 text-primary-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                {option.label.split(" ")[0]}
              </button>
            ))}
          </div>
          {errors.eventsPerYear && (
            <p className="text-error text-sm">{errors.eventsPerYear.message}</p>
          )}
        </div>

        {/* Expected Attendees */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Expected number of attendees
            <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {EXPECTED_ATTENDEES_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setValue(
                    "expectedAttendees",
                    option.value as OrganizationSetupFormData["expectedAttendees"]
                  )
                }
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                  expectedAttendees === option.value
                    ? "border-primary bg-primary-50 text-primary-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                {option.label.split(" ")[0]}
              </button>
            ))}
          </div>
          {errors.expectedAttendees && (
            <p className="text-error text-sm">
              {errors.expectedAttendees.message}
            </p>
          )}
        </div>

        {/* Terms & Conditions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <Checkbox
            label="I accept the Terms of Service and Privacy Policy"
            description="By checking this box, you agree to our terms and conditions."
            error={errors.acceptTerms?.message}
            {...register("acceptTerms")}
          />
        </div>

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
