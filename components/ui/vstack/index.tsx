import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import React from "react";
import { View } from "react-native";

import { vstackStyle } from "./styles";

type IVStackProps = React.ComponentProps<typeof View> &
  VariantProps<typeof vstackStyle>;

const VStack = ({
  className,
  space,
  reversed,
  ref,
  ...props
}: IVStackProps & { ref?: React.Ref<React.ComponentRef<typeof View>> }) => {
  return (
    <View
      className={vstackStyle({
        space,
        reversed: reversed as boolean,
        class: className,
      })}
      {...props}
      ref={ref}
    />
  );
};

VStack.displayName = "VStack";

export { VStack };
