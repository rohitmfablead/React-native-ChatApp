import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';

const BaseHeader = ({username, profileImageUrl, onNotificationPress}) => {
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.header}>
      {/* Left Side: Profile Image and Username */}
      <TouchableOpacity
        style={styles.profileContainer}
        onPress={() => navigation.navigate('Bottom', { screen: 'Profile' })}         >
        <Image
          source={{uri: profileImageUrl || 'https://via.placeholder.com/50'}}
          style={styles.profileImage}
        />
        <Text style={styles.username}>{username || 'User'}</Text>
      </TouchableOpacity>

      {/* Right Side: Notification Bell */}
      <TouchableOpacity onPress={onNotificationPress}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/1827/1827392.png',
          }}
          style={styles.notificationIcon}
        />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    // borderBottomLeftRadius: 15,
    // borderBottomRightRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  notificationIcon: {
    width: 30,
    height: 30,
    tintColor: '#fff',
  },
});

export default BaseHeader;
