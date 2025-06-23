import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

const FilePicker = ({onFileSelect}) => {
  const selectFile = () => {
    const options = {
      mediaType: 'mixed',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled file picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.assets && response.assets[0]) {
        const file = response.assets[0];
        onFileSelect(file);
      }
    });
  };

  return (
    <TouchableOpacity style={styles.button} onPress={selectFile}>
      <Icon name="attach" size={22} color="#007bff" />
    </TouchableOpacity>
  );
};

export default FilePicker;

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
