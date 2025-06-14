// ChatMessages.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, Linking, FlatList, StyleSheet } from 'react-native';

const ChatMessages = ({ messages, currentUser, flatListRef }) => {
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === currentUser.uid;
    let statusIcon = '✓'; // Sent

    if (item.read) {
      statusIcon = '✓✓'; // Seen
    } else if (item.delivered) {
      statusIcon = '✓✓'; // Delivered but not seen
    }

    // Format the timestamp
    const timestamp = item.timestamp
      ? new Date(item.timestamp.toDate()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Sending...';

    const renderContent = () => {
      if (item.text) {
        return <Text style={styles.messageText}>{item.text}</Text>;
      } else if (item.fileUrl) {
        if (item.fileUrl.match(/\.(jpeg|jpg|gif|png)$/)) {
          return <Image source={{ uri: item.fileUrl }} style={styles.image} resizeMode="contain" />;
        } else {
          return (
            <TouchableOpacity onPress={() => Linking.openURL(item.fileUrl)}>
              {/* <Text style={styles.downloadText}>Download File</Text> */}
              <Image/>
            </TouchableOpacity>
          );
        }
      }
      return null;
    };

    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.myMessage : styles.otherMessage
      ]}>
        {renderContent()}
        <Text style={styles.timestamp}>{timestamp}</Text>
        {isCurrentUser && (
          <Text style={[
            styles.readIndicator,
            item.read && styles.seenIndicator
          ]}>
            {statusIcon}
          </Text>
        )}
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    maxWidth: '70%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ccc',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
  },
  downloadText: {
    color: 'blue',
  },
  timestamp: {
    fontSize: 12,
    color: '#ddd',
    marginTop: 2,
    textAlign: 'right',
  },
  readIndicator: {
    fontSize: 12,
    color: '#ddd',
    marginTop: 2,
    textAlign: 'right',
  },
  seenIndicator: {
    color: '#00ff00',
  },
});

export default ChatMessages;
