'use client';
import { createIcon } from '@gluestack-ui/core/icon/creator';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { Svg, Circle, Line } from 'react-native-svg';
import React from 'react';

const iconStyle = tva({
  base: 'text-typography-900 fill-none',
  variants: {
    size: {
      '2xs': 'h-3 w-3',
      'xs': 'h-3.5 w-3.5',
      'sm': 'h-4 w-4',
      'md': 'h-[18px] w-[18px]',
      'lg': 'h-5 w-5',
      'xl': 'h-6 w-6',
    },
  },
});

export const Icon = createIcon({
  Root: Svg,
});

export const AlertCircleIcon = (props: any) => (
  <Icon
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Circle cx="12" cy="12" r="10" />
    <Line x1="12" y1="8" x2="12" y2="12" />
    <Line x1="12" y1="16" x2="12.01" y2="16" />
  </Icon>
);
