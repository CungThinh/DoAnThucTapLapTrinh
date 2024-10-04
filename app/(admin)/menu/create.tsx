import { View, Text, Image, Pressable } from "react-native";
import { StyleSheet, TextInput } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";
import { useState } from "react";
import Button from "@/components/Button";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useAddProducts } from "@/api/products";

export const defaultPizzaImage =
  "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png";

const Create = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(""); // String
  const [errors, setErrors] = useState("");
  const { image, pickImage } = useImagePicker();

  const { mutate: addProduct } = useAddProducts();
  const router = useRouter();

  const resetField = () => {
    setName("");
    setPrice("");
  };

  const onCreate = () => {
    // Save to database later
    if (validateInput()) {
      addProduct(
        { name, price: parseFloat(price), image },
        {
          onSuccess: () => {
            resetField();
            router.back();
          },
          onError: () => {
            console.log("Error");
          },
        }
      );
    }
  };

  const validateInput = () => {
    setErrors("");
    if (!name) {
      setErrors("Name is required!");
      return false;
    }

    if (!price) {
      setErrors("Price is required!");
      return false;
    }

    if (isNaN(parseFloat(price))) {
      setErrors("Price is not a number");
      return false;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Create product " }} />
      <Image
        source={{ uri: image || defaultPizzaImage }}
        style={styles.image}
      />
      <Text onPress={pickImage} style={styles.textButton}>
        Select an image
      </Text>
      <Text style={styles.label}>Name</Text>
      <TextInput
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.label}>Price</Text>
      <TextInput
        placeholder="Price"
        style={styles.input}
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
      <Text style={{ color: "red" }}>{errors}</Text>
      <Button onPress={onCreate} text="Create"></Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
  },
  image: {
    width: "50%",
    aspectRatio: 1,
    alignSelf: "center",
  },
  textButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: Colors.light.tint,
    marginVertical: 10,
  },

  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 20,
  },
  label: {
    color: "gray",
    fontSize: 16,
  },
});

export default Create;
