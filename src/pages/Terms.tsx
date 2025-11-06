import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-minimal.png";

const Terms = () => {
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
          <h1 className="text-xl font-medium tracking-tight">Fix-ISH Terms of Service</h1>
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
          <h1 className="text-4xl font-light mb-6 tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> January 6, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Fix-ISH ("Service"), operated by Lavern Williams AI Technologies ("Company," "we," "us," or "our"), 
              you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service. 
              We reserve the right to modify these Terms at any time, and continued use constitutes acceptance of changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Fix-ISH is an AI-powered repair assistance platform that provides:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Real-time visual analysis and repair guidance</li>
              <li>Step-by-step AI-generated tutorials</li>
              <li>Multimodal support for images, videos, and text</li>
              <li>AR overlay features (Pro and Enterprise plans)</li>
              <li>Adaptive learning and personalized recommendations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">3. User Accounts and Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>3.1 Account Creation:</strong> You must create an account to access certain features. You are responsible 
              for maintaining the confidentiality of your account credentials and for all activities under your account.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>3.2 Eligibility:</strong> You must be at least 13 years old to use Fix-ISH. Users under 18 require 
              parental or guardian consent.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>3.3 Account Security:</strong> Notify us immediately at support@fixish.ai of any unauthorized access 
              or security breaches.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You agree NOT to use Fix-ISH to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Violate any local, state, national, or international laws</li>
              <li>Upload harmful, illegal, or offensive content</li>
              <li>Attempt to reverse-engineer, decompile, or extract AI models</li>
              <li>Overload, disrupt, or attack the Service infrastructure</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Use the Service for commercial training of competing AI models</li>
              <li>Share account credentials with third parties</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">5. User Content and Uploads</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>5.1 Ownership:</strong> You retain ownership of all content you upload (images, videos, documents). 
              By uploading, you grant us a non-exclusive, worldwide, royalty-free license to process, store, and display 
              your content solely to provide the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>5.2 Responsibility:</strong> You are solely responsible for the accuracy, legality, and appropriateness 
              of uploaded content. We reserve the right to remove content that violates these Terms.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>5.3 AI Training:</strong> Uploaded content may be used to improve AI models and service quality, 
              in anonymized and aggregated form, unless you opt out in your account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>6.1 Company IP:</strong> All rights, title, and interest in Fix-ISH, including AI models, algorithms, 
              software, branding, and documentation, are owned by Lavern Williams AI Technologies. "Fix-ISH" and associated 
              logos are trademarks of Lavern Williams AI.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>6.2 AI-Generated Content:</strong> Tutorials and guidance generated by Fix-ISH are provided "as is" 
              for your personal use. You may not resell, redistribute, or commercialize AI-generated content without prior 
              written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">7. Subscriptions and Payments</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>7.1 Plans:</strong> Fix-ISH offers Starter (free), Pro ($29/month), and Enterprise (custom pricing) plans. 
              Pricing and features are subject to change with 30 days' notice.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>7.2 Billing:</strong> Subscriptions renew automatically unless canceled. You authorize us to charge 
              your payment method on each billing cycle. Refunds are not provided for partial months.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>7.3 Cancellation:</strong> You may cancel anytime. Access continues until the end of the current 
              billing period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">8. Disclaimers and Limitations of Liability</h2>
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl mb-4">
              <p className="font-medium text-yellow-900 mb-2">IMPORTANT SAFETY NOTICE</p>
              <p className="text-yellow-800 leading-relaxed">
                Fix-ISH provides AI-generated guidance for informational purposes only. It is NOT a substitute for 
                professional repair services, certified technicians, or expert advice. Always exercise caution, use proper 
                safety equipment, and consult professionals for complex or dangerous repairs.
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>8.1 No Warranties:</strong> The Service is provided "AS IS" and "AS AVAILABLE" without warranties 
              of any kind, express or implied, including merchantability, fitness for a particular purpose, or accuracy 
              of AI predictions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>8.2 Limitation of Liability:</strong> To the fullest extent permitted by law, Lavern Williams AI 
              Technologies shall not be liable for any indirect, incidental, consequential, or punitive damages, including 
              property damage, personal injury, or financial loss, arising from use of Fix-ISH. Our total liability shall 
              not exceed the amount you paid in the past 12 months.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">9. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless Lavern Williams AI Technologies, its affiliates, and employees 
              from any claims, damages, losses, or expenses arising from your use of the Service, violation of these Terms, 
              or infringement of third-party rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">10. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violations of these Terms, illegal 
              activity, or abusive behavior. Upon termination, you lose access to the Service and all stored data, except 
              where legally required to retain information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">11. Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>11.1 Governing Law:</strong> These Terms are governed by the laws of [Your Jurisdiction], without 
              regard to conflict of law principles.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>11.2 Arbitration:</strong> Any disputes shall be resolved through binding arbitration in accordance 
              with the rules of the American Arbitration Association, except where prohibited by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">12. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms at any time. Material changes will be communicated via email or platform notification. 
              Your continued use after changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-4">13. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions, concerns, or legal inquiries:
            </p>
            <div className="bg-card p-6 rounded-xl border border-border mt-4">
              <p className="font-medium mb-2">Lavern Williams AI Technologies</p>
              <p className="text-muted-foreground">
                Email: <a href="mailto:support@fixish.ai" className="text-primary hover:underline">support@fixish.ai</a>
              </p>
              <p className="text-muted-foreground">Legal Department: Lavern Williams</p>
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

export default Terms;
