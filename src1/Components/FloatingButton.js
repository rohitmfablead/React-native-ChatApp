import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';

const FloatingButton = ({ onPress, iconUri }) => {
  return (
    <TouchableOpacity style={styles.floatingButton} onPress={onPress}>
      <Image source={{ uri: iconUri }} style={styles.floatingButtonImage} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: 'blue',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonImage: { width: 40, height: 40 },
});

export default FloatingButton;
