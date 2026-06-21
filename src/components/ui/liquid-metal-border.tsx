import type React from "react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface LiquidMetalBorderProps {
  children: React.ReactNode
  className?: string
  borderRadius?: number
  borderWidth?: number
  colorBack?: string
  colorTint?: string
  repetition?: number
  softness?: number
  shiftRed?: number
  shiftBlue?: number
  distortion?: number
  contour?: number
  angle?: number
  speed?: number
  scale?: number
  opacity?: number
  theme?: "light" | "dark"
}

export function LiquidMetalBorder({
  children,
  className,
  borderRadius = 9999,
  borderWidth = 3,
  opacity = 0.7,
  theme = "dark",
}: LiquidMetalBorderProps) {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        rootMargin: "100px",
        threshold: 0,
      },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{
        borderRadius,
        padding: borderWidth,
      }}
    >
      <div className="absolute inset-0 z-0 overflow-hidden" style={{ borderRadius, opacity }}>
        {isVisible ? (
          <div
            className="w-full h-full animate-gradient-shift"
            style={{
              background:
                theme === "light"
                  ? "linear-gradient(135deg, #e5e7eb 0%, #9ca3af 25%, #d1d5db 50%, #9ca3af 75%, #e5e7eb 100%)"
                  : "linear-gradient(135deg, #71717a 0%, #52525b 25%, #a1a1aa 50%, #52525b 75%, #71717a 100%)",
              backgroundSize: "300% 300%",
            }}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                theme === "light"
                  ? "linear-gradient(135deg, #d1d5db 0%, #9ca3af 50%, #d1d5db 100%)"
                  : "linear-gradient(135deg, #71717a 0%, #52525b 50%, #71717a 100%)",
            }}
          />
        )}
      </div>

      <div
        className="relative z-10"
        style={{
          borderRadius: borderRadius - borderWidth,
        }}
      >
        {children}
      </div>
    </div>
  )
}
