import { Platform, PlatformColor } from "react-native";

export const Colors = {
  background: "#FFFFFF",
  border: "#E5E7EB",
  itemBackground: "#FAFAFA",
  primary: "#F0D117",
  black: "#000000",

  ...Platform.select({
    ios: {
      submit: PlatformColor("systemBlueColor"),
    },
    android: {
      submit: PlatformColor("@android:color/system_primary_light"),
    },
    default: { submit: "black" },
  }),
};
