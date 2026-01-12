import { Text, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";

export default function ProfileScreen() {
  const { user } = useUser();

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 16 }}>
        Profile
      </Text>
      <Text>Name: {user?.firstName} {user?.lastName}</Text>
      <Text>Email: {user?.emailAddresses[0].emailAddress}</Text>
      <Text>Username: {user?.username}</Text>
    </View>
  );
}