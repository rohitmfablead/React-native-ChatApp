import {StatusBar} from 'react-native';
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import HomeScreen from './src/screens/HomeScreen';
import {Colors} from './src/theme/Colors';
import {AppState} from 'react-native';
import RegisterUser from './src/screens/RegisterUser';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import ChatScreen from './src/screens/ChatScreen';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
const Stack = createStackNavigator();

const App = () => {
  React.useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;
    const userRef = firestore().collection('users').doc(user.uid);
    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'active') {
        userRef.set({online: true}, {merge: true});
      } else {
        userRef.set(
          {
            online: false,
            lastSeen: firestore.FieldValue.serverTimestamp(),
          },
          {merge: true},
        );
      }
    };

    AppState.addEventListener('change', handleAppStateChange);
    userRef.set({online: true}, {merge: true});
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
      userRef.set(
        {
          online: false,
          lastSeen: firestore.FieldValue.serverTimestamp(),
        },
        {merge: true},
      );
    };
  }, []);
  return (
    <NavigationContainer>
      <StatusBar backgroundColor={Colors.primaryColor} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Register" component={RegisterUser} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
