import { useState } from "react";
import { History, Trash2, CheckCircle, Clock, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useRepairHistory, RepairProject } from "@/hooks/useRepairHistory";
import { motion } from "framer-motion";

interface RepairHistoryDrawerProps {
  userId: string;
}

export const RepairHistoryDrawer = ({ userId }: RepairHistoryDrawerProps) => {
  const { projects, loading, deleteProject } = useRepairHistory(userId);
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "paused":
        return <Pause className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "paused":
        return "Paused";
      default:
        return status;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <History className="h-5 w-5" />
          {projects.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
              {projects.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Repair History
          </SheetTitle>
          <SheetDescription>
            Your saved repair projects and completed fixes
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading projects...</p>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No repair projects yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete repairs to build your history
              </p>
            </div>
          ) : (
            projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-lg border border-border bg-card p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(project.status)}
                      <h3 className="font-semibold">{project.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteProject(project.id)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {getStatusLabel(project.status)}
                  </Badge>
                  
                  {project.confidence_score && (
                    <Badge variant="outline" className="text-xs">
                      {Math.round(project.confidence_score * 100)}% confidence
                    </Badge>
                  )}
                  
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>

                {project.tools_used && project.tools_used.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Tools:</span>{" "}
                    {project.tools_used.join(", ")}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
