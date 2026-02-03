import { StyleSheet, View } from "react-native";
import MapView from "react-native-maps";

export default function SearchScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <MapView style={styles.map} />
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
