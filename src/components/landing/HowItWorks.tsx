import { Upload, Search, Wrench, ListChecks, CheckCircle } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Upload a photo or video",
      description: "Share an image or video of the issue you're facing.",
    },
    {
      icon: Search,
      title: "Fix-ISH detects the issue",
      description: "Our AI analyzes the visual data and identifies the problem.",
    },
    {
      icon: Wrench,
      title: "Identifies tools & parts",
      description: "Get a complete list of tools and parts you'll need.",
    },
    {
      icon: ListChecks,
      title: "Generates step-by-step plan",
      description: "Receive a detailed, adaptive repair guide tailored to you.",
    },
    {
      icon: CheckCircle,
      title: "Follow interactive instructions",
      description: "Complete the repair with real-time AI assistance.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From problem to solution in five simple steps.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-6 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-primary">STEP {index + 1}</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-lg">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
