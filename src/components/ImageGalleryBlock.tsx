import { useState } from "react";
import { Images } from "lucide-react";
import { LightboxGallery } from "./LightboxGallery";

interface ImageGalleryBlockProps {
  images: Array<{ url: string; alt?: string }>;
  isDarkMode: boolean;
}

export const ImageGalleryBlock = ({ images, isDarkMode }: ImageGalleryBlockProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <>
      <div className="space-y-2">
        {/* Gallery header */}
        <div className="flex items-center gap-2 mb-3">
          <Images className="w-4 h-4" style={{ color: "#00C2B2" }} />
          <span className="text-sm font-medium" style={{ color: isDarkMode ? "#EAEAEA" : "#1A1C1E" }}>
            Image Gallery ({images.length} {images.length === 1 ? "image" : "images"})
          </span>
        </div>

        {/* Grid layout */}
        <div
          className={`grid gap-3 ${
            images.length === 1
              ? "grid-cols-1"
              : images.length === 2
              ? "grid-cols-2"
              : images.length === 3
              ? "grid-cols-3"
              : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
          }`}
        >
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="relative group overflow-hidden rounded-lg border transition-all hover:shadow-lg aspect-square"
              style={{
                borderColor: isDarkMode ? "rgba(0, 194, 178, 0.3)" : "rgba(0, 194, 178, 0.2)",
              }}
            >
              <img
                src={image.url}
                alt={image.alt || `Image ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              
              {/* Overlay on hover */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0, 0, 0, 0.6)" }}
              >
                <div className="text-white text-center">
                  <Images className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-xs">View Full Size</span>
                </div>
              </div>

              {/* Index badge */}
              {images.length > 1 && (
                <div
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "rgba(0, 194, 178, 0.9)",
                    color: "#FFFFFF",
                  }}
                >
                  {index + 1}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Instructions */}
        {images.length > 1 && (
          <p className="text-xs mt-2" style={{ color: "#999999" }}>
            Click any image to open gallery. Use arrow keys or swipe to navigate.
          </p>
        )}
      </div>

      {/* Lightbox */}
      <LightboxGallery
        images={images}
        initialIndex={selectedIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        isDarkMode={isDarkMode}
      />
    </>
  );
};
