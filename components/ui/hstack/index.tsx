import React from 'react';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { View } from 'react-native';
import type { ViewProps } from 'react-native';
import { hstackStyle } from './styles';

type IHStackProps = ViewProps & VariantProps<typeof hstackStyle>;

const HStack = ({
  className,
  space,
  reversed,
  ref,
  ...props
}: IHStackProps & { ref?: React.Ref<React.ComponentRef<typeof View>> }) => {
  return (
    <View
      className={hstackStyle({
        space,
        reversed: reversed as boolean,
        class: className,
      })}
      {...props}
      ref={ref}
    />
  );
};

HStack.displayName = 'HStack';

export { HStack };
