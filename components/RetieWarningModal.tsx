/**
 * RETIE Warning Details Modal
 * 
 * Displays detailed recommendations and actions for RETIE warnings in Spanish
 */

import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
    WarningRecommendation,
    getSeverityColor,
} from '@/utils/retie-warning-mapping';
import { AlertCircle, CheckCircle2, X } from 'lucide-react-native';
import React from 'react';
import { ScrollView } from 'react-native';

interface RetieWarningModalProps {
  isOpen: boolean;
  warning: WarningRecommendation | null;
  warningMessage: string;
  onClose: () => void;
}

export function RetieWarningModal({
  isOpen,
  warning,
  warningMessage,
  onClose,
}: RetieWarningModalProps) {
  if (!warning) {
    return null;
  }

  const severityColor = getSeverityColor(warning.severity);
  const severityIcon =
    warning.severity === 'critical' ? AlertCircle : CheckCircle2;
  const severityLabel =
    warning.severity === 'critical' ? 'CRÍTICO' : 'ADVERTENCIA';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <HStack className="gap-2 items-center flex-1">
            <Box
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: severityColor,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <AlertCircle size={16} color="white" />
            </Box>
            <VStack className="flex-1">
              <Text className="text-xs font-bold text-typography-500">
                {severityLabel}
              </Text>
              <Heading size="md" numberOfLines={2}>
                {warning.title}
              </Heading>
            </VStack>
          </HStack>
          <ModalCloseButton onPress={onClose}>
            <X size={20} color="#666" />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack gap={4} className="pb-4">
              {/* Original Warning Message */}
              <Box className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <Text className="text-xs font-semibold text-gray-700 mb-1">
                  AVISO TÉCNICO
                </Text>
                <Text className="text-sm text-gray-900">{warningMessage}</Text>
              </Box>

              {/* Description */}
              <VStack gap={2}>
                <Text className="text-xs font-semibold text-typography-700 uppercase">
                  ¿Qué significa?
                </Text>
                <Text className="text-sm text-typography-600 leading-5">
                  {warning.description}
                </Text>
              </VStack>

              {/* Actions */}
              <VStack gap={2}>
                <Text className="text-xs font-semibold text-typography-700 uppercase">
                  ¿Qué hacer?
                </Text>
                <VStack gap={2}>
                  {warning.actions.map((action, index) => (
                    <HStack
                      key={index}
                      gap={3}
                      alignItems="flex-start"
                      className="p-3 bg-blue-50 rounded-lg"
                    >
                      <Box
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: '#dbeafe',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minWidth: 24,
                          marginTop: 2,
                        }}
                      >
                        <Text className="text-xs font-bold text-blue-900">
                          {index + 1}
                        </Text>
                      </Box>
                      <Text className="text-sm text-typography-700 flex-1 leading-5">
                        {action}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </VStack>

              {/* RETIE Articles Reference */}
              {warning.relatedArticles.length > 0 && (
                <VStack gap={2}>
                  <Text className="text-xs font-semibold text-typography-700 uppercase">
                    Referencias RETIE
                  </Text>
                  <HStack gap={2} className="flex-wrap">
                    {warning.relatedArticles.map((article) => (
                      <Box
                        key={article}
                        className="bg-amber-100 rounded-full px-3 py-1 border border-amber-300"
                      >
                        <Text className="text-xs font-semibold text-amber-900">
                          {article}
                        </Text>
                      </Box>
                    ))}
                  </HStack>
                </VStack>
              )}

              {/* Severity Note */}
              <Box
                className={`rounded-lg p-3 border ${
                  warning.severity === 'critical'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    warning.severity === 'critical'
                      ? 'text-red-900'
                      : 'text-amber-900'
                  }`}
                >
                  {warning.severity === 'critical'
                    ? '🚨 Este problema es crítico y debe resolverse antes de instalar el sistema.'
                    : '⚠️ Este problema debe resolverse para cumplir con RETIE y pasar la inspección.'}
                </Text>
              </Box>

              {/* Contact Recommendation */}
              <Box className="bg-green-50 rounded-lg p-3 border border-green-200">
                <HStack gap={2} alignItems="flex-start">
                  <CheckCircle2 size={16} color="#22c55e" className="mt-0.5" />
                  <Text className="text-xs text-green-900 flex-1 leading-4">
                    Si no estás seguro cómo resolver esto, contacta a un instalador
                    certificado RETIE. Ellos tienen el expertise técnico para ajustar
                    el sistema correctamente.
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </ScrollView>
        </ModalBody>

        <ModalFooter>
          <Button action="secondary" onPress={onClose} className="flex-1">
            <Text>Cerrar</Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
