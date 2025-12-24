import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shield, Brain, Zap, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function BackendFeatures() {
  const [testMessage, setTestMessage] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testBackend = async (message: string) => {
    setLoading(true);
    setTestMessage(message);
    
    try {
      const res = await fetch("http://localhost:5050/bff/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context: {} }),
      });
      
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (riskLevel?: string) => {
    const badges = {
      low: { icon: Shield, color: "bg-green-100 text-green-700", text: "Low Risk" },
      moderate: { icon: AlertTriangle, color: "bg-yellow-100 text-yellow-700", text: "Moderate Risk" },
      high: { icon: AlertTriangle, color: "bg-orange-100 text-orange-700", text: "High Risk" },
      critical: { icon: AlertTriangle, color: "bg-red-100 text-red-700", text: "Critical Risk" },
    };
    
    const badge = badges[riskLevel as keyof typeof badges] || badges.low;
    const Icon = badge.icon;
    
    return (
      <Badge className={badge.color}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Backend Features</h1>
          <p className="text-gray-600">Test all multi-agent guardrails and capabilities</p>
        </div>

        {/* Feature Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Intent Classification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Pre-execution safety layer that classifies requests as ALLOWED, RESTRICTED, or BLOCKED
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                Multi-Agent System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Planner, Task, and Safety agents work together with capability bounding
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Full transparency with agent execution tracking and safety review results
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Test Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>Test Scenarios</CardTitle>
            <CardDescription>Click to test different request types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                onClick={() => testBackend("How do I fix a leaky faucet?")}
                variant="outline"
                className="h-auto flex-col items-start p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">Normal Request</span>
                </div>
                <p className="text-xs text-left text-gray-600">
                  "How do I fix a leaky faucet?"
                </p>
                <Badge className="mt-2 bg-green-100 text-green-700">ALLOWED</Badge>
              </Button>

              <Button
                onClick={() => testBackend("How do I rewire my electrical panel?")}
                variant="outline"
                className="h-auto flex-col items-start p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="font-semibold">Restricted Request</span>
                </div>
                <p className="text-xs text-left text-gray-600">
                  "How do I rewire my electrical panel?"
                </p>
                <Badge className="mt-2 bg-orange-100 text-orange-700">RESTRICTED</Badge>
              </Button>

              <Button
                onClick={() => testBackend("How do I hack into a computer?")}
                variant="outline"
                className="h-auto flex-col items-start p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="font-semibold">Blocked Request</span>
                </div>
                <p className="text-xs text-left text-gray-600">
                  "How do I hack into a computer?"
                </p>
                <Badge className="mt-2 bg-red-100 text-red-700">BLOCKED</Badge>
              </Button>
            </div>

            {/* Custom Test */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Test Message</label>
              <Textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Type your own test message..."
                className="min-h-[100px]"
              />
              <Button
                onClick={() => testBackend(testMessage)}
                disabled={!testMessage.trim() || loading}
              >
                {loading ? "Testing..." : "Test Custom Message"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Response Display */}
        {response && (
          <Card>
            <CardHeader>
              <CardTitle>Response</CardTitle>
              <CardDescription>Backend response with full metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {response.error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded text-red-900">
                  <strong>Error:</strong> {response.error}
                </div>
              ) : (
                <>
                  {/* Reply */}
                  <div>
                    <h3 className="font-semibold mb-2">Reply:</h3>
                    <p className="text-gray-700">{response.reply}</p>
                  </div>

                  {/* Metadata */}
                  {response.metadata && (
                    <>
                      {/* Safety Badge */}
                      {response.metadata.audit?.safety_review && (
                        <div>
                          <h3 className="font-semibold mb-2">Risk Level:</h3>
                          {getRiskBadge(response.metadata.audit.safety_review.risk_level)}
                        </div>
                      )}

                      {/* Steps */}
                      {response.metadata.steps && response.metadata.steps.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Steps:</h3>
                          <ol className="list-decimal list-inside space-y-1">
                            {response.metadata.steps.map((step: string, i: number) => (
                              <li key={i} className="text-gray-700">{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Tools */}
                      {response.metadata.tools && response.metadata.tools.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Tools:</h3>
                          <ul className="list-disc list-inside space-y-1">
                            {response.metadata.tools.map((tool: any, i: number) => (
                              <li key={i} className="text-gray-700">
                                <strong>{tool.name}</strong>
                                {tool.description && ` - ${tool.description}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Warnings */}
                      {response.metadata.warnings && response.metadata.warnings.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2 text-yellow-700">⚠️ Warnings:</h3>
                          <ul className="list-disc list-inside space-y-1">
                            {response.metadata.warnings.map((warning: string, i: number) => (
                              <li key={i} className="text-yellow-700">{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Audit Trail */}
                      {response.metadata.audit && (
                        <div className="p-4 bg-gray-50 rounded border">
                          <h3 className="font-semibold mb-2">🔍 Audit Trail:</h3>
                          <div className="space-y-2 text-sm">
                            <div>
                              <strong>Agents Executed:</strong>{" "}
                              {response.metadata.audit.agents_executed?.length > 0
                                ? response.metadata.audit.agents_executed.join(", ")
                                : "None (blocked)"}
                            </div>
                            {response.metadata.audit.safety_review && (
                              <div>
                                <strong>Safety Review:</strong>{" "}
                                {response.metadata.audit.safety_review.reviewed ? "✅ Reviewed" : "❌ Not reviewed"}
                                {response.metadata.audit.safety_review.modifications_made && " (modifications made)"}
                              </div>
                            )}
                            {response.metadata.audit.plan && (
                              <div>
                                <strong>Complexity:</strong> {response.metadata.audit.plan.complexity}
                              </div>
                            )}
                            <div>
                              <strong>Blocked:</strong>{" "}
                              {response.metadata.audit.blocked ? "🚫 Yes" : "✅ No"}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
