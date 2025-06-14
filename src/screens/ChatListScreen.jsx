import {View, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import {useNavigation, useIsFocused} from '@react-navigation/native'; // Importing useIsFocused
import ChatList from '../components/ChatList';
import VectorIcon from '../utils/VectorIcon';
import {Colors} from '../theme/Colors';
import {getDeviceId} from '../utils/helper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatListScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Using useIsFocused hook

  const [userId, setUserId] = useState();

  const fetchData = useCallback(async () => {
    const userData = await AsyncStorage.getItem('userData');
    const parsedUserData = JSON.parse(userData);
    setUserId(parsedUserData.id);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isFocused) {
      fetchData(); // Fetch data when the screen is focused
    }
  }, [isFocused, fetchData]);

  const onNavigate = () => {
    navigation.navigate('ContactScreen', {
      userId: userId,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <ChatList userId={userId} />
      </ScrollView>
      <TouchableOpacity style={styles.contactIcon} onPress={onNavigate}>
        <VectorIcon
          name="message-reply-text"
          type="MaterialCommunityIcons"
          size={22}
          color={Colors.white}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: Colors.background,
    flex: 1,
  },
  contactIcon: {
    backgroundColor: Colors.tertiary,
    height: 50,
    width: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});

export default ChatListScreen;
