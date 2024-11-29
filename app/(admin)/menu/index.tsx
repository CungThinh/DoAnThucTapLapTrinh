import {
  FlatList,
  TextInput,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Modal,
  Button,
} from "react-native";
import ProductList from "@/components/ProductList";
import { useFetchProducts } from "@/api/products";
import { useState } from "react";
import Icon from "react-native-vector-icons/Ionicons"; // Import icon

export default function Home() {
  const { data: products, error, isLoading } = useFetchProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isFocused, setIsFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState("All");
  const [sortOrder, setSortOrder] = useState("none"); // Thêm state cho sắp xếp

  // Tìm kiếm, lọc và sắp xếp
  let filteredProducts = products?.filter((product) => {
    const matchesSearchQuery = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesPriceRange =
      selectedPriceRange === "All" ||
      (selectedPriceRange === "0-100" && product.price <= 100) ||
      (selectedPriceRange === "100-200" &&
        product.price > 100 &&
        product.price <= 200) ||
      (selectedPriceRange === "200-300" &&
        product.price > 200 &&
        product.price <= 300);
    return matchesSearchQuery && matchesCategory && matchesPriceRange;
  });

  // Sắp xếp danh sách sản phẩm
  if (sortOrder === "asc") {
    filteredProducts = filteredProducts?.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "desc") {
    filteredProducts = filteredProducts?.sort((a, b) => b.price - a.price);
  }

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return <Text>Failed to fetch products</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Tìm kiếm với icon */}
      <View
        style={[
          styles.searchContainer,
          { borderColor: isFocused ? "orange" : "gray" }, // Đổi màu viền khi focus
        ]}
      >
        <View style={styles.iconContainer}>
          <Icon
            name="search"
            size={20}
            color="white"
          />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          onFocus={() => setIsFocused(true)} // Khi TextInput được focus
          onBlur={() => setIsFocused(false)} // Khi TextInput mất focus
        />

        {/* Nút filter kế bên nút search */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setModalVisible(true)} // Mở modal khi nhấn vào nút filter
        >
          <Icon name="filter" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Danh sách sản phẩm */}
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => <ProductList product={item} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{ gap: 10 }}
        columnWrapperStyle={{ gap: 10 }}
      />

      {/* Modal filter */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)} // Đóng modal khi nhấn ra ngoài
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Options</Text>
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  selectedPriceRange === "0-100" && styles.activePriceButton,
                ]}
                onPress={() => setSelectedPriceRange("0-100")}
              >
                <Text style={styles.buttonText}>0-100k</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  selectedPriceRange === "100-200" && styles.activePriceButton,
                ]}
                onPress={() => setSelectedPriceRange("100-200")}
              >
                <Text style={styles.buttonText}>100k-200k</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  selectedPriceRange === "200-300" && styles.activePriceButton,
                ]}
                onPress={() => setSelectedPriceRange("200-300")}
              >
                <Text style={styles.buttonText}>200k-300k</Text>
              </TouchableOpacity>
            </View>

            {/* Thêm tùy chọn sắp xếp */}
            <Text style={styles.modalTitle}>Sort by Price</Text>
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortOrder === "asc" && styles.activeSortButton,
                ]}
                onPress={() => setSortOrder("asc")}
              >
                <Text style={styles.buttonText}>Giá tăng dần</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortOrder === "desc" && styles.activeSortButton,
                ]}
                onPress={() => setSortOrder("desc")}
              >
                <Text style={styles.buttonText}>Giá giảm dần</Text>
              </TouchableOpacity>
            </View>

            <Button title="Áp dụng" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "gray",
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 10,
  },
  iconContainer: {
    backgroundColor: "orange",
    padding: 10, // Điều chỉnh kích thước padding cho icon
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 6,
    borderTopLeftRadius: 6,
  },
  searchInput: {
    flex: 1, // Dành không gian cho TextInput
    height: 40,
    paddingLeft: 8,
  },
  filterButton: {
    backgroundColor: "orange",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  priceButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: "gray",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  activePriceButton: {
    backgroundColor: "orange",
  },
  sortButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: "gray",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  activeSortButton: {
    backgroundColor: "orange",
  },
  buttonText: {
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Màu nền tối
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
