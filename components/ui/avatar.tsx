import * as React from "react";
import { cn, avatarGradient, initials } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  firstName?: string;
  lastName?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
  xl: "size-20 text-2xl",
};

function Avatar({ name, firstName, lastName, size = "md", className, ...props }: AvatarProps) {
  const [first, ...rest] = name.split(" ");
  const seed = `${firstName ?? first ?? ""} ${lastName ?? rest.join(" ") ?? ""}`.trim();
  const label = firstName && lastName ? initials(firstName, lastName) : initials(first, rest.join(" ") || name);

  return (
    <div
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-gradient-to-br font-semibold text-white shadow-sm",
        avatarGradient(seed || name),
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
      {...props}
    >
      {label}
    </div>
  );
}

Avatar.displayName = "Avatar";

export { Avatar };