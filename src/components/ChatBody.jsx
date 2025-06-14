import { View, Text, StyleSheet, ScrollView, Image,Modal, TouchableOpacity } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { Colors } from '../theme/Colors';
import VectorIcon from '../utils/VectorIcon';
import firestore from '@react-native-firebase/firestore';

const ChatBody = ({ chatId, userId }) => {
  const scrollViewRef = useRef();

  const [messages, setMessages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImagePress = (imageUri) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  console.log(messages)
  useEffect(() => {
    firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp')
      .onSnapshot(snapshot => {
        const allMessages = snapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() };
        });
        setMessages(allMessages);
      });
  }, []);


  const isToday = (someDate) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
           someDate.getMonth() === today.getMonth() &&
           someDate.getFullYear() === today.getFullYear();
  };

  const UserMessageView = ({ message, time, mediaUri }) => {
    return (
      <View style={styles.userContainer}>
        <View style={styles.userInnerContainer}>
        {mediaUri && (
            <TouchableOpacity onPress={() => handleImagePress(mediaUri)}>
              <Image source={{ uri: mediaUri }} style={styles.image} />
            </TouchableOpacity>
          )}
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.time}>{time}</Text>
          <VectorIcon
            name="check-double"
            type="FontAwesome5"
            color={Colors.blue}
            size={12}
            style={styles.doubleCheck}
          />
        </View>
      </View>
    );
  };
  
  const OtherUserMessageView = ({ message, time, mediaUri }) => {
    return (
      <View style={styles.otherUserContainer}>
        <View style={styles.otherUserInnerContainer}>
        {mediaUri && (
            <TouchableOpacity onPress={() => handleImagePress(mediaUri)}>
              <Image source={{ uri: mediaUri }} style={styles.image} />
            </TouchableOpacity>
          )}
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>
    );
  };
  

  const scrollToBottom = () => {
    scrollViewRef.current.scrollToEnd({ animated: true });
  };

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={scrollToBottom}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(item => (
          <>
            {item.sender === userId ? (
              <UserMessageView
                key={item.id}
                message={item.body}
                time={item.timestamp?.toDate().toDateString()}
                mediaUri={item?.mediaUri}
              />
            ) : (
              <OtherUserMessageView
                key={item.id}
                message={item.body}
                time={item.timestamp?.toDate().toDateString()}
                mediaUri={item?.mediaUri}
              />
            )}
          </>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <VectorIcon
              type="AntDesign"
              name="close"
              size={30}
              color={Colors.white}
            />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} />
        </View>
      </Modal>

      <View style={styles.scrollIcon}>
        <View style={styles.scrollDownArrow}>
          <VectorIcon
            name="angle-dobule-down"
            type="Fontisto"
            size={12}
            color={Colors.white}
            onPress={scrollToBottom}
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  otherUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  userInnerContainer: {
    backgroundColor: Colors.teal,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  otherUserInnerContainer: {
    backgroundColor: Colors.primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  message: {
    fontSize: 13,
    color: Colors.white,
  },
  time: {
    fontSize: 9,
    color: Colors.white,
    marginTop: 5,
  },
  doubleCheck: {
    marginTop: 5,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  scrollDownArrow: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 50,
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollIcon: {
    // flexDirection: 'row',
    // justifyContent: 'flex-end',
    position:'absolute',
    bottom:10,right:10
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
});


export default ChatBody;
