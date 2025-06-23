import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/Ionicons';

const SelectDocsModal = ({visible, onClose, onFileSelect}) => {
  const handleGalleryPick = () => {
    onClose();
    launchImageLibrary({mediaType: 'mixed', quality: 1}, response => {
      if (!response.didCancel && response.assets?.[0]) {
        onFileSelect(response.assets[0]);
       
      }
    });
  };

  const handleCameraPick = () => {
    onClose();
    launchCamera({mediaType: 'photo', quality: 1}, response => {
      if (!response.didCancel && response.assets?.[0]) {
        onFileSelect(response.assets[0]);
        onClose();
      }
    });
  };

  const handleDocumentPick = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      onFileSelect(res);
      onClose();
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) console.warn(err);
    }
  };

  const handleLocationPick = () => {
    onFileSelect({type: 'location', data: 'Location Picker Placeholder'});
    onClose();
  };

  const handleContactPick = () => {
    onFileSelect({type: 'contact', data: 'Contact Picker Placeholder'});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* <Text style={styles.title}>Select an Option</Text> */}

          <ScrollView contentContainerStyle={styles.optionsWrapper}>
            <View style={styles.optionItem}>
              <TouchableOpacity
                style={styles.option}
                onPress={handleGalleryPick}>
                <Icon name="images" size={24} color="#007bff" />
              </TouchableOpacity>
              <Text style={styles.optionText}>Gallery</Text>
            </View>

            <View style={styles.optionItem}>
              <TouchableOpacity
                style={styles.option}
                onPress={handleCameraPick}>
                <Icon name="camera" size={24} color="#007bff" />
              </TouchableOpacity>
              <Text style={styles.optionText}>Camera</Text>
            </View>

            {/* <View style={styles.optionItem}>
              <TouchableOpacity
                style={styles.option}
                onPress={handleDocumentPick}>
                <Icon name="document" size={24} color="#007bff" />
              </TouchableOpacity>
              <Text style={styles.optionText}>Document</Text>
            </View>

            <View style={styles.optionItem}>
              <TouchableOpacity
                style={styles.option}
                onPress={handleLocationPick}>
                <Icon name="location" size={24} color="#007bff" />
              </TouchableOpacity>
              <Text style={styles.optionText}>Location</Text>
            </View>

            <View style={styles.optionItem}>
              <TouchableOpacity
                style={styles.option}
                onPress={handleContactPick}>
                <Icon name="person" size={24} color="#007bff" />
              </TouchableOpacity>
              <Text style={styles.optionText}>Contact</Text>
            </View> */}
          </ScrollView>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SelectDocsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '75%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // justifyContent: 'space-around',
  },
  optionItem: {
    alignItems: 'center',
    marginVertical: 10,
    width: 80,
  },
  option: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 12,
    color: '#007bff',
    marginTop: 6,
    textAlign: 'center',
  },
  close: {
    marginTop: 15,
    textAlign: 'right',
    color: '#ff3333',
    fontWeight: 'bold',
  },
});
