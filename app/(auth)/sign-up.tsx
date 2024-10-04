import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { View, Text } from "react-native";
import { Stack, useRouter } from "expo-router";
import { TextInput } from "react-native-gesture-handler";
import Button from "@/components/Button";
import { Link } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useRoute } from "@react-navigation/native";

function SignUpScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter()

  async function signUp(){
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    let { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    setLoading(true)

    if(error) {
        setErrorMessage(error.message)
        setLoading(false)
    }
    else {
        router.push('/(auth)/sign-in')
    }


  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Sign Up" }} />

      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="Email"
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

      <Text style={styles.label}>Confirm password</Text>
      <TextInput
        placeholder="password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        secureTextEntry
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Button
        onPress={signUp}
        disabled={loading}
        text={loading ? "Creating account..." : "Create account"}
      />

      <Link href="/sign-in" style={styles.textButton}>
        Sign In
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
  error: {
    color: "red",
    marginBottom: 10,
  },
});

export default SignUpScreen;
