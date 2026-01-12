import { Link, useRouter } from "expo-router";
import { useSignIn, useOAuth, useUser, useAuth } from "@clerk/clerk-expo";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isSignedIn) {
      router.replace("(auth)/(tabs)");
    }
  }, [isSignedIn, router]);

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        if (setActive) {
          await setActive!({ session: signInAttempt.createdSessionId });
           router.replace("(auth)/(tabs)");
        }
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onGoogleSignInPress = async () => {
    if (isSignedIn) return;
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        setActive!({ session: createdSessionId });
        router.replace("(auth)/(tabs)");
      } else {
        // Handle other cases
      }
    } catch (err: any) {
      if (err.message?.includes("already signed in")) {
        router.replace("(auth)/(tabs)");
      } else {
        console.error("OAuth error", err);
      }
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 16 }}>Sign in</Text>
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12, borderRadius: 4 }}
      />
      <TextInput
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12, borderRadius: 4 }}
      />
      <TouchableOpacity onPress={onSignInPress} style={{ backgroundColor: "#007bff", padding: 12, borderRadius: 4, marginBottom: 12 }}>
        <Text style={{ color: "#fff", textAlign: "center" }}>Continue</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onGoogleSignInPress} style={{ backgroundColor: "#db4437", padding: 12, borderRadius: 4, marginBottom: 12 }}>
        <Text style={{ color: "#fff", textAlign: "center" }}>Sign in with Google</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
        <Text>Do not have an account?</Text>
        <Link href={"/sign-up" as any}>
          <Text style={{ color: "#007bff" }}>Sign up</Text>
        </Link>
      </View>
    </View>
  );
}
