import { Card, CardContent } from "@/components/ui/card";
import { Brain, Eye, BookOpen, MessageSquare, TrendingUp, Box } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Adaptive Intelligence",
    description: "AI that learns and adapts to your specific repair needs in real-time.",
  },
  {
    icon: Eye,
    title: "Visual Detection",
    description: "Advanced image and video analysis to identify issues instantly.",
  },
  {
    icon: BookOpen,
    title: "Dynamic Tutorials",
    description: "Step-by-step guides tailored to your skill level and tools available.",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Interaction",
    description: "Chat with AI assistant for instant answers and guidance.",
  },
  {
    icon: TrendingUp,
    title: "Continuous Learning",
    description: "System improves with every repair, becoming smarter over time.",
  },
  {
    icon: Box,
    title: "AR-Ready Tools",
    description: "Future-ready augmented reality overlays for guided repairs.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-24 px-6 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to fix anything, powered by cutting-edge AI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="animate-fade-in hover:shadow-elevation transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
