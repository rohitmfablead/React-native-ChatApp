import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

console.log(user)



  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setUser(userData);
          setName(userData.name);
          setCity(userData.city);
          setPhoneNumber(userData.phoneNumber);
          setImageUri(userData.imageUrl);
        }
      }
    };

    fetchUserData();
  }, []);

  // Pick image from gallery
  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  // Upload image to Firebase Storage
  const uploadImage = async (uid) => {
    if (!imageUri || imageUri.startsWith('https')) return imageUri; // Use existing image if unchanged
    setUploading(true);
    const reference = storage().ref(`/profile_pictures/${uid}.jpg`);
    await reference.putFile(imageUri);
    const url = await reference.getDownloadURL();
    setUploading(false);
    return url;
  };

  // Update profile in Firestore
  const handleUpdate = async () => {
    if (!name.trim() || !city.trim() || !phoneNumber.trim()) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    setLoading(true);
    const currentUser = auth().currentUser;

    try {
      const imageUrl = await uploadImage(currentUser.uid);

      await firestore().collection('users').doc(currentUser.uid).update({
        name: name.trim(),
        city: city.trim(),
        phoneNumber: phoneNumber.trim(),
        imageUrl,
      });

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
    setLoading(false);
  };

  // Handle logout
  const handleLogout = async () => {
    navigation.navigate('Login'); 
};

  

  if (!user) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />;
  }

  return (
    <LinearGradient colors={['#a8edea', '#fed6e3']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <Text style={styles.heading}>Profile</Text>

        {/* Profile Image */}
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri || 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
          />
          <Text style={styles.imageText}>Change Photo</Text>
        </TouchableOpacity>

        {/* Input Fields */}
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          value={city}
          onChangeText={setCity}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="numeric"
        />

        {/* Buttons */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdate}
          disabled={loading || uploading}
        >
          <LinearGradient
            colors={['#ff9966', '#ff5e62']}
            style={styles.buttonGradient}
          >
            {loading || uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Update Profile</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={()=>handleLogout()}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, },
  innerContainer: { padding: 20, alignItems: 'center' },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  imageText: {
    marginTop: 10,
    color: 'blue',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  button: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
  },
  buttonGradient: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
  },
});

export default ProfileScreen;
