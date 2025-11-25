import { motion } from "framer-motion";
import { AlertTriangle, Wrench, CheckCircle, Package, Eye, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceScore } from "@/components/ConfidenceScore";
import { Progress } from "@/components/ui/progress";

interface Detection {
  label: string;
  confidence: number;
  box?: { x: number; y: number; width: number; height: number };
}

interface ResultsDisplayProps {
  type: 'detection' | 'analysis' | 'steps' | 'tools' | 'safety' | 'flow' | 'diagnose';
  data: any;
}

export function ResultsDisplay({ type, data }: ResultsDisplayProps) {
  if (type === 'detection') {
    return <DetectionResults detections={data.detections || []} />;
  }
  
  if (type === 'analysis') {
    return <AnalysisResults analysis={data} />;
  }
  
  if (type === 'steps') {
    return <StepsResults steps={data.steps || []} />;
  }
  
  if (type === 'tools') {
    return <ToolsResults tools={data.tools || []} />;
  }
  
  if (type === 'safety') {
    return <SafetyResults warnings={data.warnings || []} />;
  }
  
  if (type === 'flow') {
    return <FlowResults flow={data} />;
  }
  
  if (type === 'diagnose') {
    return <DiagnoseResults diagnosis={data} />;
  }
  
  return null;
}

function DetectionResults({ detections }: { detections: Detection[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Detected Objects</h3>
        <Badge variant="secondary">{detections.length} found</Badge>
      </div>
      
      <div className="grid gap-2">
        {detections.map((detection, i) => (
          <Card key={i} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{detection.label}</p>
                {detection.box && (
                  <p className="text-xs text-muted-foreground">
                    Position: ({detection.box.x}, {detection.box.y})
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {Math.round(detection.confidence * 100)}%
                </p>
                <Progress value={detection.confidence * 100} className="w-20 h-1.5 mt-1" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

function AnalysisResults({ analysis }: { analysis: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Analysis Results</h3>
      </div>
      
      <Card className="p-4">
        {analysis.parts && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Identified Parts</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.parts.map((part: string, i: number) => (
                <Badge key={i} variant="outline">
                  <Package className="w-3 h-3 mr-1" />
                  {part}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {analysis.condition && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Condition Assessment</h4>
            <p className="text-sm text-muted-foreground">{analysis.condition}</p>
          </div>
        )}
        
        {analysis.confidence && (
          <ConfidenceScore 
            score={analysis.confidence} 
            reasoning={analysis.reasoning}
          />
        )}
      </Card>
    </motion.div>
  );
}

function StepsResults({ steps }: { steps: string[] | any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Repair Steps</h3>
        <Badge variant="secondary">{steps.length} steps</Badge>
      </div>
      
      <div className="space-y-2">
        {steps.map((step, i) => {
          const stepText = typeof step === 'string' ? step : step.description || step.step;
          return (
            <Card key={i} className="p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{stepText}</p>
                  {typeof step === 'object' && step.warning && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3 h-3 mt-0.5" />
                      <span>{step.warning}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}

function ToolsResults({ tools }: { tools: string[] | any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <Wrench className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Required Tools</h3>
        <Badge variant="secondary">{tools.length} items</Badge>
      </div>
      
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {tools.map((tool, i) => {
            const toolName = typeof tool === 'string' ? tool : tool.name || tool.tool;
            const optional = typeof tool === 'object' && tool.optional;
            
            return (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30"
              >
                <Wrench className="w-4 h-4 text-primary" />
                <span className="text-sm flex-1">{toolName}</span>
                {optional && <Badge variant="outline" className="text-xs">Optional</Badge>}
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}

function SafetyResults({ warnings }: { warnings: string[] | any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold">Safety Warnings</h3>
      </div>
      
      <div className="space-y-2">
        {warnings.map((warning, i) => {
          const warningText = typeof warning === 'string' ? warning : warning.warning || warning.message;
          const severity = typeof warning === 'object' ? warning.severity : 'medium';
          
          return (
            <Card
              key={i}
              className={`p-4 border-l-4 ${
                severity === 'high'
                  ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
                  : severity === 'medium'
                  ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/20'
                  : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
              }`}
            >
              <div className="flex gap-3">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                  severity === 'high' ? 'text-red-500' : 'text-amber-500'
                }`} />
                <p className="text-sm">{warningText}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}

function FlowResults({ flow }: { flow: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Complete Fix-ISH Analysis</h3>
      </div>
      
      {flow.detection && <DetectionResults detections={flow.detection} />}
      {flow.analysis && <AnalysisResults analysis={flow.analysis} />}
      {flow.tools && <ToolsResults tools={flow.tools} />}
      {flow.safety && <SafetyResults warnings={flow.safety} />}
      {flow.steps && <StepsResults steps={flow.steps} />}
      
      {flow.confidence && (
        <ConfidenceScore 
          score={flow.confidence} 
          reasoning={flow.reasoning}
        />
      )}
    </motion.div>
  );
}

function DiagnoseResults({ diagnosis }: { diagnosis: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Quick Diagnosis</h3>
      </div>
      
      <Card className="p-4">
        {diagnosis.issue && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Identified Issue</h4>
            <p className="text-sm text-muted-foreground">{diagnosis.issue}</p>
          </div>
        )}
        
        {diagnosis.severity && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Severity</h4>
            <Badge variant={
              diagnosis.severity === 'high' ? 'destructive' : 
              diagnosis.severity === 'medium' ? 'default' : 
              'secondary'
            }>
              {diagnosis.severity.toUpperCase()}
            </Badge>
          </div>
        )}
        
        {diagnosis.recommendation && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Recommendation</h4>
            <p className="text-sm text-muted-foreground">{diagnosis.recommendation}</p>
          </div>
        )}
        
        {diagnosis.confidence && (
          <ConfidenceScore 
            score={diagnosis.confidence} 
            reasoning={diagnosis.reasoning}
          />
        )}
      </Card>
    </motion.div>
  );
}
