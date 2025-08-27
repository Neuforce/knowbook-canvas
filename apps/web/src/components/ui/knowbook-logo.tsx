import NextImage from "next/image";
import { cn } from "@/lib/utils";

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
  const iconSrc = variant === "dark" ? "/knowbook-icon-white.png" : "/knowbook-icon.png";
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <NextImage
        src={iconSrc}
        width={size}
        height={size}
        alt="Knowbook Logo"
        className="rounded-lg"
        priority
      />
      {showText && (
        <span 
          className={cn(
            "font-bold",
            variant === "dark" ? "text-white" : "text-gray-900",
            textClassName
          )}
          style={{ fontFamily: 'Urbanist, sans-serif' }}
        >
          knowbook
        </span>
      )}
    </div>
  );
}

// CSS-in-JS approach for dynamic theming
export const knowbookLogoStyles = {
  light: {
    icon: "/knowbook-icon.png",
    textColor: "text-gray-900",
  },
  dark: {
    icon: "/knowbook-icon-white.png", 
    textColor: "text-white",
  },
} as const;

// Utility function for programmatic access
export function getKnowbookIcon(isDark: boolean = false): string {
  return isDark ? "/knowbook-icon-white.png" : "/knowbook-icon.png";
}

export function getKnowbookTextColor(isDark: boolean = false): string {
  return isDark ? "text-white" : "text-gray-900";
}
