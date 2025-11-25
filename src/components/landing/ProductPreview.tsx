import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Image, Video } from "lucide-react";

export function ProductPreview() {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Experience the Future of Repair Assistance
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our premium AI chat interface makes getting help feel natural and effortless.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-glow border border-border bg-card p-8">
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 flex flex-col items-center justify-center gap-6 p-12">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse" style={{ animationDelay: "200ms" }}>
                  <Image className="w-8 h-8 text-primary" />
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse" style={{ animationDelay: "400ms" }}>
                  <Video className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-2 text-foreground">Premium AI Assistant</h3>
                <p className="text-muted-foreground mb-6">Chat, upload images, analyze videos—all in one place</p>
                <Link to="/chat">
                  <Button size="lg" className="shadow-soft">
                    Try It Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
