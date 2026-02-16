'use client';
import { createSpinner } from '@gluestack-ui/spinner';
import { withStyleContext } from '@gluestack-ui/utils/nativewind-utils';
import { ActivityIndicator } from 'react-native';

export const Spinner = createSpinner({
  Root: withStyleContext(ActivityIndicator),
});
