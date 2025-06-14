import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';  // Import SafeAreaView
import HomeScreen from '../Screens/HomeScreen';
import ProfileScreen from '../Screens/ProfileScreen';

const TabBottomNavigation = () => {
  const [selectedTab, setSelectedTab] = useState('Home');
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Function to animate the tab indicator
  const handleTabPress = (tab, index) => {
    setSelectedTab(tab);
    Animated.timing(animatedValue, {
      toValue: index,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const tabWidth = 100; // Width of each tab
  const indicatorPosition = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, tabWidth, tabWidth * 2],
  });

  const renderScreen = () => {
    switch (selectedTab) {
      case 'Home':
        return <HomeScreen />;
      case 'Profile':
        return <ProfileScreen/>
      case 'Settings':
        return <Text style={styles.screenText}>Settings Screen</Text>;
      default:
        return <Text style={styles.screenText}>Home Screen</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.screenContainer}>
          {renderScreen()}
        </View>

        <View style={styles.tabBar}>
          <Animated.View
            style={[
              styles.indicator,
              { transform: [{ translateX: indicatorPosition }] },
            ]}
          />

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => handleTabPress('Home', 0)}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1946/1946488.png' }}
              style={styles.icon}
            />
            <Text style={selectedTab === 'Home' ? styles.activeText : styles.inactiveText}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => handleTabPress('Profile', 1)}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png' }}
              style={styles.icon}
            />
            <Text style={selectedTab === 'Profile' ? styles.activeText : styles.inactiveText}>
              Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => handleTabPress('Settings', 2)}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3524/3524630.png' }}
              style={styles.icon}
            />
            <Text style={selectedTab === 'Settings' ? styles.activeText : styles.inactiveText}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TabBottomNavigation;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  screenText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 10,
    position: 'relative',
  },
  tabButton: {
    alignItems: 'center',
    width: 100,
  },
  icon: {
    width: 24,
    height: 24,
  },
  activeText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#555',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 100,
    height: 4,
    backgroundColor: '#007BFF',
    borderRadius: 2,
  },
});
