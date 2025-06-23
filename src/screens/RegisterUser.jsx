import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const uploadImage = async (uid) => {
    if (!imageUri) return null;
    const reference = storage().ref(`/profile_pictures/${uid}.jpg`);
    await reference.putFile(imageUri);
    return await reference.getDownloadURL();
  };

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedCity = city.trim();
    const trimmedPhoneNumber = phoneNumber.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedCity || !trimmedPhoneNumber) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (trimmedPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(trimmedPhoneNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(trimmedEmail, trimmedPassword);
      const userId = userCredential.user.uid;
      const imageUrl = await uploadImage(userId);

      await firestore().collection('users').doc(userId).set({
        name: trimmedName,
        email: trimmedEmail,
        city: trimmedCity,
        phoneNumber: trimmedPhoneNumber,
        imageUrl,
        status: 'Online',
        lastSeen: Date.now(),
      });

      console.log('User registered successfully');
      Alert.alert('Success', 'Registration successful!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error registering user:', error);

      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'This email is already in use.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'Invalid email format.');
      } else {
        Alert.alert('Error', 'Failed to register. Please try again.');
      }
    }

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.addPhotoText}>Add Photo</Text>
        )}
      </TouchableOpacity>
      <CustomTextInput
        label="Name"
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
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
      <CustomTextInput
        label="City"
        placeholder="City"
        value={city}
        onChangeText={setCity}
      />
      <CustomTextInput
        label="Phone Number"
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <CustomButton
        title="Sign Up" 
        onPress={handleRegister}
        backgroundColor="#3498db" 
        textColor="#fff" 
      />
        
      )}
      <View style={{ marginVertical: 10, alignItems: 'left' }}>
        <Text>
          Already have an account?{' '}
          <Text
            style={{ color: '#3498db', fontWeight: 'bold' }}
            onPress={()=>navigation.navigate("Login")}
          >
            Login
          </Text>
        </Text>
      </View>
     
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#f5f5f5',
    // alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
    alignSelf: 'center',
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  addPhotoText: {
    color: '#555',
    fontSize: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

export default RegisterScreen;
