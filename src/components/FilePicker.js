import React from 'react';
import {Button} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

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

  return <Button title="Pick a File" onPress={selectFile} />;
};

export default FilePicker;
