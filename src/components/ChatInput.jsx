// ChatInput.js
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FilePicker from './FilePicker';

const ChatInput = ({ newMessage, handleTyping, sendMessage, onFileSelect }) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={newMessage}
        onChangeText={handleTyping}
        placeholder="Type a message..."
      />
      <FilePicker onFileSelect={onFileSelect} />
      <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
        <Text style={{ color: '#fff' }}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatInput;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  sendButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
});
