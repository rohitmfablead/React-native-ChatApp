import { StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import HomeScreen from '../Screens/HomeScreen';
import SplashScreen from '../../src/screens/SplashScreen';
import LoginScreen from '../../src/screens/LoginScreen';
import SignupScreen from '../../src/screens/RegisterUser';
import TabBottomNavigation from './TabBottomNavigation';
import ProfileScreen from '../Screens/ProfileScreen';
const Stack = createStackNavigator();

const RootNavigation = () => {
  return (
    <NavigationContainer>
      {/* <StatusBar backgroundColor={Colors.primaryColor} /> */}
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={SignupScreen} />
        <Stack.Screen name="Bottom" component={TabBottomNavigation} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default RootNavigation

const styles = StyleSheet.create({})