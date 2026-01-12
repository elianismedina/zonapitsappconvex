import { useSignUp, useOAuth, useUser, useAuth } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";

import * as React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isSignedIn) {
      router.replace("(auth)/(tabs)");
    }
  }, [isSignedIn, router]);
  const [error, setError] = React.useState("");

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture code
      setPendingVerification(true);
      setError("");
    } catch (err: any) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      setError(err.errors?.[0]?.message || "An error occurred");
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });

        router.replace("(auth)/(tabs)");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
         setError("Verification failed. Please try again.");
       }
     } catch (err: any) {
       // See https://clerk.com/docs/guides/development/custom-flows/error-handling
       // for more info on error handling
       setError(err.errors?.[0]?.message || "Verification failed. Please check the code and try again.");
     }
  };

  if (pendingVerification) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
        <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 16 }}>Verify your email</Text>
        {error ? <Text style={{ color: "red", textAlign: "center", marginBottom: 12 }}>{error}</Text> : null}
        <TextInput
          value={code}
          placeholder="Enter your verification code"
          onChangeText={(code) => setCode(code)}
          style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12, borderRadius: 4 }}
        />
        <TouchableOpacity onPress={onVerifyPress} style={{ backgroundColor: "#007bff", padding: 12, borderRadius: 4 }}>
          <Text style={{ color: "#fff", textAlign: "center" }}>Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const onGoogleSignUpPress = async () => {
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
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 16 }}>Sign up</Text>
      {error ? <Text style={{ color: "red", textAlign: "center", marginBottom: 12 }}>{error}</Text> : null}
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={(email) => setEmailAddress(email)}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12, borderRadius: 4 }}
      />
      <TextInput
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12, borderRadius: 4 }}
      />
      <TouchableOpacity onPress={onSignUpPress} style={{ backgroundColor: "#007bff", padding: 12, borderRadius: 4, marginBottom: 16 }}>
        <Text style={{ color: "#fff", textAlign: "center" }}>Continue</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onGoogleSignUpPress} style={{ backgroundColor: "#db4437", padding: 12, borderRadius: 4, marginBottom: 12 }}>
        <Text style={{ color: "#fff", textAlign: "center" }}>Sign up with Google</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
        <Text>Already have an account?</Text>
        <Link href={"/sign-in" as any}>
          <Text style={{ color: "#007bff" }}>Sign in</Text>
        </Link>
      </View>
    </View>
  );
}