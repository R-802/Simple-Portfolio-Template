import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 dark:bg-primary-dark dark:text-primary-dark-foreground dark:hover:bg-primary-dark/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-secondary-dark dark:text-secondary-dark-foreground dark:hover:bg-secondary-dark/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 dark:bg-destructive-dark dark:text-destructive-dark-foreground dark:hover:bg-destructive-dark/80",
        outline:
          "text-foreground border dark:text-foreground-dark dark:border-foreground-dark",
        info: "border-transparent bg-info text-info-foreground hover:bg-info/80 dark:bg-info-dark dark:text-info-dark-foreground dark:hover:bg-info-dark/80",
        warning:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/80 dark:bg-warning-dark dark:text-warning-dark-foreground dark:hover:bg-warning-dark/80",
        success:
          "border-transparent bg-success text-success-foreground hover:bg-success/80 dark:bg-success-dark dark:text-success-dark-foreground dark:hover:bg-success-dark/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  darkMode?: {
    variant?: VariantProps<typeof badgeVariants>["variant"];
    className?: string;
  };
}

function Badge({ className, variant, darkMode, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant }),
        className,
        darkMode &&
          `dark:${badgeVariants({ variant: darkMode.variant || variant })}`,
        darkMode?.className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
