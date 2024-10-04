import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { View, Text } from "react-native";
import { Stack, useRouter } from "expo-router";
import { TextInput } from "react-native-gesture-handler";
import Button from "@/components/Button";
import { Link } from "expo-router";
import { supabase } from "@/lib/supabase";

function SignInScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter()

  async function signIn(){
    let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if(!error) {
        router.push('/(tabs)/menu')
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Sign In" }} />

      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize='none'
        keyboardType='email-address'
        spellCheck={false} 
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        placeholder="password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <Button
        onPress={signIn}
        disabled={loading}
        text={loading ? "Signing in..." : "Sign in"}
      />

      <Link href="/sign-up" style={styles.textButton}>
        Create an account
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: "center",
    flex: 1,
  },
  label: {
    color: "gray",
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    marginTop: 5,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 5,
  },
  textButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: Colors.light.tint,
    marginVertical: 10,
  },
});

export default SignInScreen;
