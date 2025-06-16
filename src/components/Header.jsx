import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Header = ({isTyping, userStatus, user, profileImage}) => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Logout',
            onPress: async () => {
              await AsyncStorage.removeItem('user'); 
              navigation.replace('Login'); 
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <View style={styles.container1}>
        <View style={{width: 24}} />
        <Text style={styles.backText}>Chat List & All Users</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828479.png',
            }}
            style={styles.logoutIcon}
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      {profileImage && (
        <View style={styles.imageContainer}>
          <Image source={{uri: profileImage}} style={styles.image} />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.header}>{user || 'Unknown'}</Text>
        {isTyping ? (
          <Text style={styles.typingText}>typing...</Text>
        ) : (
          <Text style={styles.userStatus}>{userStatus}</Text>
        )}
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 80,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  container1: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  backText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  backArrow: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  userStatus: {
    fontSize: 14,
    color: '#666',
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#007bff',
  },
  backButton: {
    marginRight: 10,
    alignItems: 'center',
    marginBottom: 25,
  },
  logoutIcon: {
    width: 24,
    height: 24,
    tintColor: '#000',
  },
});
