import React from "react";
import { Link } from "react-router-dom";

export default function MainNav() {
  return (
    <div className="w-full bg-black/70 backdrop-blur-md text-white px-6 py-3 flex items-center gap-6 border-b border-white/10 z-50 overflow-x-auto">
      <div className="font-bold text-xl tracking-wide whitespace-nowrap">Fix-ISH</div>

      <Link to="/explore" className="hover:text-primary transition-colors whitespace-nowrap">Explore</Link>
      <Link to="/live" className="hover:text-primary transition-colors whitespace-nowrap">Live Repair</Link>
      <Link to="/replay" className="hover:text-primary transition-colors whitespace-nowrap">Replay</Link>
      <Link to="/steps" className="hover:text-primary transition-colors whitespace-nowrap">Steps</Link>
      <Link to="/mesh" className="hover:text-primary transition-colors whitespace-nowrap">Mesh</Link>
      <Link to="/depth" className="hover:text-primary transition-colors whitespace-nowrap">Depth</Link>
      <Link to="/tools" className="hover:text-primary transition-colors whitespace-nowrap">Tools</Link>
      <Link to="/feature-toggles" className="hover:text-primary transition-colors whitespace-nowrap">Features</Link>
      <Link to="/diag" className="hover:text-primary transition-colors whitespace-nowrap">Logs</Link>
      <Link to="/settings" className="ml-auto hover:text-primary transition-colors whitespace-nowrap">Settings</Link>
    </div>
  );
}
