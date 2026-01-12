import { SignOutButton } from "@/components/SignOutButton";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Text, View, TouchableOpacity } from "react-native";

export default function Page() {
  const { user } = useUser();

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <SignedIn>
        <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 16 }}>Hello {user?.emailAddresses[0].emailAddress}</Text>
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <TouchableOpacity onPress={() => {}} style={{ backgroundColor: "#007bff", padding: 12, borderRadius: 4, marginBottom: 12 }}>
          <Link href={"/sign-in" as any}>
            <Text style={{ color: "#fff", textAlign: "center" }}>Sign in</Text>
          </Link>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}} style={{ backgroundColor: "#28a745", padding: 12, borderRadius: 4 }}>
          <Link href={"/sign-up" as any}>
            <Text style={{ color: "#fff", textAlign: "center" }}>Sign up</Text>
          </Link>
        </TouchableOpacity>
      </SignedOut>
    </View>
  );
}
