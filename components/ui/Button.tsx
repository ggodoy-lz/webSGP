import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "gold";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:   "bg-[#212226] text-white hover:bg-[#f0552f]",
  secondary: "bg-[#f0552f] text-white hover:bg-[#d1401e]",
  outline:   "border border-[#212226] text-[#212226] hover:bg-[#212226] hover:text-white",
  ghost:     "text-[#212226] hover:text-[#f0552f]",
  gold:      "bg-[#f2b33d] text-[#212226] hover:bg-[#e0a02c]",
};

const sizes: Record<Size, string> = {
  sm: "text-[10px] px-4 py-2   tracking-[0.15em]",
  md: "text-xs    px-6 py-3   tracking-[0.15em]",
  lg: "text-xs    px-8 py-4   tracking-[0.2em]",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  external?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", href, external, className, children, ...rest }, ref) => {
    const cls = cn("inline-flex items-center gap-2 font-black uppercase transition-colors duration-200", variants[variant], sizes[size], className);
    if (href) {
      if (external) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>;
      return <Link href={href} className={cls}>{children}</Link>;
    }
    return <button ref={ref} className={cls} {...rest}>{children}</button>;
  }
);
Button.displayName = "Button";
export default Button;
