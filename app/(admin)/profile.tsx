import { supabase } from '@/lib/supabase';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from "@/constants/Colors";
import Icon from "react-native-vector-icons/Ionicons";
import RevenueScreen from '@/components/RevenueScreen';
import { Platform } from 'react-native';


const ProfileScreen = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace('/sign-in');
    }
  };

  const menuItems = [
    {
      section: 'Management',
      items: [
        { icon: 'fast-food-outline', label: 'Products' },
        { icon: 'receipt-outline', label: 'Orders' },
        { icon: 'cash-outline', label: 'Revenue', onPress: () => router.push('/(admin)/menu/revenue') }
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Icon name="person" size={30} color="#666" />
          </View>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>Admin</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {[
          { label: 'Products', icon: 'cube-outline' },
          { label: 'Orders', icon: 'receipt-outline' },
          { label: 'Settings', icon: 'settings-outline' },
          { label: 'Analytics', icon: 'stats-chart-outline' }
        ].map((action, index) => (
          <TouchableOpacity key={index} style={styles.actionButton}>
            <Icon name={action.icon} size={24} color={Colors.light.tint} />
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu Sections */}
      {menuItems.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={styles.menuItem}
              onPress={item.onPress} // Thêm dòng này
            >
              <Icon name={item.icon} size={22} color="#666" style={styles.menuIcon} />
              <Text style={styles.menuText}>{item.label}</Text>
              <Icon name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Icon name="log-out-outline" size={22} color="#FF4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Add some bottom padding for better scrolling */}
      <View style={{ height: 20 }} />
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
    paddingTop: 60, // Increased top padding
    marginTop: Platform.OS === 'ios' ? 50 : 30, // Add extra margin for iOS devices
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 15,
  },
  sectionTitle: {
    padding: 15,
    paddingBottom: 5,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
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
    marginTop: 15,
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  signOutText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#FF4444',
  },
});

export default ProfileScreen;