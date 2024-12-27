import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Colors } from "@/constants/Colors";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const RevenueScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    fetchRevenue();
  }, [selectedMonth, selectedDate]);

  const fetchRevenue = async () => {
    try {
      setIsLoading(true);

      const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

      const { data: monthlyData, error: monthlyError } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())
        .eq('status', 'Delivered');

      if (monthlyError) throw monthlyError;

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const StatCard = ({ label, value, icon, color, delay }) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: opacity,
          transform: [{ translateY }],
          backgroundColor: color,
        },
      ]}
    >
      <BlurView intensity={20} style={styles.blurContainer}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={24} color="#FFF" />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </BlurView>
    </Animated.View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.backgroundCircle} />
      <View style={styles.backgroundCircle2} />

      <View style={styles.header}>
        <Animated.Text style={[styles.headerTitle, { opacity, transform: [{ translateY }] }]}>
          Revenue Analytics
        </Animated.Text>
      </View>

      <View style={styles.dateContainer}>
        <View style={styles.datePickerGroup}>
          <Text style={styles.datePickerTitle}>Monthly Revenue</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowMonthPicker(!showMonthPicker)}
          >
            <Icon name="calendar-outline" size={22} color="#333" />
            <Text style={styles.dateText}>
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.datePickerGroup}>
          <Text style={styles.datePickerTitle}>Daily Revenue</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <Icon name="today-outline" size={22} color="#333" />
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString('en-US')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>


      {showMonthPicker && (
        <DateTimePicker
          value={selectedMonth}
          mode="date"
          display="spinner"
          onChange={(event, date) => {
            if (event.type === 'set') {
              if (date) setSelectedMonth(date);
            }
            setShowMonthPicker(false);
          }}
          textColor="#000000"
          themeVariant="light"
        />
      )}

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="spinner"
          onChange={(event, date) => {
            if (event.type === 'set') {
              if (date) setSelectedDate(date);
            }
            setShowDatePicker(false);
          }}
          textColor="#000000"
          themeVariant="light"
        />
      )}

      <View style={styles.statsContainer}>
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(monthlyRevenue)}
          icon="bar-chart"
          color="#FFE5E5"
          delay={0}
        />
        <StatCard
          label="Daily Revenue"
          value={formatCurrency(dailyRevenue)}
          icon="trending-up"
          color="#E5F4FF"
          delay={100}
        />
        <StatCard
          label="Today's Orders"
          value={orderCount.toString()}
          icon="document-text"
          color="#E5FFE5"
          delay={200}
        />
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundCircle: {
    position: 'absolute',
    top: -150,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FFE5E5',
    opacity: 0.5,
  },
  backgroundCircle2: {
    position: 'absolute',
    top: -100,
    left: -150,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#E5F4FF',
    opacity: 0.5,
  },
  header: {
    padding: 25,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    gap: 8,
    flex: 0.48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  dateText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '400',
  },
  statsContainer: {
    padding: 20,
    gap: 20,
    marginTop: 20,
  },
  statCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  blurContainer: {
    padding: 25,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  datePickerGroup: {
    flex: 0.48,
  },
  datePickerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginLeft: 10,
  },
  
});

export default RevenueScreen;