import { Text, View } from "react-native";

export default function FavoritesScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 16 }}>
        Favorites
      </Text>
      <Text>Your favorite items will be listed here.</Text>
    </View>
  );
}