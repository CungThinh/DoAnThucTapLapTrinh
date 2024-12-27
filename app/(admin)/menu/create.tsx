import { View, Text, Image, StyleSheet, TextInput, Alert, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import React, { useState } from "react";
import { Colors } from "@/constants/Colors";
import Button from "@/components/Button";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { useImagePicker } from "@/hooks/useImagePicker"; 
import { useInsertProduct } from "@/api/products";
import * as FileSystem from 'expo-file-system';
import { randomUUID } from "expo-crypto";
import { supabase } from "@/lib/supabase";
import { decode } from 'base64-arraybuffer';
import Icon from "react-native-vector-icons/Ionicons";
import { useUpdateProduct } from "@/api/products";
import { useDeleteProduct } from "@/api/products";

export const defaultPizzaImage = "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png";

const Create = () => {
 const [name, setName] = useState("");
 const [price, setPrice] = useState("");
 const [category, setCategory] = useState("Pizza");
 const [errors, setErrors] = useState("");
 const { image, pickImage } = useImagePicker();
 const { mutate: insertProduct } = useInsertProduct();
 const { mutate: updateProduct } = useUpdateProduct();
 const { mutate: deleteProduct } = useDeleteProduct();
 const router = useRouter();
 const isUpdating = !!idString;

 const { id: idString } = useLocalSearchParams();
 const id = parseFloat(
   typeof idString === 'string' ? idString : idString?.[0]
 );
 
 const resetField = () => {
  setName('');
  setPrice('');
  setCategory('Pizza');
};


 const uploadImage = async () => {
   if (!image) return null;
 
   try {
     const ext = image.split('.').pop();
     const fileName = `${randomUUID()}.${ext}`;
     const base64 = await FileSystem.readAsStringAsync(image, {
       encoding: 'base64',
     });
 
     const { data, error } = await supabase.storage
       .from('product-images')
       .upload(fileName, decode(base64), {
         contentType: `image/${ext}`,
         upsert: false
       });
 
     if (error) {
       console.log('Upload error:', error);
       return null;
     }
     return data?.path || null;
   } catch (e) {
     console.log('Exception in uploadImage:', e);
     return null;
   }
 };

 const validateInput = () => {
   setErrors("");
   if (!name) {
     setErrors("Product name is required");
     return false;
   }
   if (!price || isNaN(parseFloat(price))) {
     setErrors("Valid price is required");
     return false;
   }
   if (!category) {
     setErrors("Category is required");
     return false;
   }
   return true;
 };

 const onSubmit = () => {
  if (isUpdating) {
    // update
    onUpdate();
  } else {
    onCreate();
  }
};


const onDelete = () => {
  deleteProduct(id, {
    onSuccess: () => {
      resetField();
      router.replace('/(admin)');
    },
  });
};

const confirmDelete = () => {
  Alert.alert('Confirm', 'Are you sure you want to delete this product', [
    {
      text: 'Cancel',
    },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: onDelete,
    },
  ]);
};

 const onCreate = async () => {
   if (!validateInput()) return;

   const imagePath = await uploadImage();
   insertProduct(
     { 
       name, 
       price: parseFloat(price), 
       image: imagePath,
       category 
     },
     {
       onSuccess: () => {
         Alert.alert(
           "Success",
           "Product created successfully!",
           [{ text: "OK", onPress: () => router.back() }]
         );
       },
     }
   );
 };

 const onUpdate = async () => {
  if (!validateInput()) {
    return;
  }

  const imagePath = await uploadImage();

  updateProduct(
    { id, name, price: parseFloat(price), image: imagePath, category },
    {
      onSuccess: () => {
        Alert.alert(
          "Success",
          "Product updated successfully!",
          [{ text: "OK", onPress: () => {
            resetField();
            router.back();
          }}]
        );
      },
    }
  );
};

 return (
   <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
   <View style={styles.container}>
     <Stack.Screen options={{ 
        title: isUpdating ? 'Update Product' : 'Create Product',
       headerStyle: {
         backgroundColor: Colors.light.tint
       },
       headerTintColor: '#fff',
       headerTitleStyle: {
         fontWeight: 'bold'
       }
     }} />

     <View style={styles.content}>
       {/* Hero Section */}
       <View style={styles.heroSection}>
         <View style={styles.imageWrapper}>
           <Image
             source={{ uri: image || defaultPizzaImage }}
             style={styles.image}
           />
           <View style={styles.uploadOverlay}>
             <Icon 
               name="camera" 
               size={28} 
               color="#fff"
               onPress={pickImage}
             />
           </View>
         </View>
       </View>

       {/* Form Section */}
       <View style={styles.formSection}>
         <View style={styles.formHeader}>
           <Text style={styles.formTitle}>Product Details</Text>
           <Text style={styles.formSubtitle}>Fill in the information below</Text>
         </View>

         <View style={styles.inputGroup}>
           <View style={styles.inputWrapper}>
             <Icon name="fast-food-outline" size={20} color={Colors.light.tint} style={styles.inputIcon} />
             <TextInput
               style={styles.input}
               placeholder="Product Name"
               value={name}
               onChangeText={setName}
               placeholderTextColor="#999"
               blurOnSubmit={true}
             />
           </View>

           <View style={styles.inputWrapper}>
             <Icon name="pricetag-outline" size={20} color={Colors.light.tint} style={styles.inputIcon} />
             <TextInput
               style={styles.input}
               placeholder="Price"
               keyboardType="decimal-pad"
               value={price}
               onChangeText={setPrice}
               placeholderTextColor="#999"
               blurOnSubmit={true}
             />
           </View>

           {/* Custom Category Selection */}
           <View style={styles.categoryContainer}>
             <Text style={styles.categoryLabel}>Category</Text>
             <View style={styles.categoryButtonsContainer}>
               {["Pizza", "Drinks", "Desserts", "Sides"].map((cat) => (
                 <TouchableOpacity
                   key={cat}
                   style={[
                     styles.categoryButton,
                     category === cat && styles.categoryButtonActive,
                   ]}
                   onPress={() => setCategory(cat)}
                 >
                   <Text
                     style={[
                       styles.categoryButtonText,
                       category === cat && styles.categoryButtonTextActive,
                     ]}
                   >
                     {cat}
                   </Text>
                 </TouchableOpacity>
               ))}
             </View>
           </View>

           {errors ? (
             <Text style={styles.errorText}>
               <Icon name="alert-circle" size={16} color="#FF6B6B" /> {errors}
             </Text>
           ) : null}
         </View>

          <Button onPress={onSubmit} text={isUpdating ? 'Update' : 'Create'} />
          {isUpdating && (
        <Text onPress={confirmDelete} style={styles.textButton}>
          Delete
        </Text>
      )}
       </View>
     </View>
   </View>
   </TouchableWithoutFeedback>
 );
};

