"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@/components/ui";
import { useEventWizard } from "@/lib/stores/event-wizard-store";
import {
  communityNamingSchema,
  CommunityNamingFormData,
} from "@/lib/validations/event";
import { slugify } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Link2, Palette } from "lucide-react";

export function StepCommunity() {
  const { state, updateData, nextStep, prevStep } = useEventWizard();

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<CommunityNamingFormData>({
    resolver: zodResolver(communityNamingSchema),
    defaultValues: {
      communityName: state.data.communityName || state.data.name || "",
      slug: state.data.slug || "",
      primaryColor: state.data.primaryColor || "#00B894",
      logo: state.data.logo || "",
    },
  });

  const communityName = watch("communityName");
  const slug = watch("slug");
  const primaryColor = watch("primaryColor");

  // Auto-generate slug from community name
  useEffect(() => {
    if (communityName && !state.data.slug) {
      setValue("slug", slugify(communityName));
    }
  }, [communityName, setValue, state.data.slug]);

  const onSubmit = (data: CommunityNamingFormData) => {
    updateData(data);
    nextStep();
  };

  const colorPresets = [
    "#00B894", // Swapcard Green
    "#0984E3", // Blue
    "#6C5CE7", // Purple
    "#E17055", // Orange
    "#D63031", // Red
    "#00CEC9", // Teal
    "#FDCB6E", // Yellow
    "#2D3436", // Dark
  ];

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Name your community
        </h1>
        <p className="text-gray-600">
          Create a unique identity for your event community
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
        {/* Community Name */}
        <Input
          label="Community name"
          placeholder="e.g., Tech Leaders Network"
          error={errors.communityName?.message}
          hint="This will be the name of your event community"
          required
          {...register("communityName")}
        />

        {/* URL Slug */}
        <div>
          <Input
            label="URL slug"
            placeholder="tech-leaders-network"
            error={errors.slug?.message}
            required
            {...register("slug")}
          />
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <Link2 className="w-4 h-4" />
            <span>Your event URL will be:</span>
            <code className="bg-gray-100 px-2 py-0.5 rounded text-primary font-mono">
              events.vitalistbay.com/{slug || "your-slug"}
            </code>
          </div>
        </div>

        {/* Brand Color */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Brand color
          </label>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("primaryColor", color)}
                  className={`w-8 h-8 rounded-full transition-all duration-200 ${
                    primaryColor === color
                      ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setValue("primaryColor", e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <Input
                {...register("primaryColor")}
                className="w-28 font-mono text-sm"
                placeholder="#00B894"
              />
            </div>
          </div>
          {errors.primaryColor && (
            <p className="text-error text-sm">{errors.primaryColor.message}</p>
          )}
        </div>

        {/* Preview Card */}
        <div className="p-6 bg-gray-50 rounded-xl">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Preview</h3>
          <div
            className="bg-white rounded-lg shadow-card p-4 border-l-4"
            style={{ borderLeftColor: primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {communityName?.[0]?.toUpperCase() || "E"}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {communityName || "Your Community"}
                </h4>
                <p className="text-sm text-gray-500">
                  events.vitalistbay.com/{slug || "your-slug"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Logo Upload (simplified) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Logo (optional)
          </label>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors cursor-pointer">
            <div className="text-gray-400 mb-2">
              <svg
                className="mx-auto h-12 w-12"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, GIF up to 2MB
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              {...register("logo")}
            />
          </div>
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
