import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { useState, useEffect } from "react";
import Button from "@/components/Button";
import Icon from "react-native-vector-icons/Ionicons"; 
import { Colors } from "@/constants/Colors";
import { defaultPizzaImage } from "./create";
import { useImagePicker } from "@/hooks/useImagePicker";
import * as FileSystem from 'expo-file-system';
import { manipulateAsync } from 'expo-image-manipulator';
import { randomUUID } from "expo-crypto";
import { supabase } from "@/lib/supabase";
import { decode } from 'base64-arraybuffer';
import {
  useDeleteProduct,
  useFetchProductById,
  useUpdateProduct,
} from "@/api/products";
import RemoteImage from "@/components/RemoteImage";

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: product, error, isLoading: productLoading } = useFetchProductById(parseInt(typeof id === "string" ? id : id[0]));
  const [editedName, setEditedName] = useState("");
  const [editedPrice, setEditedPrice] = useState("");
  const { image, pickImage, setImage } = useImagePicker();
  const { mutate: updateProduct } = useUpdateProduct();
  const { mutate: deleteProduct } = useDeleteProduct();
  const router = useRouter();

  useEffect(() => {
    if (product) {
      setEditedName(product.name);
      setEditedPrice(product.price.toString());
    }
  }, [product]);

  const uploadImage = async () => {
    if (!image) return product?.image || null;
  
    try {
      // Optimize image before upload
      const manipulateResult = await manipulateAsync(
        image,
        [
          { resize: { width: 800 } }, // Resize to reasonable dimensions
        ],
        { compress: 0.7, format: 'jpeg' } // Reduce quality for faster upload
      );

      const ext = 'jpg';
      const fileName = `${randomUUID()}.${ext}`;
      
      // Delete old image in parallel if it exists
      if (product?.image) {
        supabase.storage
          .from('product-images')
          .remove([product.image])
          .then(({ error }) => {
            if (error) console.log('Error deleting old image:', error);
          });
      }

      const base64 = await FileSystem.readAsStringAsync(manipulateResult.uri, {
        encoding: 'base64',
      });

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, decode(base64), {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.log('Upload error:', error);
        return product?.image || null;
      }
      return data?.path || null;
    } catch (e) {
      console.log('Exception in uploadImage:', e);
      return product?.image || null;
    }
  };

  const validateInput = () => {
    if (!editedName.trim()) {
      Alert.alert("Error", "Product name is required");
      return false;
    }
    if (!editedPrice.trim() || isNaN(parseFloat(editedPrice))) {
      Alert.alert("Error", "Valid price is required");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (!validateInput()) return;
    setIsLoading(true);

    try {
      // Process image upload and any other async tasks in parallel
      const [imagePath] = await Promise.all([
        uploadImage(),
        new Promise(resolve => setTimeout(resolve, 0)) // Allow UI to update
      ]);
      
      updateProduct(
        {
          id: parseInt(typeof id === "string" ? id : id[0]),
          name: editedName.trim(),
          price: parseFloat(editedPrice),
          image: imagePath,
        },
        {
          onSuccess: () => {
            setIsEditing(false);
            setImage(null);
            Alert.alert("Success", "Product updated successfully!");
          },
          onError: (error) => {
            Alert.alert("Error", "Failed to update product. Please try again.");
            console.log("Update error:", error);
          },
          onSettled: () => {
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "An unexpected error occurred");
      console.log("Save changes error:", error);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Product", 
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel" },
        { 
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteProduct(parseInt(typeof id === "string" ? id : id[0]), {
              onSuccess: () => router.back()
            });
          }
        }
      ]
    );
  };

  const renderImage = () => {
    if (image) {
      return (
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
      );
    }
    return (
      <RemoteImage
        path={product?.image}
        fallback={defaultPizzaImage}
        style={styles.image}
      />
    );
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form when canceling edit
      setEditedName(product?.name || "");
      setEditedPrice(product?.price?.toString() || "");
      setImage(null);
    }
    setIsEditing(!isEditing);
  };

  if (productLoading) return <ActivityIndicator size="large" color={Colors.light.tint} />;
  if (!product) return <Text>Product not found</Text>;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: isEditing ? "Edit Product" : product.name,
          headerStyle: {
            backgroundColor: Colors.light.tint,
          },
          headerTintColor: '#fff',
          headerRight: () => (
            <Pressable onPress={handleEditToggle}>
              <Icon
                name={isEditing ? "close-outline" : "create-outline"}
                size={24}
                color="#fff"
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        }}
      />

      <ScrollView>
        <View style={styles.imageSection}>
          {renderImage()}
          {isEditing && (
            <Pressable style={styles.changeImageButton} onPress={pickImage}>
              <Icon name="camera-outline" size={24} color="#fff" />
              <Text style={styles.changeImageText}>Change Image</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.contentSection}>
          {isEditing ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PRODUCT NAME</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="fast-food-outline" size={20} color={Colors.light.tint} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={editedName}
                    onChangeText={setEditedName}
                    placeholder="Product name"
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>PRICE ($)</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="pricetag-outline" size={20} color={Colors.light.tint} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={editedPrice}
                    onChangeText={setEditedPrice}
                    keyboardType="decimal-pad"
                    placeholder="Product price"
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={styles.actionButtons}>
                <Button 
                  text={isLoading ? "Saving..." : "Save Changes"}
                  onPress={saveChanges}
                  style={styles.saveButton}
                  disabled={isLoading}
                />
                <Pressable 
                  style={[styles.deleteButton, isLoading && styles.disabledButton]} 
                  onPress={confirmDelete}
                  disabled={isLoading}
                >
                  <Icon name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.deleteButtonText}>Delete Product</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.details}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>${product.price}</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Icon name="star-outline" size={24} color={Colors.light.tint} />
                  <Text style={styles.statValue}>4.5</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="time-outline" size={24} color={Colors.light.tint} />
                  <Text style={styles.statValue}>20-30</Text>
                  <Text style={styles.statLabel}>Minutes</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="cart-outline" size={24} color={Colors.light.tint} />
                  <Text style={styles.statValue}>100+</Text>
                  <Text style={styles.statLabel}>Orders</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageSection: {
    position: 'relative',
    height: 300,
    backgroundColor: Colors.light.tint,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: Colors.light.tint,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 25,
    gap: 8,
  },
  changeImageText: {
    color: '#fff',
    fontWeight: '600',
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  actionButtons: {
    gap: 12,
    marginTop: 10,
  },
  saveButton: {
    borderRadius: 12,
  },
  deleteButton: {
    backgroundColor: '#FF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  details: {
    alignItems: 'center',
    gap: 12,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProductDetailScreen;