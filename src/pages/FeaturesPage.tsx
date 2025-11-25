import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Wrench, Box, Video, Brain, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Visual AI",
    description: "Advanced computer vision technology that analyzes images and videos to identify repair issues with precision. Our AI can detect damage, wear, and malfunction across thousands of different objects and systems.",
  },
  {
    icon: Wrench,
    title: "Step Generation",
    description: "Automatically generates detailed, personalized repair instructions based on your specific situation. Each step is tailored to your skill level, available tools, and the exact problem you're facing.",
  },
  {
    icon: Box,
    title: "Tool + Part Recognition",
    description: "Identifies the exact tools and replacement parts you'll need for your repair. Get specific model numbers, compatible alternatives, and purchasing recommendations all in one place.",
  },
  {
    icon: Video,
    title: "AR Overlays",
    description: "Future-ready augmented reality features that overlay repair instructions directly onto your view. See exactly where to work and what to do, guided by intelligent visual cues.",
  },
  {
    icon: Video,
    title: "Video Analysis",
    description: "Upload videos of your repair issue for comprehensive analysis. Our AI can track movement, identify problems in real-time footage, and provide frame-by-frame guidance.",
  },
  {
    icon: Brain,
    title: "Adaptive Reasoning",
    description: "Learn from every interaction to provide increasingly personalized assistance. The system understands your skill level, remembers your past repairs, and adapts its guidance accordingly.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Powerful Features
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to diagnose, understand, and fix any repair challenge with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="animate-fade-in hover:shadow-elevation transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">
                    {feature.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
