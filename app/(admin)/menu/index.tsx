import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useFetchProducts } from "@/api/products";
import Icon from "react-native-vector-icons/Ionicons";
import { Stack, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import RemoteImage from "@/components/RemoteImage";
import { defaultPizzaImage } from "./create";

const ListItem = ({ product, onPress }) => (
  <TouchableOpacity onPress={() => onPress(product)} style={styles.listItem}>
    <RemoteImage 
      path={product.image}
      fallback={defaultPizzaImage}
      style={styles.productImage}
    />
    <View style={styles.itemContent}>
      <Text style={styles.itemName}>{product.name}</Text>
      <Text style={styles.itemPrice}>${product.price.toFixed(2)}</Text>
    </View>
  </TouchableOpacity>
);

export default function AdminMenu() {
  const { data: products, error, isLoading, refetch } = useFetchProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handlePress = (product) => {
    router.push(`/menu/${product.id}`);
  };

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return (
    <SafeAreaView style={styles.loadingContainer}>
      <ActivityIndicator />
    </SafeAreaView>
  );
  
  if (error) return (
    <SafeAreaView style={styles.loadingContainer}>
      <Text>Error loading products</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: "",
            headerShown: false,
          }} 
        />

        <View style={styles.topStats}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{products?.length || 0}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              ${products?.reduce((sum, p) => sum + p.price, 0).toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>

        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => (
            <ListItem
              product={item}
              onPress={handlePress}
            />
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        />

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push("/menu/create")}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topStats: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    margin: 15,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  list: {
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 15,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0'
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.light.tint,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: Colors.light.tint,
    width: 40,
    height: 40,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});