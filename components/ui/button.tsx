"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <button
      ref={ref}
      data-slot="button"
      className={cn("button", `button-${variant}`, className)}
      {...props}
    />
  ),
)

Button.displayName = "Button"

export { Button }
