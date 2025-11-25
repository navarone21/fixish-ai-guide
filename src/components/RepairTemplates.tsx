import { motion } from "framer-motion";
import { Wrench, Car, Smartphone, Hammer, Zap, Cpu, Droplet, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RepairTemplatesProps {
  onSelectTemplate: (template: string) => void;
}

const templates = [
  {
    icon: Car,
    title: "Vehicle Repair",
    prompt: "I need help repairing my vehicle. I have a [describe issue]",
    color: "from-blue-500/10 to-cyan-500/10",
  },
  {
    icon: Smartphone,
    title: "Electronics",
    prompt: "My electronic device has a problem. It's a [device type] with [issue]",
    color: "from-purple-500/10 to-pink-500/10",
  },
  {
    icon: Home,
    title: "Home Repair",
    prompt: "I have a home repair issue with [what part of the house]",
    color: "from-orange-500/10 to-red-500/10",
  },
  {
    icon: Zap,
    title: "Electrical",
    prompt: "I'm having electrical issues with [describe the problem]",
    color: "from-yellow-500/10 to-orange-500/10",
  },
  {
    icon: Droplet,
    title: "Plumbing",
    prompt: "I have a plumbing problem: [describe leak, clog, or issue]",
    color: "from-blue-400/10 to-blue-600/10",
  },
  {
    icon: Cpu,
    title: "Computer",
    prompt: "My computer has [hardware/software] issue. Specifically: [describe]",
    color: "from-green-500/10 to-emerald-500/10",
  },
  {
    icon: Hammer,
    title: "General DIY",
    prompt: "I'm working on a DIY project and need help with [describe task]",
    color: "from-slate-500/10 to-gray-500/10",
  },
  {
    icon: Wrench,
    title: "Custom Issue",
    prompt: "I have a repair/fix issue with: ",
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
          <h2 className="text-2xl font-semibold mb-2">What can I help you fix today?</h2>
          <p className="text-muted-foreground">Choose a category or describe your repair issue</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {templates.map((template, index) => (
            <motion.div
              key={template.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Button
                variant="outline"
                onClick={() => onSelectTemplate(template.prompt)}
                className={`w-full h-auto p-4 flex flex-col items-start gap-2 hover:shadow-lg transition-all duration-300 border-border/50 bg-gradient-to-br ${template.color} hover:border-primary/30`}
              >
                <template.icon className="w-6 h-6 text-primary" />
                <span className="font-medium text-sm">{template.title}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
