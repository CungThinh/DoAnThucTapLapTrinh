import { supabase } from '@/lib/supabase';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from "@/constants/Colors";
import Icon from "react-native-vector-icons/Ionicons";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/context/AuthProvider";

interface Address {
  id: string;
  full_name: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  is_default: boolean;
  is_verified: boolean;
}

const AddressListScreen = () => {
  const router = useRouter();
  const { session } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);

  const fetchAddresses = useCallback(async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', session.user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      Alert.alert('Error', 'Failed to load addresses');
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [fetchAddresses])
  );

  useEffect(() => {
    const subscription = supabase
      .channel('delivery_addresses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'delivery_addresses' }, fetchAddresses)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAddresses]);

  const handleSetDefault = async (addressId: string) => {
    if (!session?.user) return;

    try {
      await supabase
        .from('delivery_addresses')
        .update({ is_default: false })
        .eq('user_id', session.user.id);

      await supabase
        .from('delivery_addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  const handleDelete = async (addressId: string, isDefault: boolean) => {
    if (isDefault) {
      Alert.alert(
        'Cannot Delete',
        'You cannot delete your default address. Please set another address as default first.'
      );
      return;
    }

    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('delivery_addresses')
                .delete()
                .eq('id', addressId);

              if (error) throw error;
              fetchAddresses();
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerBorder} />
      </View>

      <ScrollView style={styles.content}>
        {addresses.map((address) => (
          <View key={address.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Text style={styles.name}>{address.full_name}</Text>
              <Text style={styles.phone}>｜{address.phone}</Text>
            </View>
            
            <Text style={styles.addressText}>
              {address.street}
            </Text>
            <Text style={styles.addressText}>
              {`${address.district}, ${address.city}`}
            </Text>

            <View style={styles.addressFooter}>
              <View style={styles.addressActions}>
                {address.is_default ? (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefault(address.id)}
                  >
                    <Text style={styles.setDefaultText}>Set as default</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => router.push(`/menu/address/${address.id}`)}
                  >
                    <Icon name="create-outline" size={20} color={Colors.light.tint} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDelete(address.id, address.is_default)}
                  >
                    <Icon name="trash-outline" size={20} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {!address.is_verified && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>
                    Phone number or delivery address is not verified. Please check and update
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/menu/address/add')}
        >
          <Icon name="add-circle-outline" size={24} color={Colors.light.tint} />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  headerBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#eee',
  },
  content: {
    flex: 1,
  },
  addressCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  phone: {
    fontSize: 16,
    color: '#666',
  },
  addressText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  addressFooter: {
    marginTop: 12,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  defaultBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: `${Colors.light.tint}15`,
  },
  defaultText: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '500',
  },
  setDefaultButton: {
    alignSelf: 'flex-start',
  },
  setDefaultText: {
    color: Colors.light.tint,
    fontSize: 14,
  },
  warningContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
  },
  warningText: {
    fontSize: 13,
    color: '#8B6E00',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '500',
  },
});

export default AddressListScreen;

