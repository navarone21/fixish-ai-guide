import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PricingTable } from "@/components/PricingTable";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Simple, transparent pricing that grows with you. Try any plan free for 14 days.
            </p>

            <div className="inline-flex rounded-lg border border-border p-1 bg-muted/30">
              <Button
                variant={billingCycle === "monthly" ? "default" : "ghost"}
                onClick={() => setBillingCycle("monthly")}
                className="rounded-md"
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === "yearly" ? "default" : "ghost"}
                onClick={() => setBillingCycle("yearly")}
                className="rounded-md"
              >
                Yearly
                <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </Button>
            </div>
          </div>

          <PricingTable />

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Not sure which plan is right for you?
            </h2>
            <p className="text-muted-foreground mb-6">
              Our team is here to help you find the perfect fit.
            </p>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
