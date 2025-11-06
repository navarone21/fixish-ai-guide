import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize } from "lucide-react";
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
  
  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Pinch zoom state
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState(1);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  const minZoom = 1;
  const maxZoom = 5;

  // Reset zoom when changing images
  const resetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    resetZoom();
  }, [images.length, resetZoom]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    resetZoom();
  }, [images.length, resetZoom]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, maxZoom));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, minZoom);
      if (newZoom === minZoom) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

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

  // Reset index and zoom when gallery opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      resetZoom();
    }
  }, [isOpen, initialIndex, resetZoom]);

  // Mouse wheel zoom (desktop)
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isOpen) return;
    
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    setZoom((prev) => {
      const newZoom = Math.max(minZoom, Math.min(maxZoom, prev + delta));
      if (newZoom === minZoom) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('wheel', handleWheel, { passive: false });
      return () => window.removeEventListener('wheel', handleWheel);
    }
  }, [isOpen, handleWheel]);

  // Get distance between two touch points
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Touch handlers for swipe and pinch zoom
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom start
      const distance = getTouchDistance(e.touches);
      setInitialPinchDistance(distance);
      setInitialZoom(zoom);
    } else if (e.touches.length === 1) {
      // Single touch for swipe or drag
      if (zoom > 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        });
      } else {
        setTouchEnd(null);
        setTouchStart(e.touches[0].clientX);
      }
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance) {
      // Pinch zoom
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      const scale = distance / initialPinchDistance;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, initialZoom * scale));
      setZoom(newZoom);
      
      if (newZoom === minZoom) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1) {
      if (zoom > 1 && isDragging) {
        // Pan when zoomed
        setPosition({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y,
        });
      } else {
        // Swipe for navigation
        setTouchEnd(e.touches[0].clientX);
      }
    }
  };

  const onTouchEnd = () => {
    setInitialPinchDistance(null);
    setIsDragging(false);
    
    // Only handle swipe if not zoomed
    if (zoom === 1 && touchStart !== null && touchEnd !== null) {
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe) {
        goToNext();
      } else if (isRightSwipe) {
        goToPrevious();
      }
    }
  };

  // Mouse drag for panning when zoomed (desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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

        {/* Image counter and zoom level */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          <div
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: "rgba(0, 194, 178, 0.2)",
              color: "#FFFFFF",
            }}
          >
            {currentIndex + 1} / {images.length}
          </div>
          {zoom > 1 && (
            <div
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: "rgba(0, 194, 178, 0.2)",
                color: "#FFFFFF",
              }}
            >
              {Math.round(zoom * 100)}%
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <div className="absolute right-4 top-20 flex flex-col gap-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            disabled={zoom >= maxZoom}
            className="h-10 w-10 rounded-full"
            style={{
              background: "rgba(0, 194, 178, 0.2)",
              color: "#FFFFFF",
            }}
            title="Zoom in (or scroll up)"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            disabled={zoom <= minZoom}
            className="h-10 w-10 rounded-full"
            style={{
              background: "rgba(0, 194, 178, 0.2)",
              color: "#FFFFFF",
            }}
            title="Zoom out (or scroll down)"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          {zoom > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
              }}
              className="h-10 w-10 rounded-full"
              style={{
                background: "rgba(0, 194, 178, 0.2)",
                color: "#FFFFFF",
              }}
              title="Reset zoom"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          )}
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
          className="relative w-full h-full flex items-center justify-center p-8 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              ref={imageRef}
              key={currentIndex}
              src={images[currentIndex].url}
              alt={images[currentIndex].alt || `Image ${currentIndex + 1}`}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                scale: zoom,
                x: position.x,
                y: position.y,
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                opacity: { duration: 0.3 },
                scale: { duration: 0.2 },
                x: { duration: 0 },
                y: { duration: 0 },
              }}
              className="max-w-full max-h-full object-contain rounded-lg select-none"
              style={{
                boxShadow: "0 0 40px rgba(0, 194, 178, 0.3)",
              }}
              draggable={false}
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

        {/* Interaction hints */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col gap-2 text-xs text-center">
          {zoom === 1 && images.length > 1 && (
            <div
              className="px-4 py-2 rounded-full md:hidden"
              style={{
                background: "rgba(0, 194, 178, 0.2)",
                color: "#FFFFFF",
              }}
            >
              Swipe or pinch to zoom • Swipe left/right to navigate
            </div>
          )}
          {zoom === 1 && (
            <div
              className="px-4 py-2 rounded-full hidden md:block"
              style={{
                background: "rgba(0, 194, 178, 0.2)",
                color: "#FFFFFF",
              }}
            >
              Scroll to zoom • Click and drag when zoomed
            </div>
          )}
          {zoom > 1 && (
            <div
              className="px-4 py-2 rounded-full"
              style={{
                background: "rgba(0, 194, 178, 0.2)",
                color: "#FFFFFF",
              }}
            >
              {isDragging ? "Dragging..." : "Drag to pan • Scroll to zoom"}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
