import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Colors } from "@/constants/Colors";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { TouchableOpacity } from 'react-native';

const RevenueScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, [selectedMonth, selectedDate]);

  const fetchRevenue = async () => {
    try {
      setIsLoading(true);
      
      // Tính range cho tháng được chọn
      const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
      
      // Query doanh thu tháng
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())
        .eq('status', 'Delivered');

      if (monthlyError) throw monthlyError;

      // Query doanh thu ngày
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: dailyData, error: dailyError } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .eq('status', 'Delivered');

      if (dailyError) throw dailyError;

      // Tính tổng doanh thu
      const monthlyTotal = monthlyData.reduce((sum, order) => sum + (order.total || 0), 0);
      const dailyTotal = dailyData.reduce((sum, order) => sum + (order.total || 0), 0);
      
      setMonthlyRevenue(monthlyTotal);
      setDailyRevenue(dailyTotal);
      setOrderCount(dailyData.length);
      
    } catch (error) {
      console.error('Error fetching revenue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thống Kê Doanh Thu</Text>
      </View>

      {/* Date Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowMonthPicker(true)}
        >
          <Icon name="calendar-outline" size={24} color={Colors.light.tint} />
          <Text style={styles.dateText}>
            {selectedMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon name="today-outline" size={24} color={Colors.light.tint} />
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('vi-VN')}
          </Text>
        </TouchableOpacity>
      </View>

      {showMonthPicker && (
        <DateTimePicker
          value={selectedMonth}
          mode="date"
          display="spinner"
          onChange={(event, date) => {
            setShowMonthPicker(false);
            if (date) setSelectedMonth(date);
          }}
        />
      )}

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="spinner"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {/* Revenue Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Doanh Thu Tháng</Text>
          <Text style={styles.statValue}>{formatCurrency(monthlyRevenue)}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Doanh Thu Ngày</Text>
          <Text style={styles.statValue}>{formatCurrency(dailyRevenue)}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Số Đơn Hôm Nay</Text>
          <Text style={styles.statValue}>{orderCount}</Text>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text>Đang tải...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'white',
    marginTop: 15,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    gap: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  statsContainer: {
    padding: 15,
    gap: 15,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default RevenueScreen;