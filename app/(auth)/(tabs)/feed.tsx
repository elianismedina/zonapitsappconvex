import { Text, View } from "react-native";

export default function FeedScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 16 }}>
        Feed
      </Text>
      <Text>Latest posts and updates will appear here.</Text>
    </View>
  );
}