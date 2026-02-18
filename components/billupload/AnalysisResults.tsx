import React from "react";
import {
  Box,
  Card,
  Heading,
  HStack,
  Image,
  Text,
  VStack,
} from "@/components/ui";
import { CheckCircle, FileUp } from "lucide-react-native";
import { KitBillDetails } from "@/components/KitBillDetails";

interface AnalysisResultsProps {
  selectedFile: {
    uri: string;
    mimeType?: string;
  } | null;
  billUrl: string | null;
  analysisResult: any;
}

export const AnalysisResults = ({
  selectedFile,
  billUrl,
  analysisResult,
}: AnalysisResultsProps) => {
  return (
    <VStack space="lg">
      {/* Only show the file preview box right after a file has been picked, not when viewing existing data. */}
      {selectedFile && selectedFile.uri !== 'existing' && (
        <Box className="w-full aspect-[16/9] bg-background-50 rounded-lg overflow-hidden border border-outline-200">
          {(billUrl || selectedFile?.mimeType?.startsWith("image/")) ? (
            <Image
              source={{ uri: billUrl || selectedFile!.uri }}
              alt="Uploaded bill"
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <VStack className="items-center justify-center flex-1" space="xs">
              <FileUp size={48} color="#9CA3AF" />
              <Text size="sm" className="text-typography-500 mt-2">
                Documento PDF subido
              </Text>
            </VStack>
          )}
        </Box>
      )}

      <Card variant="outline" className="p-4 border-success-300 bg-success-50">
        <HStack space="md" className="items-center mb-4">
          <CheckCircle size={24} color="#10B981" />
          <Heading size="md" className="text-success-800">Datos Extraídos</Heading>
        </HStack>
        
        <KitBillDetails 
          provider={analysisResult.provider}
          billingPeriod={analysisResult.billingPeriod}
          monthlyConsumptionKwh={analysisResult.monthlyConsumptionKwh}
          energyRate={analysisResult.energyRate}
          totalAmount={analysisResult.totalAmount}
          currency={analysisResult.currency}
        />
      </Card>

      <Text size="xs" className="text-typography-400 text-center italic">
        Estos datos se han extraído automáticamente. En el siguiente paso podrás ajustar tu configuración solar.
      </Text>
    </VStack>
  );
};
