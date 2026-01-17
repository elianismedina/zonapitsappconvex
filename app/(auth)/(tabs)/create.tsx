import { useState } from "react";
import { ScrollView } from "react-native";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { ChevronDown } from "lucide-react-native";

import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
} from "@/components/ui/form-control";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from "@/components/ui/select";
import { AlertCircleIcon } from "@/components/ui/icon";
import { api } from "@/convex/_generated/api";

export default function CreateVehiculoScreen() {
  const router = useRouter();
  const createVehiculo = useMutation(api.vehiculos.createVehiculo);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    marca: "",
    linea: "",
    modelo: "",
    year: "",
    color: "",
    combustible: "",
    cilindrada: "",
    transmision: "",
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Basic validation
      if (
        !formData.marca ||
        !formData.linea ||
        !formData.modelo ||
        !formData.year ||
        !formData.color ||
        !formData.combustible ||
        !formData.cilindrada ||
        !formData.transmision
      ) {
        throw new Error("Por favor completa todos los campos.");
      }

      const year = parseInt(formData.year);
      const cilindrada = parseInt(formData.cilindrada);

      if (isNaN(year) || isNaN(cilindrada)) {
        throw new Error("Año y Cilindrada deben ser números válidos.");
      }

      await createVehiculo({
        marca: formData.marca,
        linea: formData.linea,
        modelo: formData.modelo,
        year: year,
        color: formData.color,
        combustible: formData.combustible,
        cilindrada: cilindrada,
        transmision: formData.transmision,
      });

      // Reset form and navigate back or show success
      setFormData({
        marca: "",
        linea: "",
        modelo: "",
        year: "",
        color: "",
        combustible: "",
        cilindrada: "",
        transmision: "",
      });
      
      router.push("/(auth)/(tabs)/feed");
      
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al registrar el vehículo.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="xl">
          <Heading size="xl">Registrar Vehículo</Heading>
          <Text size="sm" className="text-typography-500">
            Ingresa los detalles de tu vehículo para registrarlo en la plataforma.
          </Text>

          <VStack space="md">
            {/* Marca */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Marca</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="Ej. Toyota"
                  value={formData.marca}
                  onChangeText={(text) => handleChange("marca", text)}
                />
              </Input>
            </FormControl>

            {/* Linea */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Línea</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="Ej. Corolla"
                  value={formData.linea}
                  onChangeText={(text) => handleChange("linea", text)}
                />
              </Input>
            </FormControl>

            {/* Modelo */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Modelo (Versión)</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="Ej. LE"
                  value={formData.modelo}
                  onChangeText={(text) => handleChange("modelo", text)}
                />
              </Input>
            </FormControl>

            {/* Año y Color */}
            <Box className="flex-row gap-4">
              <FormControl className="flex-1">
                <FormControlLabel>
                  <FormControlLabelText>Año</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    placeholder="Ej. 2020"
                    keyboardType="numeric"
                    value={formData.year}
                    onChangeText={(text) => handleChange("year", text)}
                  />
                </Input>
              </FormControl>

              <FormControl className="flex-1">
                <FormControlLabel>
                  <FormControlLabelText>Color</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    placeholder="Ej. Blanco"
                    value={formData.color}
                    onChangeText={(text) => handleChange("color", text)}
                  />
                </Input>
              </FormControl>
            </Box>

            {/* Combustible */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Combustible</FormControlLabelText>
              </FormControlLabel>
              <Select
                selectedValue={formData.combustible}
                onValueChange={(value) => handleChange("combustible", value)}
              >
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder="Selecciona..." />
                  <SelectIcon as={ChevronDown} className="mr-3" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <SelectItem label="Gasolina" value="Gasolina" />
                    <SelectItem label="Diesel" value="Diesel" />
                    <SelectItem label="Híbrido" value="Híbrido" />
                    <SelectItem label="Eléctrico" value="Eléctrico" />
                    <SelectItem label="Gas LP" value="Gas LP" />
                  </SelectContent>
                </SelectPortal>
              </Select>
            </FormControl>

            {/* Cilindrada */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Cilindrada (cc)</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="Ej. 1800"
                  keyboardType="numeric"
                  value={formData.cilindrada}
                  onChangeText={(text) => handleChange("cilindrada", text)}
                />
              </Input>
            </FormControl>

             {/* Transmision */}
             <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Transmisión</FormControlLabelText>
              </FormControlLabel>
              <Select
                selectedValue={formData.transmision}
                onValueChange={(value) => handleChange("transmision", value)}
              >
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder="Selecciona..." />
                  <SelectIcon as={ChevronDown} className="mr-3" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <SelectItem label="Automática" value="Automática" />
                    <SelectItem label="Manual" value="Manual" />
                    <SelectItem label="CVT" value="CVT" />
                    <SelectItem label="DCT" value="DCT" />
                  </SelectContent>
                </SelectPortal>
              </Select>
            </FormControl>

            {error && (
              <FormControlError className="flex flex-row items-center gap-2 mt-2">
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>{error}</FormControlErrorText>
              </FormControlError>
            )}

            <Button
              className="mt-4"
              onPress={handleSubmit}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? <ButtonSpinner /> : <ButtonText>Registrar Vehículo</ButtonText>}
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}
