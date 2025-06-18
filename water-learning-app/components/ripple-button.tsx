"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { useRipple } from "../hooks/use-ripple"

interface RippleButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode
}

export const RippleButton: React.FC<RippleButtonProps> = ({ children, className = "", onClick, ...props }) => {
  const createRipple = useRipple()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(event)
    if (onClick) {
      onClick(event)
    }
  }

  return (
    <Button className={`relative overflow-hidden ${className}`} onClick={handleClick} {...props}>
      {children}
    </Button>
  )
}
