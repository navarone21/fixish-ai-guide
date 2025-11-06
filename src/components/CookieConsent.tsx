import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Cookie } from "lucide-react";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const consent = localStorage.getItem("fixish_cookie_consent");
    if (!consent) {
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
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-4 left-4 z-50"
        >
          <div
            className="backdrop-blur-xl rounded-full shadow-2xl border px-4 py-2 flex items-center gap-2 max-w-[280px]"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderColor: "rgba(0, 194, 178, 0.3)",
            }}
          >
            <Cookie className="w-4 h-4 shrink-0" style={{ color: "#00C2B2" }} />
            <p className="text-xs flex-1" style={{ color: "#1A1C1E" }}>
              We use cookies.{" "}
              <button
                onClick={handleLearnMore}
                className="text-primary hover:underline font-medium"
              >
                Learn more
              </button>
            </p>
            <Button
              onClick={handleAccept}
              size="sm"
              className="h-6 px-3 text-xs shrink-0"
              style={{
                background: "#00C2B2",
                color: "#FFFFFF",
              }}
            >
              OK
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
