"use client";
import {
  useStyleContext,
  withStyleContext,
  type VariantProps,
} from "@gluestack-ui/utils/nativewind-utils";
import React from "react";
import { Text, View } from "react-native";
import { badgeIconStyle, badgeStyle, badgeTextStyle } from "./styles";

const SCOPE = "BADGE";

const BadgeRoot = withStyleContext(View, SCOPE);

type IBadgeProps = React.ComponentPropsWithoutRef<typeof View> &
  VariantProps<typeof badgeStyle>;
const Badge = React.forwardRef<any, IBadgeProps>(
  (
    { className, action = "info", variant = "solid", size = "md", ...props },
    ref,
  ) => {
    return (
      <BadgeRoot
        className={badgeStyle({ action, variant, size, class: className })}
        context={{ action, variant, size }}
        {...props}
        ref={ref}
      />
    );
  },
);

type IBadgeTextProps = React.ComponentPropsWithoutRef<typeof Text> &
  VariantProps<typeof badgeTextStyle>;
const BadgeText = React.forwardRef<any, IBadgeTextProps>(
  ({ className, ...props }, ref) => {
    const { size: parentSize, action: parentAction } = useStyleContext(SCOPE);
    return (
      <Text
        className={badgeTextStyle({
          parentVariants: {
            size: parentSize,
            action: parentAction,
          },
          class: className,
        })}
        {...props}
        ref={ref}
      />
    );
  },
);

type IBadgeIconProps = React.ComponentPropsWithoutRef<typeof View> &
  VariantProps<typeof badgeIconStyle> & {
    as?: React.ElementType;
    height?: number;
    width?: number;
  };
const BadgeIcon = React.forwardRef<any, IBadgeIconProps>(
  ({ className, as: As, size, ...props }, ref) => {
    const { size: parentSize, action: parentAction } = useStyleContext(SCOPE);

    if (As) {
      return (
        <As
          className={badgeIconStyle({
            parentVariants: {
              size: parentSize,
              action: parentAction,
            },
            size,
            class: className,
          })}
          {...props}
          ref={ref}
        />
      );
    }
    return (
      <View
        className={badgeIconStyle({
          parentVariants: {
            size: parentSize,
            action: parentAction,
          },
          size,
          class: className,
        })}
        {...props}
        ref={ref}
      />
    );
  },
);

Badge.displayName = "Badge";
BadgeText.displayName = "BadgeText";
BadgeIcon.displayName = "BadgeIcon";

export { Badge, BadgeIcon, BadgeText };
