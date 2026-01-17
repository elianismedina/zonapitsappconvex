import { useOAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Path, Svg } from "react-native-svg";

import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import React from "react";
import { ScrollView } from "react-native";

const LoginScreen = () => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_facebook" });
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });

  const handleFacebookLogin = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { createdSessionId, setActive } = await googleAuth();

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  };

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Image
          source={require("@/assets/images/login.png")}
          className="w-full h-[350px]"
          size="full"
          alt="Login illustration"
        />
        <VStack space="xl" className="p-5 items-center">
          <Text size="lg" className="font-medium text-center">
            ¿Cómo te gustaría empezar?
          </Text>

          <VStack space="lg" className="w-full">
            {/* Instagram Button*/}
            <Button 
              className="bg-white border border-outline-200 h-auto p-5 rounded-lg flex-col items-start" 
              onPress={handleFacebookLogin}
              variant="outline"
            >
              <Box className="flex-row items-center w-full">
                <Svg width={40} height={40} viewBox="0 0 24 24">
                  <Path
                    fill="#E4405F"
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  />
                </Svg>
                <Text className="flex-1 ml-2.5 text-black font-medium">
                  Continuar con Instagram
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color="#D4D4D4"
                />
              </Box>
              <Text className="text-xs text-typography-400 mt-2.5 leading-4">
                Inicia sesión o crea un perfil con tu cuenta de Instagram. Con un
                perfil puedes registrar vehículos y recibir recomendaciones
                personalizadas de repuestos, accesorios y servicios.
              </Text>
            </Button>

            {/* Google Button*/}
            <Button 
              className="bg-white border border-outline-200 h-auto p-5 rounded-lg" 
              onPress={handleGoogleLogin}
              variant="outline"
            >
              <Box className="flex-row items-center w-full">
                <Svg width={40} height={40} viewBox="0 0 48 48">
                  <Path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <Path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <Path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <Path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </Svg>
                <Text className="flex-1 ml-2.5 text-black font-medium">Continuar con Google</Text>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color="#D4D4D4"
                />
              </Box>
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
};

export default LoginScreen;
