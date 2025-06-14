import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Switch,
  SafeAreaView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/Header1';

const HomeScreen = ({navigation}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const getTheme = async () => {
      const theme = await AsyncStorage.getItem('theme');
      if (theme) {
        setDarkMode(theme === 'dark');
      }
    };
    getTheme();
  }, []);

  useEffect(() => {
    const getCurrentUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeUsers = firestore()
      .collection('users')
      .onSnapshot(snapshot => {
        let userList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        userList = userList.filter(user => user.email !== currentUser.email);
        setUsers(userList);

        setLoading(false);
      });

    return () => unsubscribeUsers();
  }, [currentUser]);

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#007bff" style={styles.loading} />
    );
  }

  const toggleTheme = async () => {
    const newTheme = darkMode ? 'light' : 'dark';
    await AsyncStorage.setItem('theme', newTheme);
    setDarkMode(!darkMode);
  };

  return (
    <LinearGradient
      colors={darkMode ? ['#121212', '#1f1f1f'] : ['#ff7e5f', '#feb47b']}
      style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.userCard}
            onPress={() => navigation.navigate('ChatScreen', {user: item})}>
            <Image
              source={{
                uri:
                  item.imageUrl ||
                  'https://randomuser.me/api/portraits/men/1.jpg',
              }}
              style={styles.profileImage}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              {item.isTyping ? (
                <Text style={styles.typingIndicator}>Typing...</Text>
              ) : (
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              )} 
            </View>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.switchButton} onPress={toggleTheme}>
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.buttonGradient}>
          <Text style={styles.buttonText}>Toggle Theme</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingVertical: 40},
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    width: '90%',
    alignSelf: 'center',
  },
  profileImage: {width: 60, height: 60, borderRadius: 30, marginRight: 15},
  userInfo: {flex: 1},
  userName: {fontSize: 16, fontWeight: 'bold', color: '#000'},
  lastMessage: {fontSize: 14, color: '#000'},
  typingIndicator: {fontSize: 14, fontStyle: 'italic', color: '#007bff'},
  unreadBadge: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 15,
    minWidth: 25,
    alignItems: 'center',
  },
  unreadText: {color: '#000', fontWeight: 'bold'},
  switchButton: {
    marginTop: 20,
    alignSelf: 'center',
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default HomeScreen;
