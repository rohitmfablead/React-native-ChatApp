import {View, StyleSheet, Image, TouchableOpacity, Text} from 'react-native';
import React, { useState } from 'react';
import WhatsappLogo from '../assets/whatsapp-logo.png';
import {Colors} from '../theme/Colors';
import VectorIcon from '../utils/VectorIcon';

const Header = ({showMenu}) => {
  

  return (
    <View style={styles.container}>
      <Image source={WhatsappLogo} style={styles.logoStyle} />
      <View style={styles.headerIcons}>
        <VectorIcon
          type="Feather"
          name="camera"
          color={Colors.secondaryColor}
          size={22}
        />
        <VectorIcon
          type="Ionicons"
          name="search"
          color={Colors.secondaryColor}
          size={20}
          style={styles.iconStyle}
        />
        <TouchableOpacity onPress={showMenu}> 
          <VectorIcon
            type="Entypo"
            name="dots-three-vertical"
            color={Colors.secondaryColor}
            size={18}
          />
        </TouchableOpacity>
      </View>

     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryColor,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  logoStyle: {
    height: 25,
    width: 110,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconStyle: {
    marginHorizontal: 25,
  },
});

export default Header;
