// SelectDocs.js
import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SelectDocs = ({ onOpen }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onOpen}>
      <Icon name="attach" size={22} color="#007bff" />
    </TouchableOpacity>
  );
};

export default SelectDocs;

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 5,
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
