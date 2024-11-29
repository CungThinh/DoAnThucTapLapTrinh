import React from 'react'
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import { ActivityIndicator, View, Text } from 'react-native';

const index = () => {
  const { session, loading, isAdmin} = useAuth();
  console.log(session);
  console.log(isAdmin);
  
  if (loading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  if(!session) {
    return <Redirect href={'/sign-in'} />;
  }

  if (isAdmin) {
    console.log(isAdmin);
    return <Redirect href={'/(admin)/menu'} />;
  }
  else {
    console.log(isAdmin);
    return <Redirect href={'/(user)/menu'}/>;

  }
}

export default index