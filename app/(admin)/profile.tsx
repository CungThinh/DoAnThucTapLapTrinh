import { supabase } from '@/lib/supabase';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter

const ProfileScreen = () => {
  const router = useRouter(); // Khởi tạo router

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace('/sign-in'); // Chuyển hướng về trang sign-in sau khi sign out
    } else {
      console.error('Error signing out: ', error.message);
    }
  };

  return (
    <View>
      <Text>Profile</Text>

      <Button
        title="Sign out"
        onPress={handleSignOut}
      />
    </View>
  );
};

export default ProfileScreen;