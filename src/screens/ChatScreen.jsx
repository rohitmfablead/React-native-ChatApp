import React, {useEffect, useState, useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import Header from '../components/Header1';
import ChatInput from '../components/ChatInput';
import ChatMessages from '../components/ChatMessages';

const ChatScreen = ({route}) => {
  const {user} = route.params;
  const currentUser = auth().currentUser;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [userStatus, setUserStatus] = useState(
    user.online ? 'Online' : 'Offline',
  );

  const chatId = [currentUser.uid, user.id].sort().join('_');
  const flatListRef = useRef(null);

  // ✅ Update User's Online Status in Firestore
  useEffect(() => {
    const userRef = firestore().collection('users').doc(currentUser.uid);
    const chatRef = firestore().collection('chats').doc(chatId);

    // ✅ Set user online when chat opens
    userRef.set({online: true}, {merge: true});

    // ✅ Listen for recipient's online status
    const unsubscribeUserStatus = firestore()
      .collection('users')
      .doc(user.id)
      .onSnapshot(doc => {
        if (doc.exists) {
          setUserStatus(
            doc.data().online
              ? 'Online'
              : 'Last seen: ' +
                  new Date(doc.data().lastSeen?.toDate()).toLocaleTimeString(),
          );
        }
      });

    return () => {
      // ✅ Set user offline and update last seen when leaving chat
      userRef.set(
        {online: false, lastSeen: firestore.FieldValue.serverTimestamp()},
        {merge: true},
      );
      unsubscribeUserStatus();
    };
  }, []);

  // ✅ Fetch Messages & Update Read Status in Real-Time
  useEffect(() => {
    const chatRef = firestore().collection('chats').doc(chatId);

    const unsubscribe = chatRef
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot(async snapshot => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(msgs);

        // ✅ Check if there are unread messages for the current user
        const unreadMessages = snapshot.docs.filter(
          doc => doc.data().receiverId === currentUser.uid && !doc.data().read,
        );

        if (unreadMessages.length > 0) {
          // ✅ Mark all unread messages as read
          const batch = firestore().batch();
          unreadMessages.forEach(doc => {
            batch.update(doc.ref, {read: true});
          });
          await batch.commit();

          // ✅ Reset unread count in Firestore transaction
          await firestore().runTransaction(async transaction => {
            const chatDoc = await transaction.get(chatRef);
            if (chatDoc.exists) {
              transaction.update(chatRef, {
                [`unreadCount_${currentUser.uid}`]: 0, // Reset unread count to 0
              });
            }
          });
        }

        // ✅ Scroll to bottom after new message arrives
        setTimeout(
          () => flatListRef.current?.scrollToEnd({animated: true}),
          200,
        );
      });

    return () => unsubscribe();
  }, []);

  // ✅ Listen for Typing Indicator
  useEffect(() => {
    const chatRef = firestore().collection('chats').doc(chatId);

    const unsubscribe = chatRef.onSnapshot(doc => {
      if (doc.exists) {
        setIsTyping(doc.data()?.[`typing_${user.id}`] || false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Handle Typing with Delay to Reduce Firestore Writes
  const handleTyping = text => {
    setNewMessage(text);
    const chatRef = firestore().collection('chats').doc(chatId);

    if (typingTimeout) clearTimeout(typingTimeout);

    if (text.trim()) {
      chatRef.set({[`typing_${currentUser.uid}`]: true}, {merge: true});
    }

    setTypingTimeout(
      setTimeout(() => {
        chatRef.set({[`typing_${currentUser.uid}`]: false}, {merge: true});
      }, 1500), // 1.5 seconds delay before stopping "typing..."
    );
  };

  // ✅ Send Message
  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const messageData = {
      senderId: currentUser.uid,
      receiverId: user.id,
      text: newMessage,
      timestamp: firestore.FieldValue.serverTimestamp(),
      read: false, // Message starts as unread
    };

    const chatRef = firestore().collection('chats').doc(chatId);

    await chatRef.collection('messages').add(messageData);

    // ✅ Use Firestore transaction to update chat metadata
    await firestore().runTransaction(async transaction => {
      const chatDoc = await transaction.get(chatRef);
      if (chatDoc.exists) {
        const unreadCount = chatDoc.data()[`unreadCount_${user.id}`] || 0;
        transaction.update(chatRef, {
          lastMessage: newMessage,
          lastMessageTimestamp: firestore.FieldValue.serverTimestamp(),
          [`unreadCount_${user.id}`]: unreadCount + 1, // Increase unread count
          [`typing_${currentUser.uid}`]: false, // Stop typing indicator
          lastMessageSenderId: currentUser.uid, // ✅ Store sender ID for checkmarks
          [`lastMessageRead_${user.id}`]: false, // ✅ Message is unread for receiver
        });
      } else {
        transaction.set(chatRef, {
          lastMessage: newMessage,
          lastMessageTimestamp: firestore.FieldValue.serverTimestamp(),
          [`unreadCount_${user.id}`]: 1,
          [`typing_${currentUser.uid}`]: false,
          lastMessageSenderId: currentUser.uid,
          [`lastMessageRead_${user.id}`]: false,
        });
      }
    });

    setNewMessage('');
  };

  return (
    <View style={styles.container}>
      <Header
        profileImage={
          user?.imageUrl || 'https://randomuser.me/api/portraits/men/1.jpg'
        }
        isTyping={isTyping}
        userStatus={userStatus}
        user={user.name}
      />

      {/* ✅ Chat Messages */}
      <ChatMessages
        messages={messages}
        currentUser={currentUser}
        flatListRef={flatListRef}
      />

      {/* ✅ Input Field & Send Button */}
      <ChatInput
        newMessage={newMessage}
        handleTyping={handleTyping}
        sendMessage={sendMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 10, backgroundColor: '#f5f5f5'},
});

export default ChatScreen;
