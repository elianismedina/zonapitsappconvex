import { Button, ButtonText } from "@/components/ui/button";
import { Text, View } from "react-native";

export default function FeedScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 16 }}>
        Feed
      </Text>
      <Text style={{ textAlign: "center", marginBottom: 24 }}>
        Latest posts and updates will appear here.
      </Text>
      <Button
        onPress={() => {
          throw new Error("My first Sentry error!");
        }}
      >
        <ButtonText>Throw Error</ButtonText>
      </Button>
    </View>
  );
}
