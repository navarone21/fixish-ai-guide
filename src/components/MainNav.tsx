import React from "react";
import { Link } from "react-router-dom";

export default function MainNav() {
  return (
    <div className="w-full bg-black/70 backdrop-blur-md text-white px-6 py-3 flex items-center gap-6 border-b border-white/10 z-50">
      <div className="font-bold text-xl tracking-wide">Fix-ISH</div>

      <Link to="/live" className="hover:text-primary transition-colors">Live Repair</Link>
      <Link to="/steps" className="hover:text-primary transition-colors">Steps</Link>
      <Link to="/mesh" className="hover:text-primary transition-colors">Mesh</Link>
      <Link to="/projects" className="hover:text-primary transition-colors">Projects</Link>
      <Link to="/features" className="hover:text-primary transition-colors">Features</Link>
      <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
      <Link to="/" className="ml-auto hover:text-primary transition-colors">Home</Link>
    </div>
  );
}
