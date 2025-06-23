import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import SelectDocs from './SelectDocs';
import SelectDocsModal from './SelectDocsModal'; // Import modal component
import FilePicker from './FilePicker';

const ChatInput = ({ newMessage, handleTyping, sendMessage, onFileSelect }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={handleTyping}
          placeholder="Type a message..."
        />
        <SelectDocs onOpen={() => setShowModal(true)} />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Icon name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Separated Modal Component */}
      <SelectDocsModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onFileSelect={onFileSelect}
      />
    </>
  );
};

export default ChatInput;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderColor: '#ccc',
    borderRadius: 5,
    margin: 10,
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 10,
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

