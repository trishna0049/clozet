import { CheckoutExperience, SectionHeader } from "@/components/catalog-ui";

export default function CheckoutPage() {
  return (
    <div className="space-y-8 pb-8">
      <SectionHeader
        eyebrow="Minimal checkout"
        title="Finish your Clozet order"
        description="Keep the form clean, the hierarchy calm, and the order summary visible."
      />
      <CheckoutExperience />
    </div>
  );
}

