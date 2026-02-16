import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

const CreateTabIcon = ({ color, size }: { color: string; size: number }) => (
  <View style={styles.createIconContainer}>
    <Ionicons name="receipt" size={size} color={color} />
  </View>
);

const Layout = () => {
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
          name="home"
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
          name="location"
          options={{
            title: "Ubicación",
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
          name="billupload"
          options={{
            title: "Factura",
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <CreateTabIcon color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="mykits"
          options={{
            title: "Mis Kits",
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
          name="settings"
          options={{
            title: "Ajustes",
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
                  name={focused ? "settings" : "settings-outline"}
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
