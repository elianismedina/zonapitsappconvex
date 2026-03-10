import React from "react";

import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";

type BillUploadTab = "bill" | "roof";

interface BillUploadTabsProps {
  activeTab: BillUploadTab;
  onChange: (tab: BillUploadTab) => void;
}

const TABS: { value: BillUploadTab; label: string }[] = [
  { value: "bill", label: "Factura" },
  { value: "roof", label: "Tipo de Techo" },
];

export const BillUploadTabs = ({
  activeTab,
  onChange,
}: BillUploadTabsProps) => {
  return (
    <Box className="flex-row border-b border-outline-200">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <Pressable
            key={tab.value}
            onPress={() => onChange(tab.value)}
            className={`flex-1 flex-row items-center justify-center py-4 ${
              isActive
                ? "border-b-2 border-primary-600 bg-background-50"
                : "bg-background-0"
            }`}
          >
            <Text
              size="sm"
              className={`font-medium ${
                isActive ? "text-primary-600" : "text-typography-500"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </Box>
  );
};
