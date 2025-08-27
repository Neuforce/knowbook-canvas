import { cn } from "@/lib/utils";
import { createElement } from "react";

export function TighterText({
  className,
  children,
  as = "p",
}: {
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}) {
  return createElement(as, {
    className: cn("tracking-tighter", className),
    children,
  });
}
