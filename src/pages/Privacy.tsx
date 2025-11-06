import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-minimal.png";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <img src={logo} alt="Fix-ISH Logo" className="w-8 h-8" />
          <h1 className="text-xl font-medium tracking-tight">Fix-ISH Privacy Policy</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="prose prose-slate max-w-none"
        >
          <h1 className="text-4xl font-light mb-6 tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> January 6, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Welcome to Fix-ISH, operated by Lavern Williams AI Technologies ("we," "us," or "our"). 
              We are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use 
              our AI-powered repair assistance platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Account information (name, email address)</li>
              <li>Images, videos, and documents you upload for repair assistance</li>
              <li>Chat conversations and feedback submissions</li>
              <li>Payment information (processed securely through third-party providers)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">2.2 Information Automatically Collected</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Device information (browser type, operating system, IP address)</li>
              <li>Usage data (features used, session duration, pages visited)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide AI-powered repair guidance and generate personalized tutorials</li>
              <li>Improve our machine learning models and service quality</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send service updates, security alerts, and support communications</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Prevent fraud and ensure platform security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>AES-256 encryption for data at rest and in transit</li>
              <li>SOC 2 compliant infrastructure</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication protocols</li>
              <li>Secure data centers with redundant backups</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We do not sell your personal information. We may share data only in these circumstances:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Service Providers:</strong> Trusted third parties who assist in operations (hosting, payment processing)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">6. Your Privacy Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access, correct, or delete your personal information</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of marketing communications</li>
              <li>Request restriction of data processing</li>
              <li>Object to automated decision-making</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your information only as long as necessary to provide services and comply with legal obligations. 
              Starter plan users: 7-day chat memory. Pro/Enterprise: unlimited storage unless you request deletion. 
              You may delete your account and all associated data at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Fix-ISH is not intended for users under 13 years of age. We do not knowingly collect information from children. 
              If we become aware of such collection, we will delete the information immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">9. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data may be transferred to and processed in countries outside your residence. We ensure appropriate 
              safeguards are in place, including standard contractual clauses and compliance with international data 
              protection frameworks.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy periodically. Changes will be posted on this page with an updated 
              effective date. Significant changes will be communicated via email or platform notification. 
              Continued use of Fix-ISH after changes constitutes acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions, concerns, or requests regarding your privacy and data:
            </p>
            <div className="bg-card p-6 rounded-xl border border-border mt-4">
              <p className="font-medium mb-2">Lavern Williams AI Technologies</p>
              <p className="text-muted-foreground">
                Email: <a href="mailto:support@fixish.ai" className="text-primary hover:underline">support@fixish.ai</a>
              </p>
              <p className="text-muted-foreground">Privacy Officer: Lavern Williams</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
            <p>© 2025 Lavern Williams AI Technologies. All rights reserved.</p>
            <p>Fix-ISH™ is a trademark of Lavern Williams AI.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Privacy;
