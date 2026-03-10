import { KitBillDetails } from "@/components/KitBillDetails";
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
import React from "react";

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
      {selectedFile && selectedFile.uri !== "existing" && (
        <Box className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-outline-200 bg-background-50">
          {billUrl || selectedFile?.mimeType?.startsWith("image/") ? (
            <Image
              source={{ uri: billUrl || selectedFile!.uri }}
              alt="Uploaded bill"
              className="h-full w-full"
              resizeMode="contain"
            />
          ) : (
            <VStack className="flex-1 items-center justify-center" space="xs">
              <FileUp size={48} color="#9CA3AF" />
              <Text size="sm" className="mt-2 text-typography-500">
                Documento PDF subido
              </Text>
            </VStack>
          )}
        </Box>
      )}

      <Card variant="outline" className="border-primary-300 bg-primary-50 p-4">
        <HStack space="md" className="mb-4 items-center">
          <CheckCircle size={24} color="#F0D117" />
          <Heading size="md" className="text-primary-800">
            Datos Extraídos
          </Heading>
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

      <Text size="xs" className="text-center text-typography-400 italic">
        Estos datos se han extraído automáticamente. En el siguiente paso podrás
        ajustar tu configuración solar.
      </Text>
    </VStack>
  );
};
