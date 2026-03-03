import {
  ReactComponent,
  StyledConfiguration,
  StyledOptions,
} from "react-native-css/dist/typescript/commonjs/src/runtime.types";

export function cssInterop(component: any, mapping: any): void;
export function remapProps(component: any, mapping: any): void;
export function useColorScheme(): {
  colorScheme: "light" | "dark" | undefined;
  setColorScheme: (scheme: "light" | "dark" | "system") => void;
  toggleColorScheme: () => void;
};
export function vars(variables: Record<string, string | number>): any;
export const styled: <
  const C extends ReactComponent<any>,
  const M extends StyledConfiguration<C>,
>(
  baseComponent: C,
  mapping?: M,
  options?: StyledOptions,
) => any;
