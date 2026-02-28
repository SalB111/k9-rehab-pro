import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cva } from "class-variance-authority";

// ── K9 Button Variants ──
// Maps to existing S.btn("primary" | "dark" | "success" | "danger" | "ghost")
const k9ButtonVariants = cva(
  "inline-flex items-center gap-1.5 font-semibold tracking-wide text-[13px] transition-all",
  {
    variants: {
      k9: {
        primary: "bg-k9-teal text-white hover:bg-k9-teal-dark shadow-sm",
        dark:    "bg-k9-navy text-white hover:bg-k9-navy-mid shadow-sm",
        success: "bg-k9-green text-white hover:opacity-90 shadow-sm",
        danger:  "bg-k9-red text-white hover:opacity-90 shadow-sm",
        ghost:   "bg-k9-bg text-k9-text-mid hover:bg-k9-border-light",
        neon:    "bg-transparent text-k9-neon border border-k9-neon/30 hover:bg-k9-neon/10",
      },
    },
    defaultVariants: {
      k9: "primary",
    },
  }
);

export function K9Button({ k9, className, ...props }) {
  return <Button className={cn(k9ButtonVariants({ k9 }), className)} {...props} />;
}

// ── K9 Card (medical panel) ──
export function K9Card({ className, ...props }) {
  return (
    <Card
      className={cn(
        "rounded-[10px] border-k9-border shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        className
      )}
      {...props}
    />
  );
}

// ── K9 Badge ──
const k9BadgeVariants = cva(
  "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
  {
    variants: {
      k9: {
        blue:  "bg-k9-teal-light text-k9-teal-dark",
        green: "bg-k9-green-bg text-k9-green",
        amber: "bg-k9-amber-bg text-k9-amber",
        red:   "bg-k9-red-bg text-k9-red",
      },
    },
    defaultVariants: { k9: "blue" },
  }
);

export function K9Badge({ k9, className, ...props }) {
  return <Badge className={cn(k9BadgeVariants({ k9 }), className)} {...props} />;
}

// ── K9 Section Header ──
export function K9SectionHeader({ icon: Icon, children, className }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 py-1 text-[12px] font-extrabold uppercase tracking-[1.2px] text-white",
        className
      )}
    >
      {Icon && <Icon size={13} className="text-k9-neon" />}
      {children}
    </div>
  );
}
