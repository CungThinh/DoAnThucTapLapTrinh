import React from 'react'
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import { ActivityIndicator, View, Text } from 'react-native';

function index() {
  const { session, loading, isAdmin} = useAuth();
  
  if (loading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  if(!session) {
    console.log(session)
    return <Redirect href={'/sign-in'} />;
  }

  if (isAdmin) {
    return <Redirect href={'/(admin)/menu'} />;
  }
  else {
    return <Redirect href={'/(user)/menu'}/>;

  }
}

export default index