"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import type {
  EventTypeFormData,
  EventDetailsFormData,
  CommunityNamingFormData,
  OrganizationSetupFormData,
  KeyResultsFormData,
} from "@/lib/validations/event";

// Steps definition
export const WIZARD_STEPS = [
  { id: "event-type", label: "Event Type" },
  { id: "event-details", label: "Event Details" },
  { id: "community", label: "Community" },
  { id: "organization", label: "Organization" },
  { id: "key-results", label: "Key Results" },
] as const;

export type StepId = (typeof WIZARD_STEPS)[number]["id"];

// Form data for the entire wizard
export interface EventWizardData {
  // Step 1
  eventType?: EventTypeFormData["eventType"];
  // Step 2
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  timezone?: string;
  language?: string;
  format?: EventDetailsFormData["format"];
  sector?: string;
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  virtualUrl?: string;
  // Step 3
  communityName?: string;
  slug?: string;
  primaryColor?: string;
  logo?: string;
  // Step 4
  organizationName?: string;
  organizationType?: string;
  organizationCountry?: string;
  eventsPerYear?: OrganizationSetupFormData["eventsPerYear"];
  expectedAttendees?: OrganizationSetupFormData["expectedAttendees"];
  acceptTerms?: boolean;
  // Step 5
  objectives?: string[];
  customObjective?: string;
}

interface WizardState {
  currentStep: number;
  data: EventWizardData;
  completedSteps: Set<number>;
  isDirty: boolean;
  isSubmitting: boolean;
  error: string | null;
}

type WizardAction =
  | { type: "SET_STEP"; step: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "UPDATE_DATA"; data: Partial<EventWizardData> }
  | { type: "MARK_STEP_COMPLETE"; step: number }
  | { type: "SET_SUBMITTING"; isSubmitting: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "RESET" };

const initialState: WizardState = {
  currentStep: 0,
  data: {},
  completedSteps: new Set(),
  isDirty: false,
  isSubmitting: false,
  error: null,
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, WIZARD_STEPS.length - 1),
      };
    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
      };
    case "UPDATE_DATA":
      return {
        ...state,
        data: { ...state.data, ...action.data },
        isDirty: true,
      };
    case "MARK_STEP_COMPLETE":
      return {
        ...state,
        completedSteps: new Set([...state.completedSteps, action.step]),
      };
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.isSubmitting };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface WizardContextValue {
  state: WizardState;
  steps: typeof WIZARD_STEPS;
  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  // Data
  updateData: (data: Partial<EventWizardData>) => void;
  markStepComplete: (step: number) => void;
  // Submission
  setSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  // Helpers
  canGoNext: boolean;
  canGoPrev: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function EventWizardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const goToStep = useCallback((step: number) => {
    dispatch({ type: "SET_STEP", step });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: "MARK_STEP_COMPLETE", step: state.currentStep });
    dispatch({ type: "NEXT_STEP" });
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    dispatch({ type: "PREV_STEP" });
  }, []);

  const updateData = useCallback((data: Partial<EventWizardData>) => {
    dispatch({ type: "UPDATE_DATA", data });
  }, []);

  const markStepComplete = useCallback((step: number) => {
    dispatch({ type: "MARK_STEP_COMPLETE", step });
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: "SET_SUBMITTING", isSubmitting });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", error });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const value: WizardContextValue = {
    state,
    steps: WIZARD_STEPS,
    goToStep,
    nextStep,
    prevStep,
    updateData,
    markStepComplete,
    setSubmitting,
    setError,
    reset,
    canGoNext: state.currentStep < WIZARD_STEPS.length - 1,
    canGoPrev: state.currentStep > 0,
    isFirstStep: state.currentStep === 0,
    isLastStep: state.currentStep === WIZARD_STEPS.length - 1,
    progress: ((state.currentStep + 1) / WIZARD_STEPS.length) * 100,
  };

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useEventWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useEventWizard must be used within an EventWizardProvider");
  }
  return context;
}
