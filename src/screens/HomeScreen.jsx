
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
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';


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

        const chatListeners = userList.map(user => {
          if (!user.id) return null;

          const chatId = [currentUser.uid, user.id].sort().join('_');
          const chatRef = firestore().collection('chats').doc(chatId);

          return chatRef.onSnapshot(chatSnap => {
            let lastMessage = '';
            let lastMessageTimestamp = null;
            let unreadCount = 0;
            let isTyping = false;

            if (chatSnap.exists) {
              const chatData = chatSnap.data();
              lastMessage = chatData.lastMessage || '';
              lastMessageTimestamp = chatData.lastMessageTimestamp || null;
              unreadCount = chatData[`unreadCount_${currentUser.uid}`] || 0;
              isTyping = chatData[`typing_${user.id}`] || false;
            }

            setUsers(prevUsers =>
              prevUsers.map(u =>
                u.id === user.id
                  ? {
                      ...u,
                      lastMessage,
                      lastMessageTimestamp,
                      unreadCount,
                      isTyping,
                    }
                  : u,
              ),
            );
          });
        });

        setLoading(false);

        return () => {
          chatListeners.forEach(unsub => unsub && unsub());
        };
      });

    return () => unsubscribeUsers();
  }, [currentUser]);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.title}>Loading users...</Text>
        </View>
    );
  }

  const toggleTheme = async () => {
    const newTheme = darkMode ? 'light' : 'dark';
    await AsyncStorage.setItem('theme', newTheme);
    setDarkMode(!darkMode);
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <Header />
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.userCard}
            onPress={() => navigation.navigate('Chat', {user: item})}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  containerDark: {backgroundColor: '#121212'},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007bff',
  },
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
  userName: {fontSize: 16, fontWeight: 'bold'},
  lastMessage: {fontSize: 14, color: '#666'},
  typingIndicator: {fontSize: 14, fontStyle: 'italic', color: '#007bff'},
  unreadBadge: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 15,
    minWidth: 25,
    alignItems: 'center',
  },
  unreadText: {color: '#fff', fontWeight: 'bold'},
});

export default HomeScreen;

