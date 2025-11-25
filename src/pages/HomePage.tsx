import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeatureGrid } from "@/components/FeatureGrid";
import { PricingTable } from "@/components/PricingTable";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { FAQ } from "@/components/FAQ";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <FeatureGrid />
      <PricingTable />
      <TestimonialCarousel />
      <FAQ />
      <ContactForm />
      <Footer />
    </div>
  );
}
