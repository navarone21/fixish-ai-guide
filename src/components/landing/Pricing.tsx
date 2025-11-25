import { PricingCard } from "./PricingCard";

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for trying out Fix-ISH",
      features: [
        "5 AI chat conversations/month",
        "Basic visual detection",
        "Step-by-step repair guides",
        "Community support",
      ],
      ctaText: "Get Started Free",
    },
    {
      name: "Pro",
      price: "$29",
      description: "For serious DIYers and professionals",
      features: [
        "Unlimited AI conversations",
        "Advanced visual detection",
        "Priority support",
        "Repair history & analytics",
        "Video analysis",
        "AR overlay features",
      ],
      highlighted: true,
      ctaText: "Start Pro Trial",
    },
    {
      name: "Enterprise",
      price: "Contact Us",
      description: "Custom solutions for teams",
      features: [
        "Everything in Pro",
        "Custom AI training",
        "API access",
        "Dedicated support",
        "SLA guarantees",
        "White-label options",
      ],
      ctaText: "Contact Sales",
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <PricingCard {...plan} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
