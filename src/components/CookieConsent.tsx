import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem("fixish_cookie_consent");
    if (!consent) {
      // Small delay before showing banner for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("fixish_cookie_consent", "true");
    setShowBanner(false);
  };

  const handleLearnMore = () => {
    navigate("/privacy");
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl mx-auto"
        >
          <div
            className="backdrop-blur-xl rounded-2xl shadow-2xl border px-6 py-4"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              borderColor: "rgba(0, 194, 178, 0.2)",
            }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-center sm:text-left flex-1" style={{ color: "#1A1C1E" }}>
                Fix-ISH uses cookies for basic functionality and analytics.{" "}
                <button
                  onClick={handleLearnMore}
                  className="text-primary hover:underline font-medium"
                >
                  Learn more in our Privacy Policy
                </button>
                .
              </p>
              
              <div className="flex gap-3 shrink-0">
                <Button
                  onClick={handleAccept}
                  className="transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: "#00C2B2",
                    color: "#FFFFFF",
                  }}
                >
                  Accept
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
