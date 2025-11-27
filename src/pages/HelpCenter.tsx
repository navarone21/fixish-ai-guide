import React from "react";
import MainNav from "@/components/MainNav";
import { HelpCircle, Book, Video, MessageCircle } from "lucide-react";

export default function HelpCenter() {
  return (
    <div className="w-full h-screen bg-black text-white">
      <MainNav />

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Help Center</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-background/50 border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
            <Book className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Documentation</h3>
            <p className="text-muted-foreground text-sm">
              Learn how to use Fix-ISH features, AR guidance, and repair workflows.
            </p>
          </div>

          <div className="bg-background/50 border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
            <Video className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Video Tutorials</h3>
            <p className="text-muted-foreground text-sm">
              Watch step-by-step video guides for common repair tasks.
            </p>
          </div>

          <div className="bg-background/50 border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
            <HelpCircle className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">FAQ</h3>
            <p className="text-muted-foreground text-sm">
              Find answers to frequently asked questions about Fix-ISH.
            </p>
          </div>

          <div className="bg-background/50 border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
            <MessageCircle className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Contact Support</h3>
            <p className="text-muted-foreground text-sm">
              Get in touch with our support team for personalized help.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-background/50 border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Navigate to Live Repair to start an AR repair session</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Point your camera at damaged items for real-time analysis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Follow visual AR overlays and voice guidance for repair steps</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Use gestures or voice commands to control the repair flow</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>View recorded steps and 3D meshes in Steps and Mesh pages</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
