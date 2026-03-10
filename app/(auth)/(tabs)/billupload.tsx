import { ScrollView } from "react-native";

import { LoadingAnimation } from "@/components/LoadingAnimation";
import { AnalysisResults } from "@/components/billupload/AnalysisResults";
import { BillUploadTabs } from "@/components/billupload/BillUploadTabs";
import { FilePicker } from "@/components/billupload/FilePicker";
import { GenerationPercentageSelector } from "@/components/billupload/GenerationPercentageSelector";
import { KitSelectionPanel } from "@/components/billupload/KitSelectionPanel";
import { RoofTypeSelector } from "@/components/billupload/RoofTypeSelector";
import { ROOF_TYPES } from "@/components/billupload/types";
import { useBillUpload } from "@/components/billupload/useBillUpload";
import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useToastNotify } from "@/components/hooks/useToastNotify";

export default function UploadBillScreen() {
  const notify = useToastNotify();

  const {
    activeTab,
    setActiveTab,
    isSubmitting,
    isAnalyzing,
    selectedKitId,
    setSelectedKitId,
    selectedFile,
    analysisResult,
    generationPercentage,
    selectedRoofType,
    kits,
    billUrl,
    safeKits,
    isKitLoading,
    pickFile,
    handleSubmit,
    handlePercentageChange,
    handleRoofTypeChange,
    handleFinish,
    handleCancel,
    handleCreateKit,
    resetAnalysis,
  } = useBillUpload({ notify });

  return (
    <Box className="flex-1 bg-background-0">
      <BillUploadTabs activeTab={activeTab} onChange={setActiveTab} />

      <ScrollView contentContainerClassName="p-4">
        <VStack space="xl">
          {activeTab === "bill" && (
            <>
              <Heading size="xl">Subir Factura de Energía</Heading>
              <Text size="sm" className="text-typography-500">
                Sube tu factura para que la IA extraiga tu consumo y tarifas
                automáticamente.
              </Text>

              <GenerationPercentageSelector
                value={generationPercentage}
                onChange={handlePercentageChange}
                isDisabled={isSubmitting}
              />

              {isKitLoading ? (
                <Box className="h-96 w-full items-center justify-center">
                  <LoadingAnimation size={120} />
                </Box>
              ) : !analysisResult ? (
                <VStack space="lg">
                  <KitSelectionPanel
                    kits={kits}
                    safeKits={safeKits}
                    selectedKitId={selectedKitId}
                    onSelectKit={setSelectedKitId}
                    isDisabled={isSubmitting}
                    emptyText="No tienes kits creados aún para vincular una factura."
                    emptyActionLabel="Crear kit"
                    onCreateKit={handleCreateKit}
                  />

                  {safeKits.length > 0 && (
                    <>
                      <FilePicker
                        onPress={pickFile}
                        selectedFile={selectedFile}
                        isDisabled={isSubmitting}
                      />

                      <HStack space="md" className="mt-4 w-full">
                        <Button
                          variant="outline"
                          action="secondary"
                          onPress={handleCancel}
                          className="flex-1"
                        >
                          <ButtonText>Cancelar</ButtonText>
                        </Button>
                        <Button
                          onPress={handleSubmit}
                          isDisabled={
                            isSubmitting || !selectedKitId || !selectedFile
                          }
                          className="flex-1"
                        >
                          {isSubmitting ? (
                            <HStack
                              space="sm"
                              className="items-center justify-center"
                            >
                              <ButtonSpinner />
                              <ButtonText>
                                {isAnalyzing ? "Analizando..." : "Subiendo..."}
                              </ButtonText>
                            </HStack>
                          ) : (
                            <ButtonText>Subir y Analizar</ButtonText>
                          )}
                        </Button>
                      </HStack>
                    </>
                  )}
                </VStack>
              ) : (
                <VStack space="lg">
                  <AnalysisResults
                    selectedFile={selectedFile}
                    billUrl={billUrl ?? null}
                    analysisResult={analysisResult}
                  />

                  <Button onPress={handleFinish} className="bg-primary-600">
                    <ButtonText>Arma tu Efikit Solar</ButtonText>
                  </Button>

                  {safeKits.length > 1 && (
                    <Button
                      variant="outline"
                      action="secondary"
                      onPress={resetAnalysis}
                    >
                      <ButtonText>Elegir otro Kit</ButtonText>
                    </Button>
                  )}
                </VStack>
              )}
            </>
          )}

          {activeTab === "roof" && (
            <>
              <Heading size="xl">Seleccionar Tipo de Techo</Heading>
              <Text size="sm" className="text-typography-500">
                Elige el tipo de techo donde se instalará el kit solar.
              </Text>

              <KitSelectionPanel
                kits={kits}
                safeKits={safeKits}
                selectedKitId={selectedKitId}
                onSelectKit={setSelectedKitId}
                isDisabled={false}
                emptyText="No tienes kits creados aún."
                emptyActionLabel="Crear kit"
                onCreateKit={handleCreateKit}
              />

              {safeKits.length > 0 && (
                <>
                  <VStack space="md">
                    <Heading size="md">Tipos de techo disponibles</Heading>
                    <Text size="xs" className="text-typography-500">
                      Selecciona una opción:
                    </Text>

                    <RoofTypeSelector
                      roofTypes={ROOF_TYPES}
                      selectedRoofType={selectedRoofType}
                      onSelect={handleRoofTypeChange}
                    />
                  </VStack>

                  {selectedRoofType && (
                    <Button
                      onPress={handleFinish}
                      className="mt-4 bg-primary-600"
                    >
                      <ButtonText>Continuar</ButtonText>
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}