const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: '#fff',
 },
 content: {
   flex: 1,
 },
 heroSection: {
   height: 250,
   backgroundColor: Colors.light.tint,
   justifyContent: 'center',
   alignItems: 'center',
   borderBottomLeftRadius: 30,
   borderBottomRightRadius: 30,
   shadowColor: "#000",
   shadowOffset: {
     width: 0,
     height: 4,
   },
   shadowOpacity: 0.3,
   shadowRadius: 4.65,
   elevation: 8,
 },
 imageWrapper: {
   position: 'relative',
   width: 180,
   height: 180,
   borderRadius: 90,
   backgroundColor: '#fff',
   padding: 5,
   shadowColor: "#000",
   shadowOffset: {
     width: 0,
     height: 2,
   },
   shadowOpacity: 0.25,
   shadowRadius: 3.84,
   elevation: 5,
 },
 textButton: {
  alignSelf: 'center',
  fontWeight: 'bold',
  color: Colors.light.tint,
  marginVertical: 10,
},
 image: {
   width: '100%',
   height: '100%',
   borderRadius: 90,
 },
 uploadOverlay: {
   position: 'absolute',
   right: 10,
   bottom: 10,
   backgroundColor: Colors.light.tint,
   width: 40,
   height: 40,
   borderRadius: 20,
   justifyContent: 'center',
   alignItems: 'center',
   shadowColor: "#000",
   shadowOffset: {
     width: 0,
     height: 2,
   },
   shadowOpacity: 0.25,
   shadowRadius: 3.84,
   elevation: 5,
 },
 formSection: {
   flex: 1,
   marginTop: -20,
   backgroundColor: '#fff',
   borderTopLeftRadius: 30,
   borderTopRightRadius: 30,
   padding: 20,
 },
 formHeader: {
   marginBottom: 25,
   paddingTop: 10,
 },
 formTitle: {
   fontSize: 24,
   fontWeight: 'bold',
   color: '#333',
   textAlign: 'center',
 },
 formSubtitle: {
   fontSize: 14,
   color: '#666',
   textAlign: 'center',
   marginTop: 5,
 },
 inputGroup: {
   marginBottom: 20,
 },
 inputWrapper: {
   flexDirection: 'row',
   alignItems: 'center',
   backgroundColor: '#f8f9fa',
   borderRadius: 12,
   marginBottom: 15,
   paddingHorizontal: 15,
   borderWidth: 1,
   borderColor: '#e9ecef',
 },
 inputIcon: {
   marginRight: 10,
 },
 input: {
   flex: 1,
   paddingVertical: 15,
   fontSize: 16,
   color: '#333',
 },
 errorText: {
   color: '#FF6B6B',
   fontSize: 14,
   marginTop: 5,
   textAlign: 'center',
 },
 button: {
   marginTop: 10,
   borderRadius: 12,
   paddingVertical: 15,
 },
 categoryContainer: {
  marginBottom: 15,
},
categoryLabel: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
  marginBottom: 8,
},
categoryButtonsContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
},
categoryButton: {
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: Colors.light.tint,
  marginBottom: 8,
},
categoryButtonActive: {
  backgroundColor: Colors.light.tint,
},
categoryButtonText: {
  color: Colors.light.tint,
  fontSize: 14,
  fontWeight: '500',
},
categoryButtonTextActive: {
  color: 'white',
},
});

export default Create;

