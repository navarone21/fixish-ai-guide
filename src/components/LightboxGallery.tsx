import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

interface LightboxGalleryProps {
  images: Array<{ url: string; alt?: string }>;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const LightboxGallery = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  isDarkMode,
}: LightboxGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, goToPrevious, goToNext]);

  // Reset index when gallery opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: "rgba(0, 0, 0, 0.95)" }}
        onClick={onClose}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full"
          style={{
            background: "rgba(0, 194, 178, 0.2)",
            color: "#FFFFFF",
          }}
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Image counter */}
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium z-10"
          style={{
            background: "rgba(0, 194, 178, 0.2)",
            color: "#FFFFFF",
          }}
        >
          {currentIndex + 1} / {images.length}
        </div>

        {/* Previous button */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full"
            style={{
              background: "rgba(0, 194, 178, 0.2)",
              color: "#FFFFFF",
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
        )}

        {/* Next button */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full"
            style={{
              background: "rgba(0, 194, 178, 0.2)",
              color: "#FFFFFF",
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        )}

        {/* Image display */}
        <div
          className="relative w-full h-full flex items-center justify-center p-8"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex].url}
              alt={images[currentIndex].alt || `Image ${currentIndex + 1}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="max-w-full max-h-full object-contain rounded-lg"
              style={{
                boxShadow: "0 0 40px rgba(0, 194, 178, 0.3)",
              }}
            />
          </AnimatePresence>
        </div>

        {/* Thumbnail strip (for galleries with 2-8 images) */}
        {images.length > 1 && images.length <= 8 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <div
              className="flex gap-2 p-2 rounded-xl"
              style={{ background: "rgba(0, 194, 178, 0.2)" }}
            >
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className="relative w-16 h-16 rounded-lg overflow-hidden transition-all"
                  style={{
                    border:
                      index === currentIndex
                        ? "2px solid #00C2B2"
                        : "2px solid transparent",
                    opacity: index === currentIndex ? 1 : 0.6,
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Swipe hint (mobile) */}
        {images.length > 1 && (
          <div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 text-xs text-center px-4 py-2 rounded-full md:hidden"
            style={{
              background: "rgba(0, 194, 178, 0.2)",
              color: "#FFFFFF",
            }}
          >
            Swipe left or right to navigate
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
