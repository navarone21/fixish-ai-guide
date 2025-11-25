import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
}

export function PricingCard({ name, price, description, features, highlighted, ctaText }: PricingCardProps) {
  return (
    <Card
      className={`relative ${
        highlighted
          ? "shadow-glow border-primary scale-105 z-10"
          : "border-border hover:shadow-soft"
      } transition-all duration-300`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
          Most Popular
        </div>
      )}
      <CardHeader className="text-center pb-8 pt-12">
        <h3 className="text-2xl font-bold mb-2 text-foreground">{name}</h3>
        <div className="mb-2">
          <span className="text-5xl font-bold text-foreground">{price}</span>
          {price !== "Free" && price !== "Contact Us" && (
            <span className="text-muted-foreground">/mo</span>
          )}
        </div>
        <p className="text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className="w-full"
          variant={highlighted ? "default" : "outline"}
          size="lg"
        >
          {ctaText}
        </Button>
      </CardContent>
    </Card>
  );
}
