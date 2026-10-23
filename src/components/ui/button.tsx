import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary-strong)]",
        secondary: "bg-[var(--secondary-soft)] text-[var(--primary-strong)] hover:bg-[#c7e5df]",
        outline: "border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--surface)]",
        ghost: "text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
      },
      size: {
        default: "min-h-11 px-4 py-2.5",
        sm: "min-h-9 px-3 py-2 text-xs",
        lg: "min-h-12 px-5 py-3 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
