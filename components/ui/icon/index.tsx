'use client';
import { createIcon } from '@gluestack-ui/core/icon/creator';
import { Svg, Circle, Line } from 'react-native-svg';
import React from 'react';

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
