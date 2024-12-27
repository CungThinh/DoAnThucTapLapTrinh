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
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from "@/constants/Colors";
import Icon from "react-native-vector-icons/Ionicons";
import { useState, useRef } from 'react';
import { useAuth } from "@/context/AuthProvider";

const AddAddressScreen = () => {
  const router = useRouter();
  const { session } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    full_name: '',
    phone: '',
    street: '',
    district: '',
    city: '',
    is_default: false
  });

  const validateForm = () => {
    if (!address.full_name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên người nhận');
      return false;
    }
    if (!address.phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return false;
    }
    if (!address.street.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
      return false;
    }
    if (!address.district.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập quận/huyện');
      return false;
    }
    if (!address.city.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập thành phố');
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

      Alert.alert('Thành công', 'Đã thêm địa chỉ mới', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Lỗi', 'Không thể lưu địa chỉ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerBorder} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ tên người nhận *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập họ tên"
              value={address.full_name}
              onChangeText={(text) => setAddress({...address, full_name: text})}
              onFocus={() => handleFocus(0)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              value={address.phone}
              onChangeText={(text) => setAddress({...address, phone: text})}
              onFocus={() => handleFocus(50)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ *</Text>
            <TextInput
              style={styles.input}
              placeholder="Số nhà, tên đường"
              value={address.street}
              onChangeText={(text) => setAddress({...address, street: text})}
              onFocus={() => handleFocus(100)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quận/Huyện *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập quận/huyện"
              value={address.district}
              onChangeText={(text) => setAddress({...address, district: text})}
              onFocus={() => handleFocus(150)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Thành phố *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập thành phố"
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
            <Text style={styles.defaultAddressText}>Đặt làm địa chỉ mặc định</Text>
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
              {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
    color: '#333',
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

export default AddAddressScreen;