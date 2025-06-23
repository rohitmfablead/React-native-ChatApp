// ChatScreen.js
import React, {useEffect, useState, useRef} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Header from '../components/Header';
import ChatMessages from '../components/ChatMessages';
import ChatInput from '../components/ChatInput';
import {uploadFileToFirebase} from '../components/fileUpload';

const ChatScreen = ({route}) => {
  const {user} = route.params;
  const currentUser = auth().currentUser;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userStatus, setUserStatus] = useState(
    user.online ? 'Online' : 'Offline',
  );

  const chatId = [currentUser.uid, user.id].sort().join('_');
  const flatListRef = useRef(null);

  const handleFileSelect = async file => {
    try {
      setUploading(true); // Start loader
      const fileUrl = await uploadFileToFirebase(file);

      const messageData = {
        senderId: currentUser.uid,
        receiverId: user.id,
        fileUrl,
        timestamp: firestore.FieldValue.serverTimestamp(),
        read: false,
        type: 'file', // optional: helps distinguish file messages
      };

      const chatRef = firestore().collection('chats').doc(chatId);
      await chatRef.collection('messages').add(messageData);

      // Update chat metadata like last message
      await firestore().runTransaction(async transaction => {
        const chatDoc = await transaction.get(chatRef);
        if (chatDoc.exists) {
          const unreadCount = chatDoc.data()[`unreadCount_${user.id}`] || 0;
          transaction.update(chatRef, {
            lastMessage: '📎 File', // or show file name if you want
            lastMessageTimestamp: firestore.FieldValue.serverTimestamp(),
            [`unreadCount_${user.id}`]: unreadCount + 1,
            [`typing_${currentUser.uid}`]: false,
            lastMessageSenderId: currentUser.uid,
            [`lastMessageRead_${user.id}`]: false,
          });
        } else {
          transaction.set(chatRef, {
            lastMessage: '📎 File',
            lastMessageTimestamp: firestore.FieldValue.serverTimestamp(),
            [`unreadCount_${user.id}`]: 1,
            [`typing_${currentUser.uid}`]: false,
            lastMessageSenderId: currentUser.uid,
            [`lastMessageRead_${user.id}`]: false,
          });
        }
      });
    } catch (error) {
      console.error('Error sending file:', error);
    } finally {
      setUploading(false); // Stop loader
    }
  };

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
      }, 1500),
    );
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const messageData = {
      senderId: currentUser?.uid,
      receiverId: user?.id,
      text: newMessage,
      timestamp: firestore.FieldValue.serverTimestamp(),
      read: false,
    };

    const chatRef = firestore().collection('chats').doc(chatId);

    await chatRef.collection('messages').add(messageData);

    await firestore().runTransaction(async transaction => {
      const chatDoc = await transaction.get(chatRef);
      if (chatDoc.exists) {
        const unreadCount = chatDoc.data()[`unreadCount_${user.id}`] || 0;
        transaction.update(chatRef, {
          lastMessage: newMessage,
          lastMessageTimestamp: firestore.FieldValue.serverTimestamp(),
          [`unreadCount_${user.id}`]: unreadCount + 1,
          [`typing_${currentUser.uid}`]: false,
          lastMessageSenderId: currentUser.uid,
          [`lastMessageRead_${user.id}`]: false,
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

  useEffect(() => {
    const userRef = firestore().collection('users').doc(currentUser.uid);
    const chatRef = firestore().collection('chats').doc(chatId);
    userRef.set({online: true}, {merge: true});
    const unsubscribeUserStatus = firestore()
      .collection('users')
      .doc(user.id)
      .onSnapshot(doc => {
      const lastSeen = doc.data().lastSeen?.toDate();

if (doc.data().online) {
  setUserStatus('Online');
} else if (lastSeen) {
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);

  const isToday =
    now.toDateString() === lastSeenDate.toDateString();
  const isYesterday =
    new Date(now.setDate(now.getDate() - 1)).toDateString() === lastSeenDate.toDateString();

  let formattedTime = lastSeenDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    setUserStatus(`Last seen today at ${formattedTime}`);
  } else if (isYesterday) {
    setUserStatus(`Last seen yesterday at ${formattedTime}`);
  } else {
    let formattedDate = lastSeenDate.toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
    });
    setUserStatus(`Last seen on ${formattedDate} at ${formattedTime}`);
  }
} else {
  setUserStatus('Offline');
}

      });

    return () => {
      userRef.set(
        {online: false, lastSeen: firestore.FieldValue.serverTimestamp()},
        {merge: true},
      );
      unsubscribeUserStatus();
    };
  }, []);

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

        const unreadMessages = snapshot.docs.filter(
          doc => doc.data().receiverId === currentUser.uid && !doc.data().read,
        );

        if (unreadMessages.length > 0) {
          const batch = firestore().batch();
          unreadMessages.forEach(doc => {
            batch.update(doc.ref, {read: true});
          });
          await batch.commit();

          await firestore().runTransaction(async transaction => {
            const chatDoc = await transaction.get(chatRef);
            if (chatDoc.exists) {
              transaction.update(chatRef, {
                [`unreadCount_${currentUser.uid}`]: 0,
              });
            }
          });
        }

        setTimeout(
          () => flatListRef.current?.scrollToEnd({animated: true}),
          200,
        );
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const chatRef = firestore().collection('chats').doc(chatId);

    const unsubscribe = chatRef.onSnapshot(doc => {
      if (doc.exists) {
        setIsTyping(doc.data()?.[`typing_${user.id}`] || false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      {uploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <Header
        profileImage={
          user?.imageUrl || 'https://randomuser.me/api/portraits/men/1.jpg'
        }
        isTyping={isTyping}
        userStatus={userStatus}
        user={user.name}
      />
      <View style={{flex: 1, padding: 10}}>
        <ChatMessages
          messages={messages}
          currentUser={currentUser}
          flatListRef={flatListRef}
        />
      </View>
      <ChatInput
        newMessage={newMessage}
        handleTyping={handleTyping}
        sendMessage={sendMessage}
        onFileSelect={handleFileSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});

export default ChatScreen;
