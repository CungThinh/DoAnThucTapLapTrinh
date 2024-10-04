import { Link, Stack } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import OrderScreen from ".";
import { SafeAreaView } from "react-native-safe-area-context";

const Tab = createMaterialTopTabNavigator();

export default function MenuStack() {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}} edges={['top']}>
      <Tab.Navigator
        initialRouteName="All"
        screenOptions={{
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "gray",
          tabBarIndicatorStyle: { backgroundColor: "tomato" },
          tabBarLabelStyle: { fontSize: 12 },
          tabBarStyle: { backgroundColor: "white" },
        }}
      >
        <Tab.Screen
          name="Active"
          component={OrderScreen}
          options={{ title: "Active" }}
        />
        <Tab.Screen
          name="Archieved"
          component={OrderScreen}
          options={{ title: "Archieved" }}
        />
        <Tab.Screen
          name="All"
          component={OrderScreen}
          options={{ title: "All" }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
