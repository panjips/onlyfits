import { createFileRoute } from "@tanstack/react-router";
import {
  Navbar,
  HeroSection,
  FeaturesSection,
  BenefitsSection,
  HowItWorksSection,
  CTASection,
  Footer,
} from "@/components/landing";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
