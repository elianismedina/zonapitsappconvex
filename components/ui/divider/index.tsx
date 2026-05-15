'use client';
import React from 'react';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { Platform, View } from 'react-native';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

const dividerStyle = tva({
  base: 'bg-background-200',
  variants: {
    orientation: {
      vertical: 'w-px h-full',
      horizontal: 'h-px w-full',
    },
  },
});

type IUIDividerProps = React.ComponentPropsWithoutRef<typeof View> &
  VariantProps<typeof dividerStyle>;

const Divider = function Divider(
  { className, orientation = 'horizontal', ...props }: IUIDividerProps & { ref?: React.Ref<React.ComponentRef<typeof View>> }
) {
  const { ref, ...restProps } = props;
  return (
    <View
      ref={ref}
      {...restProps}
      aria-orientation={orientation}
      role={Platform.OS === 'web' ? 'separator' : undefined}
      className={dividerStyle({
        orientation,
        class: className,
      })}
    />
  );
};

Divider.displayName = 'Divider';

export { Divider };
