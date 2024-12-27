import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useCart } from "@/context/CartProvider";
import { PizzaSize } from "@/app/types";
import { useFetchProductById } from "@/api/products";
import { ActivityIndicator } from "react-native";
import RemoteImage from "@/components/RemoteImage";
import { defaultPizzaImage } from "@/app/(admin)/menu/create";
import Icon from "react-native-vector-icons/Ionicons";
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");
const sizes: PizzaSize[] = ["S", "M", "L", "XL"];

const getPriceBySize = (basePrice: number) => ({
  S: basePrice,
  M: basePrice * 1.2,
  L: basePrice * 1.5,
  XL: basePrice * 1.8,
});

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { data: product, error, isLoading } = useFetchProductById(parseInt(typeof id === "string" ? id : id[0]));
  const [sizeSelected, setSizeSelected] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  if (isLoading) {
    return <ActivityIndicator size="large" color={Colors.light.tint} />;
  }

  if (!product) return <Text>Product not found</Text>;

  const priceBySize = getPriceBySize(product.price);
  const currentPrice = priceBySize[sizeSelected];

  const addToCart = () => {
    if (!product) return;
    addItem({
      ...product,
      price: currentPrice,
    }, sizeSelected);
    router.push("/cart");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Hero Image - Fixed Position */}
      <View style={styles.heroContainer}>
        <RemoteImage
          path={product.image}
          fallback={defaultPizzaImage}
          style={styles.heroImage}
        />
      </View>
      
      {/* Back Button - Absolute Position */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Icon name="chevron-back" size={28} color="white" />
      </TouchableOpacity>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Product Info */}
          <Text style={styles.title}>{product.name}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>4.5</Text>
              <Text style={styles.reviewCount}>(123 reviews)</Text>
            </View>
            <Text style={styles.price}>${currentPrice.toFixed(2)}</Text>
          </View>

          {/* Size Selection */}
          <Text style={styles.sectionTitle}>Choose Size</Text>
          <View style={styles.sizeContainer}>
            {sizes.map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => setSizeSelected(size)}
                style={[
                  styles.sizeOption,
                  sizeSelected === size && styles.selectedSize,
                ]}
              >
                <Icon 
                  name="pizza" 
                  size={24} 
                  color={sizeSelected === size ? "white" : "#666"} 
                />
                <Text style={[
                  styles.sizeText,
                  sizeSelected === size && styles.selectedSizeText
                ]}>
                  {size}
                </Text>
                <Text style={[
                  styles.sizePriceText,
                  sizeSelected === size && styles.selectedSizePriceText
                ]}>
                  ${priceBySize[size].toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.description || "Delicious and fresh ingredients combined to create the perfect taste. Made with our special recipe that has been perfected over generations."}
          </Text>

          {/* Quantity */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Icon name="remove" size={24} color={Colors.light.tint} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Icon name="add" size={24} color={Colors.light.tint} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Extra padding for bottom bar */}
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>
            ${(currentPrice * quantity).toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={addToCart}>
          <Icon name="cart" size={24} color="white" />
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: width * 0.8,
    backgroundColor: '#000',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
    marginTop: width * 0.6, // Start content below hero image
  },
  contentContainer: {
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 25,
    minHeight: Dimensions.get('window').height - (width * 0.6), // Ensure content fills screen
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  reviewCount: {
    color: '#666',
    marginLeft: 5,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  sizeOption: {
    width: 80,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  selectedSize: {
    backgroundColor: Colors.light.tint,
  },
  sizeText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  selectedSizeText: {
    color: 'white',
  },
  sizePriceText: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedSizePriceText: {
    color: 'white',
  },
  description: {
    color: '#666',
    lineHeight: 22,
    marginBottom: 25,
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 5,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 20,
  },
  bottomPadding: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    color: '#666',
    fontSize: 14,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProductDetailScreen;