import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 px-6">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Link to="/" className="text-2xl font-bold text-primary mb-2 block">
              Fix-ISH
            </Link>
            <p className="text-muted-foreground">
              Your Professional AI Assistant for Any Task
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              © {new Date().getFullYear()} Fix-ISH. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 md:justify-end">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
