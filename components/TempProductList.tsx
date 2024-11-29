import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Button,
} from "react-native";
import { supabase } from "@/lib/supabase";
import SearchBar from "./SearchBar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native"; // For navigation
import ParallaxScrollView from "./ParallaxSccrollView";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";

const TempProductList = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredFood, setFilteredFood] = useState<any[]>([]);

  const navigation = useNavigation();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const { data, error } = await supabase.from("food_items").select("*");

        if (error) {
          console.error("Error fetching data:", error.message);
          if (isMounted) setErrorMessage(error.message);
        } else {
          if (isMounted) {
            setData(data);
            setFilteredFood(data);
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        if (isMounted) setErrorMessage("Unexpected error occurred.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFood(data);
    } else {
      const filtered = data.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFood(filtered);
    }
  }, [searchQuery, data]);

  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  if (errorMessage) {
    return <Text style={styles.errorText}>Error: {errorMessage}</Text>;
  }

  const closeModal = () => {
    setModalVisible(false);
    setSelectedFood(null);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        setSelectedFood(item);
        setModalVisible(true);
      }}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <Text style={styles.title}>{item.title ?? "No title available"}</Text>
      <Text style={styles.description}>
        {item.description ?? "No description available"}
      </Text>
      <Text style={styles.rating}>
        Rating: {item.rating ?? "No rating available"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      headerBackgroundColor={{ light: "#ff8c00", dark: "#353636" }}
      headerImage={
        <Ionicons
          size={310}
          name="restaurant-outline"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Hôm nay bạn ăn gì ?</ThemedText>
      </ThemedView>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <FlatList
        data={filteredFood}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2} // Display 2 items per row
        columnWrapperStyle={styles.row} // Style for the row
        ListEmptyComponent={<Text>No data found.</Text>}
      />

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedFood && (
              <>
                <Text style={styles.modalTitle}>{selectedFood.title}</Text>
                <Image
                  source={{ uri: selectedFood.imageUrl }}
                  style={styles.modalImage}
                />
                <Text style={styles.modalDescription}>
                  {selectedFood.description}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerImage: {
    color: "#FFF",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  itemContainer: {
    width: "45%", // Set width to create square shape
    height: 180, // Fixed height to maintain square
    margin: 10,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    justifyContent: "flex-start", // Align items to the top
  },
  title: {
    fontSize: 16, // Font size
    fontWeight: "700",
    color: "#333333",
    marginBottom: 3,
  },
  description: {
    fontSize: 12, // Font size
    color: "#666666",
    lineHeight: 18,
    marginBottom: 3,
  },
  image: {
    width: "100%",
    height: "60%", // Use a percentage to control the image height
    borderRadius: 8,
    marginBottom: 5,
    resizeMode: "cover",
  },
  rating: {
    fontSize: 12, // Font size
    fontWeight: "600",
    color: "#ff8c00",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
    color: "red",
  },
  row: {
    justifyContent: "space-between",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Dark overlay
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 20, // More pronounced rounded corners
    alignItems: "center",
    elevation: 10, // Shadow effect for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333", // Darker title color
  },
  modalImage: {
    width: "100%",
    height: 300, // Height for modal image
    borderRadius: 15,
    marginBottom: 10,
    resizeMode: "cover",
  },
  modalDescription: {
    fontSize: 16,
    color: "#555", // Softer description color
    marginBottom: 20,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#ff8c00", // Match your theme color
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    width: "100%", // Full width button
  },
  closeButtonText: {
    color: "#fff", // White text for button
    fontWeight: "bold",
  },
});

export default TempProductList;
