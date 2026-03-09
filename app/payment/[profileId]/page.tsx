import { PaymentCheckout } from "@/components/payment/payment-checkout";

export default async function PaymentPage({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await params;
  return (
    <main className="page">
      <div className="container grid">
        <PaymentCheckout profileId={profileId} />
      </div>
    </main>
  );
}
