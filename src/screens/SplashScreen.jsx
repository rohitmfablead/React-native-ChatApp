import {StyleSheet, Text, View, ActivityIndicator, Image} from 'react-native';
import React, {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      checkUserLogin();
    }, 3000); 
  
    // Cleanup on unmount
    return () => clearTimeout(timer);
  }, []);

  const checkUserLogin = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        navigation.replace('Home');
      } else {
        navigation.replace('Register');
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
      navigation.replace('Register');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712104.png', // Replace with your own URL
        }}
        style={styles.logo}
        resizeMode="contain"
      />
      {/* <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      <Text style={styles.loadingText}>Loading...</Text> */}
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Optional background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  loader: {
    marginTop: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});
