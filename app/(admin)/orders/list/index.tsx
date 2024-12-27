  import { Text, FlatList, ActivityIndicator, View, StyleSheet, TouchableOpacity } from 'react-native';
  import OrderList from '@/components/OrderList';
  import { useAdminOrderList } from '@/api/orders';
  import { useInsertOrderSubcription } from '@/api/orders/subcriptions';
  import Icon from "react-native-vector-icons/Ionicons";
  import { Colors } from "@/constants/Colors";
  import { useState } from 'react';
  import { isToday, parseISO } from 'date-fns';
  import { useAdminOrdersSubscription } from '@/api/orders/subcriptions';

  export default function OrdersScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'new', 'processing'
  const {
    data: orders,
    isLoading,
    error,
  } = useAdminOrderList({ archived: false });

  useInsertOrderSubcription();
  useAdminOrdersSubscription();

  if (isLoading) {
    return <ActivityIndicator size="large" color={Colors.light.tint} style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={40} color="#FF4444" />
        <Text style={styles.errorText}>Failed to fetch orders</Text>
      </View>
    );
  }

  const filteredOrders = orders?.filter(order => {
    if (selectedFilter === 'all') return true;
    
    // Log để debug
    if (selectedFilter === 'new') {
      const orderDate = parseISO(order.created_at);
      const isOrderToday = isToday(orderDate);
      console.log('Order:', {
        id: order.id,
        created_at: order.created_at, 
        parsed_date: orderDate,
        is_today: isOrderToday,
        status: order.status
      });
      
      // Chỉ check ngày tạo, không check status
      return isToday(orderDate);
    }
    
    if (selectedFilter === 'processing') return ['Cooking', 'Delivering'].includes(order.status);
    return true;
  });

  const getOrderStats = () => {
    const newOrders = orders?.filter(o => o.status === 'New' && isToday(parseISO(o.created_at))).length || 0;
    const processingOrders = orders?.filter(o => ['Cooking', 'Delivering'].includes(o.status)).length || 0;
    const totalValue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
    return { newOrders, processingOrders, totalValue };
  };

  const stats = getOrderStats();

  return (
    <View style={styles.container}>
      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="document-text-outline" size={24} color={Colors.light.tint} />
          <Text style={styles.statNumber}>{orders?.length || 0}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="time-outline" size={24} color="#FFB347" />
          <Text style={styles.statNumber}>{stats.processingOrders}</Text>
          <Text style={styles.statLabel}>Processing</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="cash-outline" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>${stats.totalValue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {[
          { id: 'all', label: 'All Orders', icon: 'list' },
          { id: 'new', label: 'New Today', icon: 'star' },
          { id: 'processing', label: 'Processing', icon: 'time' },
        ].map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.activeFilter
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Icon 
              name={`${filter.icon}-outline`} 
              size={20} 
              color={selectedFilter === filter.id ? 'white' : Colors.light.tint}
            />
            <Text style={[
              styles.filterText,
              selectedFilter === filter.id && styles.activeFilterText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <OrderList order={item} />
          </View>
        )}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
  }

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  activeFilter: {
    backgroundColor: Colors.light.tint,
  },
  filterText: {
    color: Colors.light.tint,
    fontSize: 13,
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  ordersList: {
    padding: 15,
    gap: 10,
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
  }
  });

