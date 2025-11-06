import { motion } from "framer-motion";
import { Brain, Eye, Video, MessageSquare, RotateCw, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RepairWorkshopBackground } from "@/components/RepairWorkshopBackground";
import { feedbackSchema, type FeedbackFormData } from "@/lib/validation";
import logo from "@/assets/logo-minimal.png";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
    <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <RepairWorkshopBackground />
      
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 container mx-auto px-4 text-center max-w-5xl"
        >
          {/* FIX-ISH with scanning light */}
          <div className="mb-3 relative">
            <div className="relative inline-block">
              {['F', 'I', 'X', '-', 'I', 'S', 'H'].map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    filter: 'blur(0px)',
                  }}
                  transition={{ 
                    duration: 0.6,
                    delay: 0.3 + index * 0.1,
                    ease: [0.6, 0.01, 0.05, 0.95]
                  }}
                  className="inline-block text-7xl md:text-9xl font-light tracking-tight text-slate-800"
                >
                  {letter}
                </motion.span>
              ))}
              
              {/* Scanning light effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: 'linear',
                }}
                style={{
                  filter: 'blur(20px)',
                }}
              />
            </div>
          </div>

          <motion.p
            className="text-base md:text-lg text-slate-600 font-extralight tracking-wide mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            by Lavern Williams
          </motion.p>

          <motion.p
            className="text-2xl md:text-3xl mb-4 font-medium text-slate-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            Adaptive AI for Real-World Problem Solving.
          </motion.p>

          <motion.p
            className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            Fix-ISH is an intelligent assistant that understands what you see, detects what's wrong, 
            and shows you how to fix it — step by step.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Button 
                size="lg"
                onClick={() => navigate("/chat")}
                className="shadow-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,198,195,0.4)] relative overflow-hidden"
              >
                {/* Spark effect on hover */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%', opacity: 0 }}
                  whileHover={{ 
                    x: '100%',
                    opacity: [0, 1, 0],
                    transition: { duration: 0.6 }
                  }}
                />
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="ml-2 relative z-10" />
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="minimal" 
                size="lg"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,198,195,0.3)] hover:bg-primary/10 relative overflow-hidden"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent"
                  initial={{ x: '-100%', opacity: 0 }}
                  whileHover={{ 
                    x: '100%',
                    opacity: [0, 1, 0],
                    transition: { duration: 0.6 }
                  }}
                />
                <span className="relative z-10">Explore Features</span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="lg"
                onClick={() => document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' })}
                className="transition-all duration-300 hover:bg-slate-100 hover:shadow-[0_0_15px_rgba(0,198,195,0.2)] relative overflow-hidden"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/40 to-transparent"
                  initial={{ x: '-100%', opacity: 0 }}
                  whileHover={{ 
                    x: '100%',
                    opacity: [0, 1, 0],
                    transition: { duration: 0.6 }
                  }}
                />
                <span className="relative z-10">Send Feedback</span>
              </Button>
            </motion.div>
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

      {/* Pricing Section */}
      <section className="py-32 px-4 relative z-10 gradient-subtle">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-tight">
              Pricing.
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits you best.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Starter Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-card p-8 rounded-xl border border-border hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-2xl font-medium mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-light">Free</span>
              </div>
              <p className="text-muted-foreground mb-6">
                Perfect for quick fixes and testing.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">5 uploads per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Basic video tutorials</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">7-day chat memory</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Community support</span>
                </li>
              </ul>
              <Button 
                onClick={() => navigate("/chat")}
                className="w-full" 
                variant="outline"
              >
                Get Started
              </Button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-card p-8 rounded-xl border-2 border-primary relative hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-2xl font-medium mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-light">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-6">
                For everyday repair pros and creators.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Unlimited uploads</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Advanced AI tutorials</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Unlimited chat memory</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">AR overlay access</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Priority support</span>
                </li>
              </ul>
              <Button 
                onClick={() => navigate("/chat")}
                className="w-full"
              >
                Get Started
              </Button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card p-8 rounded-xl border border-border hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-2xl font-medium mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-2xl font-light">Contact us</span>
              </div>
              <p className="text-muted-foreground mb-6">
                For teams and custom integrations.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Custom AI training</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">API access & integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">SLA & white-label options</span>
                </li>
              </ul>
              <Button 
                onClick={() => document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full" 
                variant="outline"
              >
                Get Started
              </Button>
            </motion.div>
          </div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="overflow-x-auto"
          >
            <table className="w-full bg-card rounded-xl border border-border overflow-hidden">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium">Feature</th>
                  <th className="text-center p-4 font-medium">Starter</th>
                  <th className="text-center p-4 font-medium bg-primary/5">Pro</th>
                  <th className="text-center p-4 font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-border">
                  <td className="p-4">Monthly Uploads</td>
                  <td className="text-center p-4">5</td>
                  <td className="text-center p-4 bg-primary/5">Unlimited</td>
                  <td className="text-center p-4">Unlimited</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Video Tutorials</td>
                  <td className="text-center p-4">Basic</td>
                  <td className="text-center p-4 bg-primary/5">Advanced</td>
                  <td className="text-center p-4">Advanced + Custom</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Chat Memory</td>
                  <td className="text-center p-4">7 days</td>
                  <td className="text-center p-4 bg-primary/5">Unlimited</td>
                  <td className="text-center p-4">Unlimited</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">AR Overlay</td>
                  <td className="text-center p-4">—</td>
                  <td className="text-center p-4 bg-primary/5"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Support</td>
                  <td className="text-center p-4">Community</td>
                  <td className="text-center p-4 bg-primary/5">Priority</td>
                  <td className="text-center p-4">Dedicated</td>
                </tr>
                <tr>
                  <td className="p-4">API Access</td>
                  <td className="text-center p-4">—</td>
                  <td className="text-center p-4 bg-primary/5">—</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-4 relative z-10">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-tight">
              Frequently Asked Questions.
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Fix-ISH.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-card border border-border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="text-lg font-medium">Can I cancel anytime?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Yes, absolutely. You can cancel your subscription at any time with no questions asked. 
                  Your access will continue until the end of your current billing period, and you won't be 
                  charged again. All your data remains accessible during this time.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-card border border-border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="text-lg font-medium">What file types can I upload?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Fix-ISH accepts images (JPG, PNG, HEIC), videos (MP4, MOV, AVI), and documents (PDF, DOC). 
                  Each file can be up to 20MB in size. For Pro and Enterprise plans, you can upload multiple 
                  files simultaneously and create detailed repair documentation with annotated images.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-card border border-border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="text-lg font-medium">Is there a free trial?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Our Starter plan is completely free and available indefinitely—no credit card required. 
                  It gives you 5 uploads per month and access to basic AI tutorials. If you need more features, 
                  you can upgrade to Pro at any time to unlock unlimited uploads, AR overlay, and priority support.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-card border border-border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="text-lg font-medium">Can I use Fix-ISH on mobile?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Yes! Fix-ISH is fully responsive and works seamlessly on smartphones and tablets. 
                  You can take photos directly with your device's camera and get real-time AI guidance 
                  while working on repairs. The AR overlay feature is especially powerful on mobile devices 
                  with Pro and Enterprise plans.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-card border border-border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="text-lg font-medium">How secure is my data?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  We take security seriously. All data is encrypted in transit and at rest using industry-standard 
                  AES-256 encryption. Your uploads and conversations are stored on secure, SOC 2 compliant servers. 
                  We never share your data with third parties, and you can delete your account and all associated 
                  data at any time. Enterprise customers can opt for custom data residency and additional compliance options.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
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

      {/* Testimonials Section */}
      <section className="py-32 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-light text-center mb-20 tracking-tight"
          >
            Trusted by Builders and Fixers.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Fix-ISH saved me hours rebuilding my kitchen fan — it's like having an engineer in your pocket.",
                author: "Jordan T.",
                role: "DIY Enthusiast"
              },
              {
                quote: "The future of hands-on learning. I fixed my car's AC with real-time help from Fix-ISH.",
                author: "Taylor L.",
                role: "Mechanic"
              },
              {
                quote: "It adapts to how I work — not the other way around. Brilliant execution.",
                author: "Sam R.",
                role: "Contractor"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 10px 30px rgba(0, 198, 195, 0.1)",
                  transition: { duration: 0.3 }
                }}
                className="bg-card p-8 rounded-xl border border-border transition-all duration-300"
              >
                <div className="text-4xl text-primary mb-4 opacity-50">"</div>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  {testimonial.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">— {testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border relative z-10 bg-slate-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Fix-ISH Logo" className="w-8 h-8" />
              <div>
                <p className="font-medium">Fix-ISH by Lavern Williams</p>
                <p className="text-sm text-muted-foreground">Adaptive Intelligence for the Real World.</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
              <a href="mailto:support@fixish.ai" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              © 2025 Lavern Williams AI Technologies. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Fix-ISH™ is a trademark of Lavern Williams AI.
            </p>
            <p className="text-sm text-muted-foreground">
              <a href="mailto:support@fixish.ai" className="hover:text-primary transition-colors">support@fixish.ai</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
