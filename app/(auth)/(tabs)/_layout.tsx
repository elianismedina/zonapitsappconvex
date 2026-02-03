import { Colors } from "@/constants/Colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

const CreateTabIcon = ({ color, size }: { color: string; size: number }) => (
  <View style={styles.createIconContainer}>
    <Ionicons name="receipt" size={size} color={color} />
  </View>
);

const Layout = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#000",
          headerTitle: "EfiKit Solar",
        }}
      >
        <Tabs.Screen
          name="feed"
          options={{
            title: "Inicio",
            tabBarIcon: ({
              color,
              size,
              focused,
            }: {
              color: string;
              size: number;
              focused: boolean;
            }) => (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={size}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Buscar",
            tabBarIcon: ({
              color,
              size,
              focused,
            }: {
              color: string;
              size: number;
              focused: boolean;
            }) => (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={focused ? "location" : "location-outline"}
                  size={size}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Crear",
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <CreateTabIcon color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="garage"
          options={{
            title: "Garaje",
            tabBarIcon: ({
              color,
              size,
              focused,
            }: {
              color: string;
              size: number;
              focused: boolean;
            }) => (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={focused ? "flash" : "flash-outline"}
                  size={size}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({
              color,
              size,
              focused,
            }: {
              color: string;
              size: number;
              focused: boolean;
            }) => (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={size}
                  color={color}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default Layout;

const styles = StyleSheet.create({
  createIconContainer: {
    backgroundColor: Colors.itemBackground,
    borderRadius: 8,
    padding: 6,
  },
  iconContainer: {
    padding: 2,
  },
});
