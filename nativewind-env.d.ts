/// <reference types="nativewind/types" />
/// <reference types="react-native-css/types" />

import "expo-image";
import "react";
import "react-native";
import "react-native-reanimated";

declare module "nativewind" {
  export function cssInterop(component: any, mapping: any): void;
  export function remapProps(component: any, mapping: any): void;
  export function useColorScheme(): {
    colorScheme: "light" | "dark" | undefined;
    setColorScheme: (scheme: "light" | "dark" | "system") => void;
    toggleColorScheme: () => void;
  };
  export function vars(variables: Record<string, string | number>): any;
  export const styled: any;
}

declare module "react" {
  interface Attributes {
    className?: string;
  }
}

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
    contentContainerClassName?: string;
    indicatorClassName?: string;
  }
  interface FlatListProps<ItemT> {
    className?: string;
    contentContainerClassName?: string;
    columnWrapperClassName?: string;
    ListHeaderComponentClassName?: string;
    ListFooterComponentClassName?: string;
  }
  interface SectionListProps<ItemT, SectionT> {
    className?: string;
    contentContainerClassName?: string;
  }
  interface TextInputProps {
    className?: string;
    placeholderClassName?: string;
  }
  interface PressableProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface ActivityIndicatorProps {
    className?: string;
  }
}

declare module "react-native-reanimated" {
  interface AnimateProps<P> {
    className?: string;
  }
}

declare module "expo-image" {
  interface ImageProps {
    className?: string;
    resizeMode?: string;
  }
}

declare module "lucide-react-native" {
  import { SvgProps } from "react-native-svg";
  export interface LucideProps extends SvgProps {
    className?: string;
    size?: number | string;
  }
  export const Zap: React.FC<LucideProps>;
  export const BarChart3: React.FC<LucideProps>;
  export const Ruler: React.FC<LucideProps>;
  export const Weight: React.FC<LucideProps>;
  export const ZapOff: React.FC<LucideProps>;
  export const Info: React.FC<LucideProps>;
  export const ChevronRight: React.FC<LucideProps>;
  export const ChevronLeft: React.FC<LucideProps>;
  export const Menu: React.FC<LucideProps>;
  export const Settings: React.FC<LucideProps>;
  export const User: React.FC<LucideProps>;
  export const LogOut: React.FC<LucideProps>;
  export const Package: React.FC<LucideProps>;
  export const FileText: React.FC<LucideProps>;
  export const MapPin: React.FC<LucideProps>;
  export const Home: React.FC<LucideProps>;
  export const Search: React.FC<LucideProps>;
  export const Plus: React.FC<LucideProps>;
  export const Minus: React.FC<LucideProps>;
  export const Check: React.FC<LucideProps>;
  export const X: React.FC<LucideProps>;
}
