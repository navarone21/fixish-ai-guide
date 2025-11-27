import { useFixish } from "@/contexts/FixishProvider";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SafetyAlert() {
  const { safety } = useFixish();

  if (!safety || !safety.alert) return null;

  return (
    <Alert className="bg-destructive/10 border-destructive/50 animate-pulse">
      <AlertTriangle className="h-5 w-5 text-destructive" />
      <AlertDescription className="text-destructive font-medium ml-2">
        {safety.alert}
      </AlertDescription>
    </Alert>
  );
}
