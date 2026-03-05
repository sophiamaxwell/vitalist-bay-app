import { z } from "zod";

// Step 1: Event Type
export const eventTypeSchema = z.object({
  eventType: z.enum(["exhibition", "conference", "congress", "corporate", "other"], {
    required_error: "Please select an event type",
  }),
});

// Step 2: Event Details
export const eventDetailsSchema = z.object({
  name: z
    .string()
    .min(3, "Event name must be at least 3 characters")
    .max(100, "Event name must be less than 100 characters"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  timezone: z.string().min(1, "Timezone is required"),
  language: z.string().min(1, "Language is required"),
  format: z.enum(["IN_PERSON", "VIRTUAL", "HYBRID"], {
    required_error: "Please select an event format",
  }),
  sector: z.string().min(1, "Event sector is required"),
  venue: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  virtualUrl: z.string().url().optional().or(z.literal("")),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

// Step 3: Community Naming
export const communityNamingSchema = z.object({
  communityName: z
    .string()
    .min(2, "Community name must be at least 2 characters")
    .max(50, "Community name must be less than 50 characters"),
  slug: z
    .string()
    .min(2, "URL slug must be at least 2 characters")
    .max(50, "URL slug must be less than 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "URL slug can only contain lowercase letters, numbers, and hyphens"
    ),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
  logo: z.string().optional(),
});

// Step 4: Organization Setup
export const organizationSetupSchema = z.object({
  organizationName: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name must be less than 100 characters"),
  organizationType: z.string().min(1, "Organization type is required"),
  organizationCountry: z.string().min(1, "Country is required"),
  eventsPerYear: z.enum(["1-5", "6-15", "16-25", "26-40", "40+"], {
    required_error: "Please select events per year",
  }),
  expectedAttendees: z.enum(["0-100", "100-1000", "1000-5000", "5000-10000", "10000+"], {
    required_error: "Please select expected attendees",
  }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

// Step 5: Key Results (Optional)
export const keyResultsSchema = z.object({
  objectives: z.array(z.string()).optional(),
  customObjective: z.string().optional(),
});

// Combined schema for the entire form
export const createEventSchema = z.object({
  ...eventTypeSchema.shape,
  ...eventDetailsSchema._def.schema.shape,
  ...communityNamingSchema.shape,
  ...organizationSetupSchema.shape,
  ...keyResultsSchema.shape,
});

export type EventTypeFormData = z.infer<typeof eventTypeSchema>;
export type EventDetailsFormData = z.infer<typeof eventDetailsSchema>;
export type CommunityNamingFormData = z.infer<typeof communityNamingSchema>;
export type OrganizationSetupFormData = z.infer<typeof organizationSetupSchema>;
export type KeyResultsFormData = z.infer<typeof keyResultsSchema>;
export type CreateEventFormData = z.infer<typeof createEventSchema>;

// Event format options
export const EVENT_TYPES = [
  { value: "exhibition", label: "Exhibition" },
  { value: "conference", label: "Conference" },
  { value: "congress", label: "Congress" },
  { value: "corporate", label: "Corporate" },
  { value: "other", label: "Other" },
] as const;

export const EVENT_FORMATS = [
  { value: "IN_PERSON", label: "In-person", description: "Physical event at a venue" },
  { value: "VIRTUAL", label: "Virtual", description: "Fully online event" },
  { value: "HYBRID", label: "Hybrid", description: "Both in-person and virtual" },
] as const;

export const EVENT_SECTORS = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare & Life Sciences" },
  { value: "finance", label: "Finance & Banking" },
  { value: "education", label: "Education" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "government", label: "Government" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "media", label: "Media & Entertainment" },
  { value: "energy", label: "Energy & Utilities" },
  { value: "real-estate", label: "Real Estate" },
  { value: "legal", label: "Legal" },
  { value: "other", label: "Other" },
] as const;

export const TIMEZONES = [
  { value: "America/Los_Angeles", label: "(UTC-08:00) Pacific Time" },
  { value: "America/Denver", label: "(UTC-07:00) Mountain Time" },
  { value: "America/Chicago", label: "(UTC-06:00) Central Time" },
  { value: "America/New_York", label: "(UTC-05:00) Eastern Time" },
  { value: "Europe/London", label: "(UTC+00:00) London" },
  { value: "Europe/Paris", label: "(UTC+01:00) Paris" },
  { value: "Europe/Berlin", label: "(UTC+01:00) Berlin" },
  { value: "Asia/Dubai", label: "(UTC+04:00) Dubai" },
  { value: "Asia/Singapore", label: "(UTC+08:00) Singapore" },
  { value: "Asia/Tokyo", label: "(UTC+09:00) Tokyo" },
  { value: "Australia/Sydney", label: "(UTC+10:00) Sydney" },
] as const;

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
] as const;

export const ORGANIZATION_TYPES = [
  { value: "company", label: "Company" },
  { value: "nonprofit", label: "Non-profit Organization" },
  { value: "association", label: "Association" },
  { value: "government", label: "Government" },
  { value: "educational", label: "Educational Institution" },
  { value: "other", label: "Other" },
] as const;

export const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "AU", label: "Australia" },
  { value: "JP", label: "Japan" },
  { value: "SG", label: "Singapore" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "NL", label: "Netherlands" },
  { value: "CH", label: "Switzerland" },
  { value: "SE", label: "Sweden" },
] as const;

export const OBJECTIVES = [
  { id: "streamline", label: "Streamline Event Organization" },
  { id: "engagement", label: "Boost Engagement" },
  { id: "revenue", label: "Boost Revenue Streams" },
  { id: "retention", label: "Enhance Attendee Retention" },
  { id: "data", label: "Collect Insightful Data" },
  { id: "branding", label: "Improve Event Branding" },
  { id: "reach", label: "Optimize Event Reach" },
  { id: "abstract", label: "Streamline Abstract Management" },
  { id: "credits", label: "Track Continuing Education Credits" },
] as const;
