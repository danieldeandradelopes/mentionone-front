import "@/app/globals.css";
import SubscriptionInitializer from "./SubscriptionInitializer";
import OnboardingGate from "@/components/onboarding/OnboardingGate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <SubscriptionInitializer />
      <OnboardingGate />
      <header className="mb-6">
        <h1 className="text-xl font-bold">Painel Administrativo</h1>
      </header>

      <main>{children}</main>
    </div>
  );
}
