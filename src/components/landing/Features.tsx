import { Brain, Eye, BookOpen, MessageSquare, TrendingUp, Scan } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

export function Features() {
  const features = [
    {
      icon: Brain,
      title: "Adaptive Intelligence",
      description: "AI that learns from your interactions and adapts to your specific repair needs and skill level.",
    },
    {
      icon: Eye,
      title: "Visual Detection",
      description: "Advanced computer vision detects damage, wear, and issues from photos and videos instantly.",
    },
    {
      icon: BookOpen,
      title: "Dynamic Tutorials",
      description: "Step-by-step instructions that adapt based on your progress and real-time feedback.",
    },
    {
      icon: MessageSquare,
      title: "Real-Time AI Chat",
      description: "Ask questions, get clarification, and receive expert guidance through natural conversation.",
    },
    {
      icon: TrendingUp,
      title: "Continuous Learning",
      description: "Our AI improves with every repair, building a knowledge base from millions of fixes.",
    },
    {
      icon: Scan,
      title: "AR-Ready Overlays",
      description: "Visual annotations and detection overlays help you identify parts and problem areas.",
    },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Powerful Features for Every Repair
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to diagnose, understand, and fix problems with confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
