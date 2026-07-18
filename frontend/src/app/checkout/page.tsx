import { CheckoutExperience, SectionHeader } from "@/components/catalog-ui";

export default function CheckoutPage() {
  return (
    <div className="space-y-8 pb-8">
      <SectionHeader
        title="Finish your Clozet order"
      />
      <CheckoutExperience />
    </div>
  );
}

