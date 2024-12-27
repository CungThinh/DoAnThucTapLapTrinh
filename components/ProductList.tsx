import { Product } from "@/app/types";
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Tables } from "@/app/types";
import { Link, useSegments } from "expo-router";
import { defaultPizzaImage } from "@/app/(admin)/menu/create";
import RemoteImage from "./RemoteImage";
import { Colors } from "@/constants/Colors";
import Icon from 'react-native-vector-icons/Ionicons';
import AddToCartButton from './AddToCartButton';

type ProductListItemProps = {
  product: Tables<'products'>;
};

const ProductList = ({ product }: ProductListItemProps) => {
  const segments = useSegments();
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (event: any) => {
    event.stopPropagation();
    setIsFavorite(!isFavorite);
  };

    // Tính giá dựa trên size
    const getPriceBySize = {
      S: product.price,
      M: product.price * 1.2,
      L: product.price * 1.5, 
      XL: product.price * 1.8
    };
  
    const handleAddToCart = () => {
      addItem({
        ...product,
        size: 'S', // Size mặc định là M
        price: getPriceBySize['S'] // Lấy giá của size M
      });
    };

  return (
    <View style={styles.container}>
      <Link href={`/${segments[0]}/menu/${product.id}`} asChild>
        <Pressable style={styles.contentContainer}>
          <View style={styles.imageContainer}>
            <RemoteImage
              path={product.image}
              fallback={defaultPizzaImage}
              style={styles.image}
              resizeMode="contain"
            />
            <Pressable
              style={styles.favoriteButton}
              onPress={toggleFavorite}
            >
              <Icon
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? "#FF4444" : "#666"}
              />
            </Pressable>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>{product.name}</Text>

            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                <Icon name="star" size={14} color="#FFD700" />
                <Icon name="star" size={14} color="#FFD700" />
                <Icon name="star" size={14} color="#FFD700" />
                <Icon name="star" size={14} color="#FFD700" />
                <Icon name="star-half" size={14} color="#FFD700" />
              </View>
              <Text style={styles.ratingText}>(4.5)</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
              <AddToCartButton product={product} />
            </View>
          </View>
        </Pressable>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: "50%",
    padding: 8,
  },
  contentContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoContainer: {
    marginTop: 8,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.tint,
  },
  addButton: {
    backgroundColor: Colors.light.tint,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.tint,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ProductList;