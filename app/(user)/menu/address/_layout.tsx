import { Stack } from 'expo-router';

export default function AddressLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false, // Ẩn header mặc định
        animation: 'slide_from_right', // Animation khi chuyển màn hình
      }}
    >
      <Stack.Screen 
        name="index"
        options={{
          href: null,
        }}
      />
      <Stack.Screen 
        name="add"
        options={{
          href: null,
        }}
      />
    </Stack>
  );
}