import React, { useState } from "react";
import { Stack } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
  FlatList,
  Modal,
  ActivityIndicator,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { FontAwesome } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useFetchProducts } from "@/api/products";
import ProductList from "@/components/ProductList";
import { Link } from "expo-router";
import { useCart } from "@/context/CartProvider";

function CartIcon() {
  const { items } = useCart();
  const itemCount = items.length;

  return (
    <Link href="/cart" asChild>
      <Pressable>
        {({ pressed }) => (
          <View style={styles.cartContainer}>
            <FontAwesome
              name="shopping-cart"
              size={25}
              color={Colors.light.tint}
              style={{ opacity: pressed ? 0.5 : 1 }}
            />
            {itemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{itemCount}</Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    </Link>
  );
}

export default function Home() {
  const { data: products, error, isLoading } = useFetchProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState("All");
  const [sortOrder, setSortOrder] = useState("none");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    { id: 1, name: "All", icon: require("@/assets/images/BestSeller1.jpg") },
    { id: 2, name: "Pizza", icon: require("@/assets/images/Pizza.jpg") },
    { id: 3, name: "Drinks", icon: require("@/assets/images/Drinks.jpg") },
    { id: 4, name: "Desserts", icon: require("@/assets/images/Desserts.jpg") },
    { id: 5, name: "Sides", icon: require("@/assets/images/pizza-logo.png") },
  ];

  // Function lọc và sắp xếp sản phẩm
  const filterAndSortProducts = (products) => {
    return products
      ?.filter((product) => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === "All" || product.category === selectedCategory;
        const matchesPrice =
          selectedPriceRange === "All" ||
          (selectedPriceRange === "0-100" && product.price <= 100) ||
          (selectedPriceRange === "100-200" &&
            product.price > 100 &&
            product.price <= 200) ||
          (selectedPriceRange === "200+" && product.price > 200);
        return matchesSearch && matchesPrice && matchesCategory;
      })
      ?.sort((a, b) => {
        if (sortOrder === "asc") return a.price - b.price;
        if (sortOrder === "desc") return b.price - a.price;
        return 0;
      });
  };

  // Sắp xếp sản phẩm theo danh mục
  const categorizedProducts = {
    Pizza: filterAndSortProducts(products?.filter((p) => p.category === "Pizza")),
    Drinks: filterAndSortProducts(
      products?.filter((p) => p.category === "Drinks")
    ),
    Desserts: filterAndSortProducts(
      products?.filter((p) => p.category === "Desserts")
    ),
    Sides: filterAndSortProducts(
      products?.filter((p) => p.category === "Sides")
    ),
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        {/* Location Header */}
        <View style={styles.locationHeader}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Your Location</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>3892 Olen Thomas Drive, NY</Text>
              <Icon name="chevron-down" size={20} color="#666" />
            </View>
          </View>
          <View style={styles.headerRightContainer}>
            <TouchableOpacity style={styles.notificationButton}>
              <Icon name="notifications-outline" size={24} color="#000" />
            </TouchableOpacity>
            <CartIcon />
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search-outline" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search foods, groceries"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="filter" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  category.name === selectedCategory && styles.activeCategoryItem
                ]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <View style={styles.categoryImageContainer}>
                  <Image
                    source={category.icon}
                    style={styles.categoryImage}
                  />
                </View>
                <Text style={[
                  styles.categoryName,
                  category.name === selectedCategory && styles.activeCategoryName
                ]}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product Grid with Category Titles */}
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.light.tint}
            style={styles.loader}
          />
        ) : (
          <View style={styles.productsContainer}>
            {selectedCategory === "All" || selectedCategory === "Pizza" ? (
              <>
                <Text style={styles.categoryTitle}>Pizza</Text>
                <FlatList
                  data={categorizedProducts.Pizza}
                  renderItem={({ item }) => <ProductList product={item} />}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  contentContainerStyle={styles.productGrid}
                  columnWrapperStyle={styles.productRow}
                  scrollEnabled={false}
                />
              </>
            ) : null}

            {selectedCategory === "All" || selectedCategory === "Drinks" ? (
              <>
                <Text style={styles.categoryTitle}>Drinks</Text>
                <FlatList
                  data={categorizedProducts.Drinks}
                  renderItem={({ item }) => <ProductList product={item} />}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  contentContainerStyle={styles.productGrid}
                  columnWrapperStyle={styles.productRow}
                  scrollEnabled={false}
                />
              </>
            ) : null}

            {selectedCategory === "All" || selectedCategory === "Desserts" ? (
              <>
                <Text style={styles.categoryTitle}>Desserts</Text>
                <FlatList
                  data={categorizedProducts.Desserts}
                  renderItem={({ item }) => <ProductList product={item} />}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  contentContainerStyle={styles.productGrid}
                  columnWrapperStyle={styles.productRow}
                  scrollEnabled={false}
                />
              </>
            ) : null}

            {selectedCategory === "All" || selectedCategory === "Sides" ? (
              <>
                <Text style={styles.categoryTitle}>Sides</Text>
                <FlatList
                  data={categorizedProducts.Sides}
                  renderItem={({ item }) => <ProductList product={item} />}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  contentContainerStyle={styles.productGrid}
                  columnWrapperStyle={styles.productRow}
                  scrollEnabled={false}
                />
              </>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={Colors.light.tint} />
              </TouchableOpacity>
            </View>

            {/* Price Range */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.chipContainer}>
                {["All", "0-100", "100-200", "200+"].map(range => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.chip,
                      range === selectedPriceRange && styles.activeChip
                    ]}
                    onPress={() => setSelectedPriceRange(range)}
                  >
                    <Text style={range === selectedPriceRange ? styles.activeChipText : styles.chipText}>
                      {range === "All" ? "All" : `$${range}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.chipContainer}>
                {["none", "asc", "desc"].map(order => (
                  <TouchableOpacity
                    key={order}
                    style={[
                      styles.chip,
                      order === sortOrder && styles.activeChip
                    ]}
                    onPress={() => setSortOrder(order)}
                  >
                    <Text style={order === sortOrder ? styles.activeChipText : styles.chipText}>
                      {order === "none" ? "Default" : order === "asc" ? "Price: Low to High" : "Price: High to Low"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: "#666",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
  },
  cartContainer: {
    marginRight: 15,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: Colors.light.tint,
    padding: 10,
    borderRadius: 8,
  },
  categoriesSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingLeft: 16,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 20,
  },
  activeCategoryItem: {
    opacity: 1,
  },
  categoryImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 36,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
    marginBottom: 8,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeCategoryName: {
    color: Colors.light.tint,
    fontWeight: "700",
  },
  productsContainer: {
    paddingHorizontal: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.tint,
    marginVertical: 12,
  },
  productGrid: {
    gap: 16,
  },
  productRow: {
    gap: 16,
  },
  loader: {
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.tint,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
  },
  activeChip: {
    backgroundColor: Colors.light.tint,
  },
  chipText: {
    fontSize: 18,
    color: "#666",
  },
  activeChipText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});