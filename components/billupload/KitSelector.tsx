import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronDown } from "lucide-react-native";
import React from "react";

interface KitSelectorProps {
  kits: any[] | undefined;
  selectedKitId: Id<"kits"> | null;
  onValueChange: (value: Id<"kits">) => void;
  isDisabled: boolean;
}

export const KitSelector = ({
  kits,
  selectedKitId,
  onValueChange,
  isDisabled,
}: KitSelectorProps) => {
  return (
    <FormControl>
      <FormControlLabel>
        <FormControlLabelText>Selecciona un Kit</FormControlLabelText>
      </FormControlLabel>
      <Select
        selectedValue={selectedKitId ?? ""}
        onValueChange={(value) => onValueChange(value as Id<"kits">)}
        isDisabled={isDisabled}
      >
        <SelectTrigger variant="outline" size="md">
          <SelectInput
            placeholder={!kits ? "Cargando kits..." : "Selecciona..."}
          />
          <SelectIcon as={ChevronDown} className="mr-3" />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {kits?.map((kit) => (
              <SelectItem key={kit._id} label={kit.name} value={kit._id} />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>
    </FormControl>
  );
};
