import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-glow rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Fix-ISH
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            Adaptive AI for real-world problem solving. AI that sees, understands, and guides you through repairs step-by-step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/chat">
              <Button size="lg" className="gap-2 shadow-glow">
                Get Started <ArrowRight size={20} />
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline">
                Explore Features
              </Button>
            </Link>
            <Link to="/support">
              <Button size="lg" variant="ghost">
                Send Feedback
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 max-w-5xl mx-auto animate-slide-up">
          <div className="relative rounded-2xl overflow-hidden shadow-glow border border-border">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/40 animate-pulse"></div>
                </div>
                <p className="text-lg text-muted-foreground">Your Smartest Repair Assistant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
