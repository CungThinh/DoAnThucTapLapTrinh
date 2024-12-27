import { Text, FlatList, ActivityIndicator, View, StyleSheet, TouchableOpacity } from 'react-native';
import OrderList from '@/components/OrderList';
import { useAdminOrderList } from '@/api/orders';
import { Colors } from "@/constants/Colors";
import Icon from "react-native-vector-icons/Ionicons";

export default function ArchivedOrdersScreen() {
 const {
   data: orders,
   isLoading,
   error,
 } = useAdminOrderList({ archived: true });

 if (isLoading) {
   return (
     <View style={styles.centered}>
       <ActivityIndicator size="large" color={Colors.light.tint} />
     </View>
   );
 }

 if (error) {
   return (
     <View style={styles.centered}>
       <Icon name="alert-circle-outline" size={40} color="#FF4444" />
       <Text style={styles.errorText}>Failed to fetch archived orders</Text>
     </View>
   );
 }

 const getArchiveStats = () => {
   return {
     totalOrders: orders?.length || 0,
     totalRevenue: orders?.reduce((sum, order) => sum + order.total, 0) || 0
   };
 };

 const stats = getArchiveStats();

 return (
   <View style={styles.container}>
     {/* Stats Header */}
     <View style={styles.header}>
       <View style={styles.statCard}>
         <Icon name="archive-outline" size={24} color={Colors.light.tint} />
         <View>
           <Text style={styles.statTitle}>Total Archived</Text>
           <Text style={styles.statValue}>{stats.totalOrders} Orders</Text>
         </View>
       </View>

       <View style={styles.statCard}>
         <Icon name="cash-outline" size={24} color={Colors.light.tint} />
         <View>
           <Text style={styles.statTitle}>Total Revenue</Text>
           <Text style={styles.statValue}>${stats.totalRevenue.toFixed(2)}</Text>
         </View>
       </View>
     </View>

     {orders?.length === 0 ? (
       <View style={styles.emptyState}>
         <Icon name="document-outline" size={50} color="#666" />
         <Text style={styles.emptyText}>No archived orders</Text>
       </View>
     ) : (
       <FlatList
         data={orders}
         renderItem={({ item }) => (
           <View style={styles.orderCard}>
             <OrderList order={item} />
           </View>
         )}
         contentContainerStyle={styles.listContainer}
         showsVerticalScrollIndicator={false}
       />
     )}
   </View>
 );
}

const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: '#f8f9fa',
 },
 centered: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
 },
 header: {
   flexDirection: 'row',
   padding: 15,
   gap: 12,
 },
 statCard: {
   flex: 1,
   flexDirection: 'row',
   alignItems: 'center',
   gap: 12,
   backgroundColor: 'white',
   padding: 15,
   borderRadius: 12,
   elevation: 2,
   shadowColor: '#000',
   shadowOffset: {
     width: 0,
     height: 2,
   },
   shadowOpacity: 0.1,
   shadowRadius: 3,
 },
 statTitle: {
   fontSize: 13,
   color: '#666',
 },
 statValue: {
   fontSize: 16,
   fontWeight: 'bold',
   color: Colors.light.tint,
 },
 listContainer: {
   padding: 15,
   gap: 12,
 },
 orderCard: {
   backgroundColor: 'white',
   borderRadius: 12,
   padding: 15,
   elevation: 2,
   shadowColor: '#000',
   shadowOffset: {
     width: 0,
     height: 2,
   },
   shadowOpacity: 0.1,
   shadowRadius: 3,
 },
 errorText: {
   marginTop: 10,
   fontSize: 16,
   color: '#FF4444',
 },
 emptyState: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   gap: 10,
 },
 emptyText: {
   fontSize: 16,
   color: '#666',
 }
});