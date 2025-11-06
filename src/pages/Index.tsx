import { motion } from "framer-motion";
import { Brain, Eye, Video, MessageSquare, RotateCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { feedbackSchema, type FeedbackFormData } from "@/lib/validation";
import logo from "@/assets/logo-minimal.png";
import heroMinimal from "@/assets/hero-minimal.jpg";

const Index = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FeedbackFormData>({
    feedbackType: "",
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FeedbackFormData, string>>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = feedbackSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FeedbackFormData, string>> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as keyof FeedbackFormData] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    toast({
      title: "Thank you for helping make Fix-ISH better.",
      description: "We've received your feedback and will review it soon.",
    });
    
    setFormData({
      feedbackType: "",
      name: "",
      email: "",
      message: "",
    });
  };

  const updateField = (field: keyof FeedbackFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const features = [
    {
      icon: Brain,
      title: "Adaptive Intelligence",
      description: "Adjusts guidance by skill and device.",
    },
    {
      icon: Eye,
      title: "Visual Detection",
      description: "Recognizes tools, parts, and problems.",
    },
    {
      icon: Video,
      title: "Dynamic Tutorials",
      description: "Auto-creates step-by-step video guides.",
    },
    {
      icon: MessageSquare,
      title: "Real-Time Interaction",
      description: "Talk naturally to clarify or replay steps.",
    },
    {
      icon: RotateCw,
      title: "Continuous Learning",
      description: "Improves accuracy with every session.",
    },
  ];

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `url(${heroMinimal})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 container mx-auto px-4 text-center max-w-5xl"
        >
          <motion.img
            src={logo}
            alt="Fix-ISH Logo"
            className="w-32 h-32 mx-auto mb-8 animate-float"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          <motion.h1
            className="text-6xl md:text-8xl font-light mb-2 tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Fix-ISH
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-6 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            by Lavern Williams
          </motion.p>

          <motion.p
            className="text-2xl md:text-3xl mb-4 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Adaptive AI for Real-World Problem Solving.
          </motion.p>

          <motion.p
            className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Fix-ISH is an intelligent assistant that understands what you see, detects what's wrong, 
            and shows you how to fix it — step by step.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button size="lg" className="shadow-lg">
              Get Started <ArrowRight className="ml-2" />
            </Button>
            <Button 
              variant="minimal" 
              size="lg"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Features
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              onClick={() => document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Send Feedback
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-32 px-4 relative z-10 gradient-subtle">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-light mb-8 tracking-tight">
              Your Smartest Repair Assistant.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Fix-ISH is an adaptive multimodal AI system that helps you build, repair, and learn in real time. 
              Using advanced vision and language models, it identifies parts, tools, and issues from your camera 
              feed and generates personalized, step-by-step guidance — just like having an expert at your side.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-32 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-light text-center mb-20 tracking-tight"
          >
            How Fix-ISH Works.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 10px 30px rgba(0, 198, 195, 0.1)",
                  transition: { duration: 0.3 }
                }}
                className="bg-card p-8 rounded-xl border border-border transition-all duration-300"
              >
                <feature.icon className="w-10 h-10 mb-4 text-primary" strokeWidth={1.5} />
                <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-32 px-4 relative z-10 gradient-subtle">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">
              Inside Fix-ISH.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              A fusion of computer vision, multimodal AI, and adaptive reasoning.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Fix-ISH processes visual input, understands context, and produces human-like instruction flow. 
              It bridges the gap between digital intelligence and physical action — turning complex repairs 
              into clear, guided experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-32 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-light mb-8 tracking-tight">
              Build. Repair. Learn. Faster.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              Whether you're fixing a motor, assembling tech, or learning something new, Fix-ISH brings 
              real-time intelligence to your hands. Experience precision, confidence, and adaptive support 
              from your phone, tablet, or headset.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="feedback" className="py-32 px-4 relative z-10 gradient-subtle">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-center mb-6 tracking-tight">
              Talk to the Fix-ISH Team.
            </h2>
            <p className="text-lg text-center text-muted-foreground mb-12 leading-relaxed">
              We're improving Fix-ISH every day — and we'd love to hear from you. Share new feature ideas, 
              report a problem, or just tell us what you'd like to see next.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-10 rounded-xl border border-border shadow-sm">
              <div>
                <label className="block text-sm font-medium mb-2">What would you like to share?</label>
                <Select 
                  value={formData.feedbackType} 
                  onValueChange={(value) => updateField("feedbackType", value)}
                >
                  <SelectTrigger className={errors.feedbackType ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Suggest a new feature</SelectItem>
                    <SelectItem value="bug">Report a bug</SelectItem>
                    <SelectItem value="feedback">General feedback</SelectItem>
                    <SelectItem value="partnership">Collaboration inquiry</SelectItem>
                  </SelectContent>
                </Select>
                {errors.feedbackType && (
                  <p className="text-sm text-destructive mt-1">{errors.feedbackType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="your.email@example.com"
                  maxLength={255}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  maxLength={2000}
                  className={errors.message ? "border-destructive" : ""}
                />
                {errors.message && (
                  <p className="text-sm text-destructive mt-1">{errors.message}</p>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full">
                Send to the Team
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Fix-ISH Logo" className="w-8 h-8" />
              <div>
                <p className="font-medium">Fix-ISH by Lavern Williams</p>
                <p className="text-sm text-muted-foreground">Adaptive Intelligence for the Real World.</p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Copyright © 2025 Lavern Williams. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
