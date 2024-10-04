import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import Button from "@/components/Button";
import { FontAwesome } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { TextInput } from "react-native";
import { defaultPizzaImage } from "./create";
import { useImagePicker } from "@/hooks/useImagePicker";
import {
  useDeleteProduct,
  useFetchProductById,
  useUpdateProduct,
} from "@/api/products";
import { useEffect } from "react";

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const {
    data: product,
    error,
    isLoading,
  } = useFetchProductById(parseInt(typeof id === "string" ? id : id[0]));

  // Tạo state mà không phụ thuộc vào product ngay lập tức
  const [editedName, setEditedName] = useState("");
  const [editedPrice, setEditedPrice] = useState("");
  const { image, pickImage, setImage } = useImagePicker();
  const [originalImage, setOriginalImage] = useState(defaultPizzaImage);

  const { mutate: updateProduct } = useUpdateProduct();
  const { mutate: deleteProduct } = useDeleteProduct();
  const router = useRouter();

  // Khi product đã tải xong, cập nhật các state cho tên, giá, và ảnh
  useEffect(() => {
    if (product) {
      setEditedName(product.name);
      setEditedPrice(product.price.toString());
      setOriginalImage(product.image || defaultPizzaImage);
    }
  }, [product]);

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  if (!product) {
    return <Text>Product not found</Text>;
  }

  const saveChanges = () => {
    updateProduct(
      {
        id,
        name: editedName, // Sử dụng editedName và editedPrice mới đã cập nhật
        price: editedPrice,
        image,
      },
      {
        onSuccess: () => {
          toggleEditMode();
        },
      }
    );
  };

  const onDelete = () => {
    deleteProduct(parseInt(typeof id === "string" ? id : id[0]), {
      onSuccess: () => {
        router.back();
      },
    });
  };

  const confirmDelete = () => {
    Alert.alert("Confirm", "Do you want to delete this product ?", [
      {
        text: "Cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: onDelete,
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: isEditing ? "Edit Product" : product.name,
          headerRight: () => (
            <Pressable onPress={toggleEditMode}>
              {({ pressed }) => (
                <FontAwesome
                  name="pencil"
                  size={25}
                  color={Colors.light.tint}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
      />
      {isEditing ? (
        <View>
          <Image
            source={{ uri: originalImage || defaultPizzaImage }}
            style={{ width: "50%", aspectRatio: 1, alignSelf: "center" }}
          />
          <Text onPress={pickImage} style={styles.textButton}>
            Select new image
          </Text>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={editedName}
            onChangeText={setEditedName}
            placeholder="Edit Product Name"
          />
          <Text style={styles.label}>Price ($)</Text>
          <TextInput
            style={styles.input}
            value={editedPrice}
            onChangeText={setEditedPrice}
            placeholder="Edit Price"
            keyboardType="numeric"
          />
          <Button onPress={saveChanges} text="Update" />
          <Text onPress={confirmDelete} style={styles.deleteButton}>
            Delete
          </Text>
        </View>
      ) : (
        <View>
          <Image
            source={{ uri: product.image || defaultPizzaImage }}
            style={styles.image}
          />
          <Text style={styles.price}>${product.price}</Text>
          <Text>{product.name}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    padding: 10,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 20,
  },
  label: {
    color: "gray",
    fontSize: 16,
  },
  textButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: Colors.light.tint,
    marginVertical: 10,
  },
  deleteButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: "#FF000080",
    marginVertical: 10,
  },
});

export default ProductDetailScreen;
