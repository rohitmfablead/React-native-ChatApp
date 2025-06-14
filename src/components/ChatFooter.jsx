import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import React, { useState } from 'react';
import VectorIcon from '../utils/VectorIcon';
import { Colors } from '../theme/Colors';
import firestore from '@react-native-firebase/firestore';

import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from 'react-native-image-resizer';

const ChatFooter = ({ userId, chatRef }) => {
  const [message, setMessage] = useState('');
  const [sendEnable, setSendEnable] = useState(false);
  const [mediaUri, setMediaUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const pickImage = async () => {
    try {
      const response = await ImagePicker.openPicker({
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });

      if (!response || response.didCancel) {
        return;
      }

      const compressedImage = await ImageResizer.createResizedImage(
        response.path,
        800, 
        600, 
        'JPEG', 
        80, 
      );
      setMediaUri(compressedImage.uri);
      setSendEnable(true);
    } catch (error) {
      console.log('ImagePicker Error: ', error);
    }
  };

  const onSend = () => {
    chatRef.collection('messages').add({
      body: message, 
      mediaUri: mediaUri, 
      sender: userId,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    setMediaUri(null);

    setMessage('');
    setSendEnable(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.mediaContainer} onPress={() => setModalVisible(true)}>
        {mediaUri && (
          <Image
            source={{ uri: mediaUri }}
            style={styles.mediaPreview}
          />
        )}
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <TextInput
          multiline
          placeholder="Message"
          placeholderTextColor={Colors.textGrey}
          onChangeText={(value) => {
            setMessage(value);
            setSendEnable(value.trim() !== '' || mediaUri !== null);
          }}
          style={styles.inputStyle}
          value={message}
        />
        <TouchableOpacity style={styles.attachmentButton} onPress={pickImage}>
          <VectorIcon
            type="FontAwesome"
            name="image"
            size={20}
            color={Colors.white}
            style={styles.iconStyle}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.sendButton}
        onPress={onSend}
        disabled={!sendEnable}
      >
        <VectorIcon
          type="MaterialCommunityIcons"
          name="send"
          size={25}
          color={Colors.white}
        />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <VectorIcon
              type="AntDesign"
              name="close"
              size={30}
              color={Colors.white}
            />
          </TouchableOpacity>
          <Image
            source={{ uri: mediaUri }}
            style={styles.fullScreenImage}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.black,
    paddingVertical: 12,
    paddingHorizontal: 5,
    flexDirection: 'row',
    // alignItems: 'center',
  },
  container1: {
    backgroundColor: Colors.black,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    // alignItems: 'center',
  },
  mediaContainer: {
    marginRight: 10,
  },
  mediaPreview: {
    width: 50,
    height: 50,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.primaryColor,
    borderRadius: 30,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 10,
  },
  attachmentButton: {
    marginLeft: 10,
    // padding: 10,
    // backgroundColor: 'red',
  },
  iconStyle: {
    marginRight: 5,
  },
  inputStyle: {
    flex: 1,
    fontSize: 17,
    color: Colors.white,
  },
  sendButton: {
    backgroundColor: Colors.teal,
    padding: 10,
    borderRadius: 50,
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

export default ChatFooter;
