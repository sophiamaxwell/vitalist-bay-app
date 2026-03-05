"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@/components/ui";
import { useEventWizard } from "@/lib/stores/event-wizard-store";
import {
  keyResultsSchema,
  KeyResultsFormData,
  OBJECTIVES,
} from "@/lib/validations/event";
import { ArrowLeft, Sparkles, Target, Check } from "lucide-react";

interface StepKeyResultsProps {
  onSubmit: () => void;
}

export function StepKeyResults({ onSubmit }: StepKeyResultsProps) {
  const { state, updateData, prevStep, setSubmitting } =
    useEventWizard();

  const [selectedObjectives, setSelectedObjectives] = useState<string[]>(
    state.data.objectives || []
  );
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customObjective, setCustomObjective] = useState(
    state.data.customObjective || ""
  );

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<KeyResultsFormData>({
    resolver: zodResolver(keyResultsSchema),
    defaultValues: {
      objectives: state.data.objectives || [],
      customObjective: state.data.customObjective || "",
    },
  });

  const toggleObjective = (id: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleFormSubmit = async () => {
    updateData({
      objectives: selectedObjectives,
      customObjective: showCustomInput ? customObjective : undefined,
    });

    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary mb-4">
          <Target className="w-8 h-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          What are your key objectives?
        </h1>
        <p className="text-gray-600">
          Select the goals you want to achieve with this event (optional)
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Objectives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {OBJECTIVES.map((objective) => {
            const isSelected = selectedObjectives.includes(objective.id);

            return (
              <button
                key={objective.id}
                type="button"
                onClick={() => toggleObjective(objective.id)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center ${
                    isSelected
                      ? "bg-primary text-white"
                      : "border-2 border-gray-300"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isSelected ? "text-primary-700" : "text-gray-700"
                  }`}
                >
                  {objective.label}
                </span>
              </button>
            );
          })}

          {/* Other option */}
          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all duration-200 ${
              showCustomInput
                ? "border-primary bg-primary-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center ${
                showCustomInput
                  ? "bg-primary text-white"
                  : "border-2 border-gray-300"
              }`}
            >
              {showCustomInput && <Check className="w-3 h-3" />}
            </div>
            <span
              className={`text-sm font-medium ${
                showCustomInput ? "text-primary-700" : "text-gray-700"
              }`}
            >
              Others
            </span>
          </button>
        </div>

        {/* Custom objective input */}
        {showCustomInput && (
          <div className="animate-fade-in">
            <Input
              label="Custom objective"
              placeholder="Describe your objective..."
              value={customObjective}
              onChange={(e) => setCustomObjective(e.target.value)}
            />
          </div>
        )}

        {/* Summary */}
        {selectedObjectives.length > 0 && (
          <div className="bg-primary-50 rounded-lg p-4">
            <h3 className="font-medium text-primary-700 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Selected objectives ({selectedObjectives.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedObjectives.map((id) => {
                const objective = OBJECTIVES.find((o) => o.id === id);
                return (
                  <span
                    key={id}
                    className="px-3 py-1 bg-white rounded-full text-sm text-primary-700 border border-primary-200"
                  >
                    {objective?.label}
                  </span>
                );
              })}
              {showCustomInput && customObjective && (
                <span className="px-3 py-1 bg-white rounded-full text-sm text-primary-700 border border-primary-200">
                  {customObjective}
                </span>
              )}
            </div>
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
            loading={isSubmitting}
            leftIcon={<Sparkles className="w-5 h-5" />}
          >
            Create Event
          </Button>
        </div>

        {/* Skip option */}
        <p className="text-center text-sm text-gray-500">
          This step is optional.{" "}
          <button
            type="submit"
            className="text-primary hover:underline"
          >
            Skip and create event
          </button>
        </p>
      </form>
    </div>
  );
}
