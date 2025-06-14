import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';

const Header = ({isTyping, userStatus, user, profileImage}) => {
  if (!user) {
    return (
      <View style={styles.container1}>
        <Text style={styles.backText}>Chat List & All Users</Text>
      </View>
    );
  }
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Text
          style={{
            fontSize: 50,

            fontWeight: 'bold',
            color: '#007bff',
          }}>
          ←
        </Text>
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
    backgroundColor: '#fff',

    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  backText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  chatText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    // flex: 1,
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
});
