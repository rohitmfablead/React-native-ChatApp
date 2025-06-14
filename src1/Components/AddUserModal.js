import React from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';

const AddUserModal = ({ visible, name, rate, onChangeName, onChangeRate, onAdd, onCancel }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add User</Text>
          <TextInput
            value={name}
            onChangeText={onChangeName}
            placeholder="Enter user name"
            style={styles.input}
          />
          <TextInput
            value={rate}
            onChangeText={onChangeRate}
            placeholder="Enter hourly rate"
            keyboardType="numeric"
            style={styles.input}
          />
          <Button title="Add User" onPress={onAdd} />
          <Button title="Cancel" color="red" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: 300,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    borderColor: '#ccc',
  },
});

export default AddUserModal;
