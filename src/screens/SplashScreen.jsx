import {StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import React, {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    checkUserLogin();
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
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Loading...</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
