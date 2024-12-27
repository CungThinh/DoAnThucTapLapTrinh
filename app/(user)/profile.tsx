import { supabase } from '@/lib/supabase';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from "@/constants/Colors";
import Icon from "react-native-vector-icons/Ionicons";
import { useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthProvider";
import * as Notifications from 'expo-notifications';

const ProfileScreen = () => {
  const router = useRouter();
  const { session } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  // Request permission for push notifications
  const registerForPushNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission denied');
      return;
    }
    console.log('Notification permission granted');
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.log('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [session]);

  // Fetch user orders statistics
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
  });
  // Fetch initial order stats
  const fetchOrderStats = async () => {
    if (!session?.user) return;

    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status')
        .eq('user_id', session.user.id);

      if (error) throw error;

      const stats = {
        total: orders.length,
        pending: orders.filter(order => ['New', 'Cooking', 'Delivering'].includes(order.status)).length,
        completed: orders.filter(order => order.status === 'Delivered').length,
      };

      setOrderStats(stats);
    } catch (error) {
      console.log('Error fetching order stats:', error);
    }
  };

  useEffect(() => {
    fetchOrderStats();

    // Real-time subscription to orders
    const subscription = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${session?.user.id}` },
        (payload) => {
          console.log('Change received:', payload);
          fetchOrderStats(); // Re-fetch stats when a change occurs
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [session]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace('/sign-in');
    }
  };

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', route: '/profile/edit' },
        { icon: 'heart-outline', label: 'Favorite Orders', route: '/favorites' },
        {
          icon: 'location-outline',
          label: 'Delivery Addresses',
          route: '/menu/address'
        }
      ]
    },
    {
      section: 'Orders',
      items: [
        { icon: 'receipt-outline', label: 'Order History', route: '/orders' },
        { icon: 'wallet-outline', label: 'Payment Methods', route: '/payments' },
        { icon: 'star-outline', label: 'My Reviews', route: '/reviews' }
      ]
    },
    {
      section: 'Preferences',
      items: [
        { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
        { icon: 'lock-closed-outline', label: 'Privacy & Security', route: '/privacy' },
        { icon: 'help-circle-outline', label: 'Help & Support', route: '/help' }
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Icon name="person" size={40} color="#fff" />
          </View>
          <TouchableOpacity style={styles.editAvatarButton}>
            <Icon name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>
          {userProfile?.full_name || session?.user?.email?.split('@')[0] || 'User'}
        </Text>
        <Text style={styles.userEmail}>
          {session?.user?.email || ''}
        </Text>
      </View>

      {/* Order Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{orderStats.total}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={[styles.statItem, styles.statBorder]}>
          <Text style={styles.statNumber}>{orderStats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{orderStats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Menu Sections */}
      {menuItems.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={styles.menuItem}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.menuIconContainer}>
                <Icon name={item.icon} size={22} color={Colors.light.tint} />
              </View>
              <Text style={styles.menuText}>{item.label}</Text>
              <Icon name="chevron-forward" size={20} color="#ddd" />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Icon name="log-out-outline" size={22} color="#FF4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: Colors.light.tint,
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.tint,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    marginTop: 20,
    borderRadius: 12,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#f0f0f0',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginTop: 25,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    marginLeft: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.light.tint}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginHorizontal: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  signOutText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '500',
  },
});

export default ProfileScreen;