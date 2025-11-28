import React from "react";
import MainNav from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Camera, Layers, Play, Eye, Settings, Wrench, Activity, Book } from "lucide-react";

export default function ExplorePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Camera,
      title: "Live Repair",
      description: "Real-time AR guidance with camera overlay and step-by-step instructions",
      route: "/live",
      color: "text-blue-500"
    },
    {
      icon: Play,
      title: "Replay Mode",
      description: "Review and replay repair step animations to master techniques",
      route: "/replay",
      color: "text-green-500"
    },
    {
      icon: Layers,
      title: "3D Mesh Viewer",
      description: "Explore 3D reconstructions of repair environments and objects",
      route: "/mesh",
      color: "text-purple-500"
    },
    {
      icon: Eye,
      title: "Depth Vision",
      description: "Visualize depth maps and point cloud data from repairs",
      route: "/depth",
      color: "text-cyan-500"
    },
    {
      icon: Book,
      title: "Task Steps",
      description: "Browse step library with video tutorials and instructions",
      route: "/steps",
      color: "text-orange-500"
    },
    {
      icon: Wrench,
      title: "Tools Panel",
      description: "Monitor tool usage, angle, torque, and get recommendations",
      route: "/tools",
      color: "text-red-500"
    },
    {
      icon: Activity,
      title: "System Logs",
      description: "View diagnostics, performance metrics, and system status",
      route: "/diag",
      color: "text-yellow-500"
    },
    {
      icon: Settings,
      title: "Feature Toggles",
      description: "Customize which features are enabled for your workflow",
      route: "/feature-toggles",
      color: "text-pink-500"
    }
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white">
      <MainNav />

      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Explore Fix-ISH</h1>
          <p className="text-muted-foreground text-lg">
            Discover all the powerful features available for intelligent repair assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card 
              key={feature.route}
              className="bg-background/50 border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(feature.route)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(feature.route);
                  }}
                >
                  Open
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
