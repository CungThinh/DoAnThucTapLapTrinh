import ProductDetail from "@/components/ProductDetail";
import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

const ProductDetailScreen = () => {
    const {id} = useLocalSearchParams()
    return(
        <View>
            <Text>Product Details of product {id}</Text>
        </View>
    )
}

export default ProductDetailScreen