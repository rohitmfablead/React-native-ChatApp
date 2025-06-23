// ChatMessages.js
import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
const {width, height} = Dimensions.get('window');

const ChatMessages = ({messages, currentUser, flatListRef}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState('');

  console.log('object', previewImageUri);

  const openPreview = uri => {
    setPreviewImageUri(uri);
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);
    setPreviewImageUri('');
  };

  const renderMessage = ({item}) => {
    const isCurrentUser = item.senderId === currentUser.uid;
    let statusIcon = '✓';

    if (item.read) {
      statusIcon = '✓✓';
    } else if (item.delivered) {
      statusIcon = '✓✓';
    }

    const timestamp = item.timestamp
      ? new Date(item.timestamp.toDate()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Sending...';

    const MessageContent = () => {
      const [imageLoaded, setImageLoaded] = useState(false);

      if (item.text) {
        return (
          <Text
            style={[
              styles.messageText,
              {color: isCurrentUser ? '#fff' : '#000'},
            ]}>
            {item.text}
          </Text>
        );
      } else if (item.fileUrl) {
        if (item.fileUrl.match(/\.(jpeg|jpg|gif|png)$/)) {
          return (
            <TouchableOpacity onPress={() => openPreview(item.fileUrl)}>
              <Image
                source={{uri: item.fileUrl}}
                style={[styles.image, !imageLoaded && styles.blurredImage]}
                resizeMode="contain"
                onLoadEnd={() => setImageLoaded(true)}
              />
            </TouchableOpacity>
          );
        } else {
          return (
            <TouchableOpacity onPress={() => openPreview(item.fileUrl)}>
              <Image style={styles.image} source={{uri: item.fileUrl}} />
            </TouchableOpacity>
          );
        }
      }
      return null;
    };

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.myMessage : styles.otherMessage,
        ]}>
        <MessageContent />
        <Text
          style={[styles.timestamp, {color: isCurrentUser ? '#fff' : '#000'}]}>
          {timestamp}
        </Text>
        {isCurrentUser && (
          <Text
            style={[styles.readIndicator, item.read && styles.seenIndicator]}>
            {statusIcon}
          </Text>
        )}
      </View>
    );
  };

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />

      {/* Fullscreen Image Preview Modal */}
      <Modal visible={previewVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <Pressable style={styles.modalCloseArea} onPress={closePreview}>
            <Image
              source={{uri: previewImageUri}}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 12,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
    borderTopRightRadius: 16,
    borderTopLeftRadius: 4,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  blurredImage: {
    opacity: 0.3,
  },
  timestamp: {
    fontSize: 12,
    color: '#eee',
    marginTop: 5,
    textAlign: 'right',
  },
  readIndicator: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'right',
  },
  seenIndicator: {
    color: '#4cd964', // iMessage-style green for "seen"
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: height,
  },
  modalCloseArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatMessages;
