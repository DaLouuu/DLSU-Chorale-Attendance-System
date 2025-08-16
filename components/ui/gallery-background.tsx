"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface GalleryBackgroundProps {
  className?: string
}

export function GalleryBackground({ className }: GalleryBackgroundProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)

  const images = [
    "/images/choir-bcfc.png",
    "/images/choir-lpep.png",
    "/images/choir-b2b-2.png",
    "/images/choir-b2b-1.png",
    "/images/choir-tet.png",
    "/images/choir-tcc.png",
  ]

  useEffect(() => {
    console.log("GalleryBackground mounted, images:", images)
    setImagesLoaded(true)
    
    // Change active image every 6 seconds
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length)
    }, 6000)

    return () => {
      clearInterval(interval)
    }
  }, [images.length])

  useEffect(() => {
    console.log("Active image index:", activeImageIndex, "Image:", images[activeImageIndex])
  }, [activeImageIndex, images])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-red-500">
      {/* Debug info - remove this later */}
      <div className="absolute top-0 left-0 z-50 bg-white text-black p-2 text-xs">
        Debug: Active: {activeImageIndex}, Loaded: {imagesLoaded ? 'Yes' : 'No'}
      </div>
      
      {/* Dark overlay - reduced opacity to see photos better */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Images */}
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
            index === activeImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt={`DLSU Chorale performance ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
            onLoad={() => console.log(`Image ${index} loaded:`, src)}
            onError={(e) => console.error(`Image ${index} failed to load:`, src, e)}
          />
        </div>
      ))}

      {/* Musical note decorations */}
      <div className="absolute top-10 left-10 text-white/20 text-7xl z-20 transform -rotate-12">♪</div>
      <div className="absolute bottom-20 right-10 text-white/20 text-8xl z-20 transform rotate-12">♫</div>
      <div className="absolute top-1/3 right-20 text-white/20 text-6xl z-20 transform rotate-45">♩</div>
      <div className="absolute bottom-1/3 left-20 text-white/20 text-9xl z-20 transform -rotate-6">♬</div>

      {/* Subtle black gradient overlay instead of green */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-20" />
    </div>
  )
}
