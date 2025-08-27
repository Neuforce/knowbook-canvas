import NextImage from "next/image";
import { cn } from "@/lib/utils";
import { components, getFont } from "@/lib/design-tokens";

interface KnowbookLogoProps {
  /**
   * Theme variant - automatically selects appropriate icon color
   * @default "light"
   */
  variant?: "light" | "dark";
  /**
   * Size of the logo icon
   * @default 36
   */
  size?: number;
  /**
   * Whether to show the text alongside the icon
   * @default true
   */
  showText?: boolean;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  /**
   * Additional CSS classes for the text
   */
  textClassName?: string;
}

export function KnowbookLogo({
  variant = "light",
  size = 36,
  showText = true,
  className,
  textClassName,
}: KnowbookLogoProps) {
  const logoConfig = components.knowbookLogo.variants[variant];
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <NextImage
        src={logoConfig.icon}
        width={size}
        height={size}
        alt="Knowbook Logo"
        className="rounded-lg"
      />
      {showText && (
        <span 
          className={cn(
            "font-bold",
            variant === "dark" ? "text-white" : "text-gray-900",
            textClassName
          )}
          style={{ fontFamily: getFont('brand') }}
        >
          knowbook
        </span>
      )}
    </div>
  );
}

// Utility functions for programmatic access (using design tokens)
export function getKnowbookIcon(isDark: boolean = false): string {
  const variant = isDark ? "dark" : "light";
  return components.knowbookLogo.variants[variant].icon;
}

export function getKnowbookTextColor(isDark: boolean = false): string {
  return isDark ? "text-white" : "text-gray-900";
}

// Re-export design tokens for external use
export { components as knowbookLogoTokens } from "@/lib/design-tokens";
