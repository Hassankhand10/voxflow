import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import {
  BuiltSection,
  TechStack,
  HowItWorks,
  CtaSection,
} from "@/components/marketing/built-section";
import { Footer } from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <Hero />
      <BuiltSection />
      <HowItWorks />
      <TechStack />
      <CtaSection />
      <Footer />
    </main>
  );
}
