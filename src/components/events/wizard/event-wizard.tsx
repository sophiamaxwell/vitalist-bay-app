"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEventWizard, WIZARD_STEPS } from "@/lib/stores/event-wizard-store";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { StepEventType } from "./step-event-type";
import { StepEventDetails } from "./step-event-details";
import { StepCommunity } from "./step-community";
import { StepOrganization } from "./step-organization";
import { StepKeyResults } from "./step-key-results";
import { X } from "lucide-react";

export function EventWizard() {
  const router = useRouter();
  const { state, setError, reset } = useEventWizard();

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state.data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create event");
      }

      const event = await response.json();
      
      // Reset wizard state
      reset();
      
      // Redirect to the new event dashboard
      router.push(`/studio/events/${event.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
      throw error;
    }
  };

  const handleClose = () => {
    if (state.isDirty) {
      if (
        confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        reset();
        router.push("/studio/events");
      }
    } else {
      router.push("/studio/events");
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return <StepEventType />;
      case 1:
        return <StepEventDetails />;
      case 2:
        return <StepCommunity />;
      case 3:
        return <StepOrganization />;
      case 4:
        return <StepKeyResults onSubmit={handleSubmit} />;
      default:
        return <StepEventType />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Create New Event
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <ProgressSteps
            steps={WIZARD_STEPS.map((s) => ({ id: s.id, label: s.label }))}
            currentStep={state.currentStep}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Error Banner */}
        {state.error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 flex items-center gap-3">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{state.error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-error-500 hover:text-error-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-card p-6 md:p-8">
          {renderStep()}
        </div>

        {/* Save Draft Button */}
        {state.isDirty && (
          <div className="mt-4 text-center">
            <button
              className="text-sm text-gray-500 hover:text-primary transition-colors"
              onClick={() => {
                // Save to localStorage as draft
                localStorage.setItem(
                  "event-wizard-draft",
                  JSON.stringify(state.data)
                );
                alert("Draft saved!");
              }}
            >
              Save as draft
            </button>
          </div>
        )}
      </main>

      {/* Sidebar with tips (optional, shown on larger screens) */}
      <aside className="hidden xl:block fixed right-0 top-0 w-80 h-screen bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              💡 Tips
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              {state.currentStep === 0 && (
                <p>
                  Choose the event type that best matches your needs. This helps
                  us customize features and recommendations for you.
                </p>
              )}
              {state.currentStep === 1 && (
                <>
                  <p>
                    A clear event name helps attendees find and remember your
                    event.
                  </p>
                  <p>
                    Choose hybrid format if you want to accommodate both
                    in-person and remote attendees.
                  </p>
                </>
              )}
              {state.currentStep === 2 && (
                <p>
                  Your community name creates a lasting identity for your
                  events. Choose something memorable!
                </p>
              )}
              {state.currentStep === 3 && (
                <p>
                  Organization details help us provide better analytics and
                  recommendations.
                </p>
              )}
              {state.currentStep === 4 && (
                <p>
                  Setting clear objectives helps you measure event success and
                  optimize future events.
                </p>
              )}
            </div>
          </div>

          {/* Example events carousel would go here */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Need inspiration?
            </h4>
            <p className="text-xs text-gray-500">
              Check out successful events created by other organizers in your
              industry.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
