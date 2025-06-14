import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomTextInput from '../components/CustomTextInput';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      const userData = JSON.stringify(userCredential.user);
      await AsyncStorage.setItem('user', userData);
      console.log('Login Successful');
      navigation.replace('Home');
    } catch (err) {
      console.error('Login Error:', err.message);
      setError('Invalid email or password!');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <CustomTextInput
        label="Email"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <CustomTextInput
        label="Password"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
      <Text
        style={styles.registerText}
        onPress={() => navigation.navigate('Register')}>
        Don't have an account? Register
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  registerText: {
    marginTop: 10,
    color: 'blue',
  },
});

export default LoginScreen;
