import { useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Image, Video, Mic, FileText, Sparkles } from "lucide-react";

interface UploadZoneProps {
  onFilesSelected: (files: FileList) => void;
  isProcessing: boolean;
}

export function UploadZone({ onFilesSelected, isProcessing }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => inputRef.current?.click();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onFilesSelected(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <motion.div 
      className="mx-6 mt-4 mb-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf"
        onChange={handleChange}
        className="hidden"
      />
      
      <motion.button
        onClick={handleClick}
        className="w-full relative overflow-hidden rounded-xl border border-dashed border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.05] hover:border-primary/30 transition-all group"
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        {/* Animated gradient border */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.1), transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="relative flex items-center justify-center gap-4 py-4 px-6">
          {/* Upload icon */}
          <motion.div
            className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"
            animate={isProcessing ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Upload className="h-5 w-5 text-primary" />
          </motion.div>

          <div className="text-left">
            <p className="text-sm font-medium text-foreground/80">Drop files or click to upload</p>
            <p className="text-xs text-muted-foreground/50">Auto-routed to the correct subsystem</p>
          </div>

          {/* Supported types */}
          <div className="flex items-center gap-1.5 ml-auto">
            {[
              { icon: Image, color: 'hsl(180 100% 60%)' },
              { icon: Video, color: 'hsl(200 100% 60%)' },
              { icon: Mic, color: 'hsl(280 100% 60%)' },
              { icon: FileText, color: 'hsl(40 100% 60%)' },
            ].map((type, i) => (
              <motion.div
                key={i}
                className="h-6 w-6 rounded-lg bg-muted/10 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <type.icon className="h-3 w-3" style={{ color: type.color }} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}
