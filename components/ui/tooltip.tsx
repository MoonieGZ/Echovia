"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
}

export function Tooltip({ children, content, side = "top", align = "center" }: TooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const triggerRef = React.useRef<HTMLDivElement>(null)

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const tooltipHeight = 24 // Approximate height of tooltip
    const tooltipWidth = 100 // Approximate width of tooltip

    let top = 0
    let left = 0

    switch (side) {
    case "top":
      top = rect.top - tooltipHeight - 8
      break
    case "bottom":
      top = rect.bottom + 8
      break
    default:
      top = rect.top + (rect.height - tooltipHeight) / 2
    }

    switch (align) {
    case "start":
      left = rect.left
      break
    case "end":
      left = rect.right - tooltipWidth
      break
    default:
      left = rect.left + (rect.width - tooltipWidth) / 2
    }

    setPosition({ top, left })
  }, [side, align])

  React.useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener("scroll", updatePosition)
      window.addEventListener("resize", updatePosition)
    }
    return () => {
      window.removeEventListener("scroll", updatePosition)
      window.removeEventListener("resize", updatePosition)
    }
  }, [isOpen, updatePosition])

  return (
    <div
      ref={triggerRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className="inline-block"
    >
      {children}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground",
            "animate-in fade-in-0 zoom-in-95"
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
}

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const TooltipTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const TooltipContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
