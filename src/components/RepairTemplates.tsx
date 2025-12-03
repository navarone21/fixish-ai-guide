import { motion } from "framer-motion";
import { Wrench, Car, Smartphone, FileText, Zap, Cpu, Image, Home, Search, Lightbulb, MessageSquare, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RepairTemplatesProps {
  onSelectTemplate: (template: string) => void;
}

const templates = [
  {
    icon: Car,
    title: "Vehicle & Equipment",
    prompt: "I need help with my vehicle or equipment. The issue is [describe problem]",
    color: "from-blue-500/10 to-cyan-500/10",
  },
  {
    icon: Smartphone,
    title: "Electronics & Devices",
    prompt: "I have a problem with my electronic device: [describe the issue]",
    color: "from-purple-500/10 to-pink-500/10",
  },
  {
    icon: Home,
    title: "Home & DIY Projects",
    prompt: "I need guidance on a home project: [describe what you're working on]",
    color: "from-orange-500/10 to-red-500/10",
  },
  {
    icon: FileText,
    title: "Document Analysis",
    prompt: "Analyze this document and help me understand: ",
    color: "from-green-500/10 to-emerald-500/10",
  },
  {
    icon: Image,
    title: "Image Analysis",
    prompt: "Look at this image and tell me what you see. I need to know: ",
    color: "from-pink-500/10 to-rose-500/10",
  },
  {
    icon: Cpu,
    title: "Tech & Software",
    prompt: "I have a technical issue with [software/hardware]: [describe]",
    color: "from-violet-500/10 to-indigo-500/10",
  },
  {
    icon: Search,
    title: "Research & Learn",
    prompt: "Help me research and understand [topic or concept]",
    color: "from-teal-500/10 to-cyan-500/10",
  },
  {
    icon: Lightbulb,
    title: "Problem Solving",
    prompt: "I need help solving this problem: ",
    color: "from-yellow-500/10 to-amber-500/10",
  },
  {
    icon: Zap,
    title: "Quick Analysis",
    prompt: "Quickly analyze this and give me the key insights: ",
    color: "from-orange-400/10 to-yellow-500/10",
  },
  {
    icon: Wrench,
    title: "Repair & Fix",
    prompt: "I need to repair or fix: [describe the item and issue]",
    color: "from-slate-500/10 to-gray-500/10",
  },
  {
    icon: MessageSquare,
    title: "General Question",
    prompt: "I have a question about: ",
    color: "from-blue-400/10 to-blue-600/10",
  },
  {
    icon: HelpCircle,
    title: "Custom Task",
    prompt: "",
    color: "from-primary/10 to-primary/20",
  },
];

export function RepairTemplates({ onSelectTemplate }: RepairTemplatesProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">How can I assist you today?</h2>
          <p className="text-muted-foreground">Choose a category or type your request below</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {templates.map((template, index) => (
            <motion.div
              key={template.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
            >
              <Button
                variant="outline"
                onClick={() => onSelectTemplate(template.prompt)}
                className={`w-full h-auto p-4 flex flex-col items-center text-center gap-2 hover:shadow-lg transition-all duration-300 border-border/50 bg-gradient-to-br ${template.color} hover:border-primary/30 hover:scale-[1.02]`}
              >
                <template.icon className="w-6 h-6 text-primary" />
                <span className="font-medium text-xs">{template.title}</span>
              </Button>
            </motion.div>
          ))}
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Upload images, videos, or documents for enhanced AI analysis
        </motion.p>
      </motion.div>
    </div>
  );
}
