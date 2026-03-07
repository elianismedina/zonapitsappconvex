import { tva } from "@gluestack-ui/utils/nativewind-utils";

export const badgeStyle = tva({
  base: "flex-row items-center rounded-sm",
  variants: {
    action: {
      error: "bg-error-50 border-error-100",
      warning: "bg-warning-50 border-warning-100",
      success: "bg-success-50 border-success-100",
      info: "bg-info-50 border-info-100",
      muted: "bg-secondary-50 border-secondary-100",
    },
    variant: {
      solid: "",
      outline: "bg-transparent border",
    },
    size: {
      sm: "px-1.5 py-0.5",
      md: "px-2 py-0.5",
      lg: "px-2.5 py-0.5",
    },
  },
});

export const badgeTextStyle = tva({
  base: "text-typography-900 font-medium web:select-none uppercase",
  parentVariants: {
    action: {
      error: "text-error-600",
      warning: "text-warning-600",
      success: "text-success-600",
      info: "text-info-600",
      muted: "text-secondary-600",
    },
    size: {
      sm: "text-2xs",
      md: "text-xs",
      lg: "text-sm",
    },
  },
});

export const badgeIconStyle = tva({
  base: "fill-none",
  parentVariants: {
    action: {
      error: "text-error-600",
      warning: "text-warning-600",
      success: "text-success-600",
      info: "text-info-600",
      muted: "text-secondary-600",
    },
    size: {
      sm: "h-3 w-3",
      md: "h-3.5 w-3.5",
      lg: "h-4 w-4",
    },
  },
});
