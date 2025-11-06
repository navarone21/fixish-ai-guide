import { motion } from "framer-motion";
import { Eye, Brain, Video, MessageSquare, Feather, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/hummingbird-logo.png";

const Index = () => {
  const { toast } = useToast();
  const [feedbackType, setFeedbackType] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thank you for your feedback!",
      description: "We've received your message and will review it soon.",
    });
    setFeedbackType("");
    setName("");
    setEmail("");
    setMessage("");
  };

  const features = [
    {
      icon: Eye,
      title: "Real-Time Visual Detection",
      description: "Identifies parts, tools, and conditions instantly.",
    },
    {
      icon: Brain,
      title: "Adaptive Guidance",
      description: "Adjusts instructions based on your skill and device.",
    },
    {
      icon: Video,
      title: "Dynamic Tutorials",
      description: "Auto-creates video or visual repair steps.",
    },
    {
      icon: MessageSquare,
      title: "Conversational Interaction",
      description: "Talk naturally to get clarifications or replay steps.",
    },
    {
      icon: Feather,
      title: "Lightweight & Accessible",
      description: "Runs anywhere, from your phone to AR headset.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container mx-auto px-4 text-center"
        >
          <motion.img
            src={logo}
            alt="Fix-ISH Hummingbird Logo"
            className="w-24 h-24 mx-auto mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          />
          
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-4 glow-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Fix-ISH™ by <span className="text-primary">Lavern Williams</span>
          </motion.h1>

          <motion.p
            className="text-2xl md:text-3xl mb-3 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Adaptive AI for Real-World Problem Solving.
          </motion.p>

          <motion.p
            className="text-lg md:text-xl mb-8 text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            An intelligent system that understands what you see, detects what's wrong, and shows you how to fix it — step by step.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button variant="hero" size="xl" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Features <ArrowRight className="ml-2" />
            </Button>
            <Button variant="heroOutline" size="xl" onClick={() => document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' })}>
              Send Feedback
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Your Smartest Repair Assistant.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Fix-ISH™ is an adaptive multimodal AI system that guides you through building, repairing, or assembling anything — in real time. It analyzes video or photo input, recognizes tools and parts, understands conditions, and generates personalized tutorials with voice and visual guidance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-7xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 glow-text"
          >
            How Fix-ISH™ Works.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px hsl(var(--glow-primary) / 0.3)" }}
                className="gradient-card p-6 rounded-lg border border-border transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              The Intelligence Behind Fix-ISH™.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              Powered by advanced computer vision, multimodal AI, and real-time feedback.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Fix-ISH™ combines vision models, speech understanding, and adaptive learning. It observes, reasons, and teaches — just like a human expert, but faster and more precise.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Build. Repair. Learn. Faster.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              From assembling furniture to diagnosing mechanical issues, Fix-ISH™ brings expert-level guidance to your fingertips — using your own camera and real-time feedback.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Fix appliances, assemble tech gear, or learn hands-on skills — all with personalized AI assistance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Lavern Williams Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Created by <span className="text-primary">Lavern Williams</span>.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A forward-thinking innovation lab dedicated to merging artificial intelligence with real-world action. Fix-ISH™ represents our vision of technology that empowers everyone to build, repair, and learn effortlessly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="feedback" className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 glow-text">
              Talk to the Fix-ISH™ Team.
            </h2>
            <p className="text-lg text-center text-muted-foreground mb-8 leading-relaxed">
              We're improving every day and we'd love to hear from you. Whether it's a new feature idea, a problem to report, or just something you'd like to see — tell us what you think.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 gradient-card p-8 rounded-lg border border-border">
              <div>
                <label className="block text-sm font-medium mb-2">What would you like to share?</label>
                <Select value={feedbackType} onValueChange={setFeedbackType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Suggest a new feature</SelectItem>
                    <SelectItem value="bug">Report a problem or bug</SelectItem>
                    <SelectItem value="feedback">Share general feedback</SelectItem>
                    <SelectItem value="partnership">Ask about partnership or collaboration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full">
                Send to the Team
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Fix-ISH Logo" className="w-10 h-10" />
              <div>
                <p className="font-bold">Fix-ISH™ by Lavern Williams</p>
                <p className="text-sm text-muted-foreground">Adaptive Intelligence for the Real World.</p>
              </div>
            </div>

            <nav className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Home</a>
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#feedback" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </nav>
          </div>

          <div className="text-center mt-8 text-sm text-muted-foreground">
            Copyright © 2025 Lavern Williams. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
