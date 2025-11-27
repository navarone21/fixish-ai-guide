import React from "react";
import { Link } from "react-router-dom";

export default function MainNav() {
  return (
    <div className="w-full bg-black/70 backdrop-blur-md text-white px-6 py-3 flex items-center gap-6 border-b border-white/10 z-50">
      <div className="font-bold text-xl tracking-wide">Fix-ISH</div>

      <Link to="/live" className="hover:text-primary transition-colors">Live Repair</Link>
      <Link to="/steps" className="hover:text-primary transition-colors">Steps</Link>
      <Link to="/mesh" className="hover:text-primary transition-colors">Mesh</Link>
      <Link to="/scene" className="hover:text-primary transition-colors">Scene</Link>
      <Link to="/diag" className="hover:text-primary transition-colors">Diagnostics</Link>
      <Link to="/help" className="hover:text-primary transition-colors">Help</Link>
      <Link to="/settings" className="ml-auto hover:text-primary transition-colors">Settings</Link>
    </div>
  );
}
