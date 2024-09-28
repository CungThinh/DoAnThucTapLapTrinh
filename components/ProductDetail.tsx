import products from "@/assets/data/products";
import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

const ProductDetail = () => {
    const {id} = useLocalSearchParams()

    const product = products.find((p) => p.id.toString() === id)
    return(
        <View>
            <Text>Product Details of product {id}</Text>
        </View>
    )
}

export default ProductDetail