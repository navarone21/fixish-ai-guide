import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="py-12 px-6 bg-muted/30 border-t border-border">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Link to="/" className="text-2xl font-bold text-primary mb-4 block">
              Fix-ISH
            </Link>
            <p className="text-muted-foreground mb-2">
              Adaptive AI for real-world problem solving
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Fix-ISH by Lavern Williams. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col md:items-end space-y-2">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <a href="mailto:support@fixish.ai" className="text-muted-foreground hover:text-primary transition-colors">
              support@fixish.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
