import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Camera, List, Box, Network, Activity, HelpCircle, Settings, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const FeaturesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const features = [
    { name: "Live AR Repair", path: "/live", icon: Camera, description: "Real-time AR repair guidance" },
    { name: "Steps Library", path: "/steps", icon: List, description: "View recorded repair steps" },
    { name: "3D Mesh Viewer", path: "/mesh", icon: Box, description: "Explore 3D reconstructions" },
    { name: "Scene Graph", path: "/scene", icon: Network, description: "View spatial relationships" },
    { name: "Diagnostics", path: "/diag", icon: Activity, description: "System performance metrics" },
    { name: "Help Center", path: "/help", icon: HelpCircle, description: "Guides and tutorials" },
    { name: "Settings", path: "/settings", icon: Settings, description: "Configure your experience" },
    { name: "Chat Assistant", path: "/chat", icon: MessageSquare, description: "Talk with Fix-ISH AI" },
  ];

  const handleFeatureClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors text-foreground"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="font-medium">Features</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 right-0 w-80 bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-2">
                {features.map((feature, index) => (
                  <motion.button
                    key={feature.path}
                    onClick={() => handleFeatureClick(feature.path)}
                    className="w-full flex items-start gap-3 px-3 py-3 rounded-md hover:bg-accent transition-colors text-left group"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <feature.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground">{feature.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{feature.description}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
