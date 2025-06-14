import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const ChatMessages = ({ messages, currentUser, flatListRef }) => {
  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={item => item.id}
      renderItem={({ item }) => {
        const isCurrentUser = item.senderId === currentUser.uid;
        let statusIcon = '✓'; // Sent

        if (item.read) {
          statusIcon = '✓✓'; // Seen
        } else if (item.delivered) {
          statusIcon = '✓✓'; // Delivered but not seen
        }

        return (
          <View style={isCurrentUser ? styles.myMessage : styles.otherMessage}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>
              {item.timestamp
                ? new Date(item.timestamp.toDate()).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Sending...'}
            </Text>
            {isCurrentUser && (
              <Text style={[styles.readIndicator, item.read && styles.seenIndicator]}>
                {statusIcon}
              </Text>
            )}
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    maxWidth: '70%',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    maxWidth: '70%',
  },
  messageText: { color: '#fff' },
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
    color: '#00ff00', // Green or blue for seen messages
  },
});

export default ChatMessages;
