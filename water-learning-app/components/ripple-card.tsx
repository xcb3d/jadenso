"use client"

import type React from "react"
import { Card } from "@/components/ui/card"
import { useRipple } from "../hooks/use-ripple"

interface RippleCardProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode
  enableRipple?: boolean
}

export const RippleCard: React.FC<RippleCardProps> = ({
  children,
  className = "",
  onClick,
  enableRipple = true,
  ...props
}) => {
  const createRipple = useRipple()

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (enableRipple) {
      createRipple(event)
    }
    if (onClick) {
      onClick(event)
    }
  }

  return (
    <Card
      className={`relative overflow-hidden ${enableRipple ? "cursor-pointer" : ""} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Card>
  )
}
