/**
 * RETIE Compliance Badge Component
 * 
 * Displays the compliance status of a solar system with visual indicators
 * Usage: <RetieComplianceBadge status="compliant" />
 */

import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react-native';
import React from 'react';

export type ComplianceStatus = 'compliant' | 'warnings' | 'non-compliant' | 'pending';

interface RetieComplianceBadgeProps {
  status: ComplianceStatus;
  count?: number; // number of issues/warnings
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  detailed?: boolean; // Show more text
}

const statusConfig = {
  compliant: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    textColor: '#166534',
    label: 'RETIE Compliant',
    icon: CheckCircle2,
    iconColor: '#22c55e',
  },
  warnings: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#92400e',
    label: 'RETIE Warnings',
    icon: AlertCircle,
    iconColor: '#f59e0b',
  },
  'non-compliant': {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    textColor: '#7f1d1d',
    label: 'Non-Compliant',
    icon: XCircle,
    iconColor: '#ef4444',
  },
  pending: {
    backgroundColor: '#e0e7ff',
    borderColor: '#6366f1',
    textColor: '#312e81',
    label: 'Pending Verification',
    icon: Info,
    iconColor: '#6366f1',
  },
};

export function RetieComplianceBadge({
  status,
  count,
  size = 'md',
  showLabel = true,
  detailed = false,
}: RetieComplianceBadgeProps) {
  const config = statusConfig[status];
  const IconComponent = config.icon;
  
  const sizeStyles = {
    sm: { padding: 6, gap: 4, iconSize: 16, textSize: 'xs' },
    md: { padding: 8, gap: 6, iconSize: 18, textSize: 'sm' },
    lg: { padding: 10, gap: 8, iconSize: 20, textSize: 'base' },
  };
  
  const sizeConfig = sizeStyles[size];

  const displayText = count !== undefined && count > 0 
    ? `${count} ${count === 1 ? 'issue' : 'issues'}`
    : config.label;

  return (
    <Box
      style={{
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: sizeConfig.padding,
        paddingHorizontal: sizeConfig.padding * 1.5,
      }}
    >
      <HStack style={{ gap: sizeConfig.gap, alignItems: 'center' }}>
        <IconComponent 
          size={sizeConfig.iconSize} 
          color={config.iconColor}
          strokeWidth={2}
        />
        
        {showLabel && (
          <Text
            style={{
              color: config.textColor,
              fontSize: sizeConfig.textSize === 'xs' ? 12 : 
                       sizeConfig.textSize === 'sm' ? 14 :
                       sizeConfig.textSize === 'base' ? 16 : 14,
              fontWeight: '500',
            }}
          >
            {detailed ? `✓ ${config.label}` : displayText}
          </Text>
        )}
      </HStack>
    </Box>
  );
}

export default RetieComplianceBadge;
