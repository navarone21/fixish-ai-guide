import { Wrench, Package, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Tool {
  name: string;
  type: "tool" | "part" | "material";
  required: boolean;
  alternatives?: string[];
}

interface ToolRecommendationsProps {
  tools: Tool[];
}

export const ToolRecommendations = ({ tools }: ToolRecommendationsProps) => {
  if (!tools || tools.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "tool":
        return <Wrench className="h-4 w-4" />;
      case "part":
        return <Package className="h-4 w-4" />;
      case "material":
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <Wrench className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="my-4"
    >
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="h-5 w-5 text-primary" />
            Tools & Materials Needed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {tools.map((tool, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/50 p-3"
              >
                <div className="mt-0.5 text-primary">{getIcon(tool.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tool.name}</span>
                    {tool.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  {tool.alternatives && tool.alternatives.length > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium">Alternatives:</span>{" "}
                      {tool.alternatives.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
