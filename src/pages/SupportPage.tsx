import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function SupportPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Support request submitted!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", topic: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              How Can We Help?
            </h1>
            <p className="text-xl text-muted-foreground">
              Get support, report bugs, or suggest new features.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-card p-8 rounded-2xl shadow-elevation border border-border"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-medium mb-2 text-foreground">
                Topic
              </label>
              <Select
                value={formData.topic}
                onValueChange={(value) => setFormData({ ...formData, topic: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Suggestion</SelectItem>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="billing">Billing Question</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Describe your issue or suggestion in detail..."
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full shadow-glow">
              Submit Request
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
