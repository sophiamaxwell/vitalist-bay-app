import { EventWizardProvider } from "@/lib/stores/event-wizard-store";
import { EventWizard } from "@/components/events/wizard";

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Create Event | Vitalist Bay",
  description: "Create a new event on Vitalist Bay",
};

export default function CreateEventPage() {
  return (
    <EventWizardProvider>
      <EventWizard />
    </EventWizardProvider>
  );
}
