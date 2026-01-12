import { Text, View } from "react-native";

export default function CreateScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 16 }}>
        Create
      </Text>
      <Text>Create new content here.</Text>
    </View>
  );
}