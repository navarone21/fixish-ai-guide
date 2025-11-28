import React from "react";
import MainNav from "@/components/MainNav";
import { useFixishTool } from "@/hooks/useFixishTool";
import ToolHUD from "@/components/ToolHUD";
import { ToolRecommendations } from "@/components/ToolRecommendations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ToolsPanel() {
  const toolData = useFixishTool();

  // Sample tool recommendations
  const sampleTools = [
    { name: "Phillips Screwdriver", type: "tool" as const, required: true, alternatives: ["Flathead Screwdriver"] },
    { name: "Socket Wrench Set", type: "tool" as const, required: true },
    { name: "Replacement Gasket", type: "part" as const, required: true },
  ];

  return (
    <div className="w-full h-screen bg-black text-white">
      <MainNav />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Tools Panel</h1>
        <p className="text-muted-foreground mb-6">
          Monitor tool usage, recommendations, and real-time feedback during repairs.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-background/50 border-border">
            <CardHeader>
              <CardTitle>Current Tool</CardTitle>
              <CardDescription>Real-time tool monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              {toolData ? (
                <div className="space-y-4">
                  <ToolHUD tool={toolData} />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Tool</p>
                      <p className="text-lg font-bold">{toolData.tool_data?.tool_name || "Unknown"}</p>
                    </div>
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-lg font-bold">Active</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No tool detected</p>
                  <p className="text-sm mt-2">Start a repair session to monitor tools</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border">
            <CardHeader>
              <CardTitle>Tool Recommendations</CardTitle>
              <CardDescription>Suggested tools for current task</CardDescription>
            </CardHeader>
            <CardContent>
              <ToolRecommendations tools={sampleTools} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
