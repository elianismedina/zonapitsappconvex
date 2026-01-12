import { Text, TextInput, View } from "react-native";

export default function SearchScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 16 }}>
        Search
      </Text>
      <TextInput
        placeholder="Search for content..."
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 16, borderRadius: 4 }}
      />
      <Text>Search results will appear here.</Text>
    </View>
  );
}