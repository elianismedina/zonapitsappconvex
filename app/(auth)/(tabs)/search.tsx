import { StyleSheet, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

export default function SearchScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <MapView style={styles.map} provider={PROVIDER_GOOGLE} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
