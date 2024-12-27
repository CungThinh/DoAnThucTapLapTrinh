import { supabase } from '@/lib/supabase';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from "@/constants/Colors";
import Icon from "react-native-vector-icons/Ionicons";
import { useState, useRef, useEffect } from 'react';
import { useAuth } from "@/context/AuthProvider";

const EditAddressScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(true);
  const [address, setAddress] = useState({
    full_name: '',
    phone: '',
    street: '',
    district: '',
    city: '',
    is_default: false
  });

  useEffect(() => {
    if (id) {
      fetchAddress();
    } else {
      setFetchingAddress(false);
    }
  }, [id]);

  const fetchAddress = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setAddress(data);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      Alert.alert('Error', 'Failed to load address details');
    } finally {
      setFetchingAddress(false);
    }
  };

  const validateForm = () => {
    if (!address.full_name.trim()) {
      Alert.alert('Error', 'Please enter recipient name');
      return false;
    }
    if (!address.phone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return false;
    }
    if (!address.street.trim()) {
      Alert.alert('Error', 'Please enter street address');
      return false;
    }
    if (!address.district.trim()) {
      Alert.alert('Error', 'Please enter district');
      return false;
    }
    if (!address.city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return false;
    }
    return true;
  };

  const handleFocus = (y: number) => {
    scrollViewRef.current?.scrollTo({
      y: y,
      animated: true
    });
  };

  const handleSave = async () => {
    if (!session?.user) return;
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (id) {
        // Update existing address
        const { error } = await supabase
          .from('delivery_addresses')
          .update({
            ...address,
            is_verified: true
          })
          .eq('id', id);

        if (error) throw error;
        Alert.alert('Success', 'Address updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        // Add new address
        const { error } = await supabase
          .from('delivery_addresses')
          .insert([
            {
              user_id: session.user.id,
              ...address,
              is_verified: true
            }
          ]);

        if (error) throw error;
        Alert.alert('Success', 'New address added', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Could not save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingAddress) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {id ? 'Edit Address' : 'Add New Address'}
        </Text>
        <View style={styles.headerBorder} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Recipient Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full name"
              value={address.full_name}
              onChangeText={(text) => setAddress({...address, full_name: text})}
              onFocus={() => handleFocus(0)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={address.phone}
              onChangeText={(text) => setAddress({...address, phone: text})}
              onFocus={() => handleFocus(50)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="House number, street name"
              value={address.street}
              onChangeText={(text) => setAddress({...address, street: text})}
              onFocus={() => handleFocus(100)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>District *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter district"
              value={address.district}
              onChangeText={(text) => setAddress({...address, district: text})}
              onFocus={() => handleFocus(150)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter city"
              value={address.city}
              onChangeText={(text) => setAddress({...address, city: text})}
              onFocus={() => handleFocus(200)}
            />
          </View>

          <TouchableOpacity 
            style={styles.defaultAddressContainer}
            onPress={() => setAddress({...address, is_default: !address.is_default})}
          >
            <View style={[styles.checkbox, address.is_default && styles.checkboxChecked]}>
              {address.is_default && <Icon name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.defaultAddressText}>Set as default address</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={() => {
              Keyboard.dismiss();
              handleSave();
            }}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Address'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 16,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
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
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  defaultAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.light.tint,
  },
  defaultAddressText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditAddressScreen;

