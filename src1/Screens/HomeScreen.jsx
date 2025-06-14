import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

import moment from 'moment';
import BaseHeader from '../Components/BaseHeader';
// import BaseHeader from '../Components/BaseHeader';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

const HomeScreen = () => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [rate, setRate] = useState('60');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(moment().toISOString());
  const [expandedUsers, setExpandedUsers] = useState({}); // Track expanded state for users
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // Added search query state
  const [name1, setName1] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [user, setUser] = useState(null);
// console.log(user)
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('usersData')
      .onSnapshot(
        snapshot => {
          const usersList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUsers(usersList);
          setLoading(false);
        },
        error => {
          console.error(error);
          setLoading(false);
        },
      );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().toISOString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const toggleExpand = userId => {
    setExpandedUsers(prevState => {
      const newState = {};
      Object.keys(prevState).forEach(id => {
        newState[id] = false; // Sabko collapse kar do
      });

      return {
        ...newState,
        [userId]: !prevState[userId], // Sirf ek user toggle ho
      };
    });
  };

  const addUser = async () => {
    if (name.trim() === '' || isNaN(rate) || rate.trim() === '') return;
    await firestore()
      .collection('usersData')
      .add({
        name,
        rate: parseFloat(rate) || 60,
        machines: [],
      });
    setName('');
    setRate('60');
    setModalVisible(false);
  };

  const deleteUser = async userId => {
    Alert.alert(
      'Confirm Delete', // Title
      'Kya aap sach me is user ko delete karna chahte hain?', // Message
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            await firestore().collection('usersData').doc(userId).delete();
          },
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  const startMachine = async userId => {
    // Check if any user has an active machine
    const snapshot = await firestore()
      .collection('usersData')
      .where('startTime', '!=', null)
      .get();

    if (!snapshot.empty) {
      Alert.alert(
        'Ek user already active hai. Pehle uska machine stop kijiye.',
      );
      return;
    }

    // Start machine if no other machine is running
    const startTime = moment().toISOString();
    await firestore().collection('usersData').doc(userId).update({startTime});
  };

  const stopMachine = async (userId, startTime, rate) => {
    const endTime = moment().toISOString();
    const duration = moment.duration(moment(endTime).diff(moment(startTime)));
    const totalHours = duration.asHours();
    const cost = totalHours * rate;

    await firestore()
      .collection('usersData')
      .doc(userId)
      .update({
        machines: firestore.FieldValue.arrayUnion({startTime, endTime, cost}),
        startTime: null,
      });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 33) {
          // 🟡 Android 13+ ke liye alag permissions
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
            // PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ]);
          return Object.values(granted).every(
            result => result === PermissionsAndroid.RESULTS.GRANTED,
          );
        } else {
          // 🔵 Android 12 aur niche ke liye
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn('Permission Error:', err);
        return false;
      }
    }
    return true;
  };

  // 📌 Generate PDF Function
  const generatePDF = async (users = []) => {
    try {
      // Ensure users is an array
      if (!Array.isArray(users) || users.length === 0) {
        Alert.alert('Error', 'No user data available for the report.');
        return;
      }

      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to save the PDF.',
        );
        return;
      }

      let userTableRows = users
        .map(
          (user, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${user.name || 'N/A'}</td>
          <td>₹${user.rate || 0}/hour</td>
          <td>${user.machines?.length || 0}</td>
          <td>₹${user.machines
            ?.reduce((acc, m) => acc + (m.cost || 0), 0)
            .toFixed(2)}</td>
        </tr>
      `,
        )
        .join('');

      let htmlContent = `
        <html>
        <head>
          <style>
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2 style="text-align: center;">User Report</h2>
          <table>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Rate</th>
              <th>Machines Used</th>
              <th>Total Cost</th>
            </tr>
            ${userTableRows}
          </table>
        </body>
        </html>
      `;

      let options = {
        html: htmlContent,
        fileName: 'User_Report',
        directory: 'Documents',
      };

      let file = await RNHTMLtoPDF.convert(options);
      Alert.alert(
        'PDF Generated',
        `Saved at: ${decodeURIComponent(file.filePath)}`,
      );
    } catch (error) {
      console.error('PDF Generation Error:', error);
      Alert.alert('Error', 'Failed to generate PDF.');
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const userDoc = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setUser(userData);
          setName1(userData.name);
          setImageUri(userData.imageUrl);
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      <BaseHeader
        username={name1}
        profileImageUrl={
          imageUri || 'https://randomuser.me/api/portraits/men/75.jpg'
        }
        // onNotificationPress={handleNotificationPress}
      />

      <TextInput
        style={styles.searchBar}
        placeholder="Search by name..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {loading ? (
        <ActivityIndicator size="large" color="blue" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View style={styles.userCard}>
              {/* <TouchableOpacity
              style={styles.floatingButton1}
              onPress={() => generatePDF(filteredUsers)}  
            >
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/337/337946.png',
                }}
                style={styles.floatingButtonImage}
              />
            </TouchableOpacity> */}
              <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                <Text style={styles.userName}>{item.name} ▼</Text>
              </TouchableOpacity>
              <Text style={styles.rateText}>₹{item.rate}/hour</Text>
              <View style={styles.buttonContainer}>
                {!item.startTime ? (
                  <Button
                    title="Start"
                    color="green"
                    onPress={() => startMachine(item.id)}
                  />
                ) : (
                  <View style={styles.activeMachine}>
                    <Button
                      title="Stop"
                      color="red"
                      onPress={() =>
                        stopMachine(item.id, item.startTime, item.rate)
                      }
                    />
                    <Text style={styles.runningTime}>
                      {moment
                        .utc(moment(currentTime).diff(moment(item.startTime)))
                        .format('HH:mm:ss')}
                    </Text>
                  </View>
                )}
                <Button
                  title="Delete"
                  color="gray"
                  onPress={() => deleteUser(item.id)}
                />
              </View>

              {expandedUsers[item.id] && (
                <>
                  {item.machines?.map((machine, index) => {
                    const durationMinutes = moment(machine.endTime).diff(
                      moment(machine.startTime),
                      'minutes',
                    );
                    const durationHours = Math.floor(durationMinutes / 60);
                    const remainingMinutes = durationMinutes % 60;

                    return (
                      <Text key={index} style={styles.machineInfo}>
                        ⏳ {moment(machine.startTime).format('hh:mm A')} - 🛑{' '}
                        {moment(machine.endTime).format('hh:mm A')} |{' '}
                        {moment(machine.startTime).format('DD/MM/YYYY')} | ₹
                        {machine.cost.toFixed(2)} | ⏱ {durationHours}h{' '}
                        {remainingMinutes}m
                      </Text>
                    );
                  })}
                  <Text style={styles.totalCostTime}>
                    Total Time:{' '}
                    {item.machines
                      .reduce(
                        (acc, machine) =>
                          acc +
                          moment
                            .duration(
                              moment(machine.endTime).diff(
                                moment(machine.startTime),
                              ),
                            )
                            .asHours(),
                        0,
                      )
                      .toFixed(2)}{' '}
                    hours | Total Cost: ₹
                    {item.machines
                      .reduce((acc, machine) => acc + machine.cost, 0)
                      .toFixed(2)}
                  </Text>
                </>
              )}
            </View>
          )}
        />
      )}
      {/* Floating Plus Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828817.png',
          }}
          style={styles.floatingButtonImage}
        />
      </TouchableOpacity>

      {/* Modal for Adding User */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add User</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter user name"
              style={styles.input}
            />
            <TextInput
              value={rate}
              onChangeText={setRate}
              placeholder="Enter hourly rate"
              keyboardType="numeric"
              style={styles.input}
            />
            <Button title="Add User" onPress={addUser} />
            <Button
              title="Cancel"
              color="red"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f9fa'},
  userCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  userName: {fontSize: 18, fontWeight: 'bold', marginBottom: 5},
  rateText: {fontSize: 16, color: 'blue', fontWeight: 'bold', marginBottom: 5},
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  activeMachine: {flexDirection: 'row', alignItems: 'center'},
  runningTime: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  machineInfo: {fontSize: 14, color: '#555', marginTop: 5},
  totalCostTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'blue',
    marginTop: 5,
  },
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
  floatingButton1: {
    // position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: 'blue',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonImage: {width: 40, height: 40},
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
  modalTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    borderColor: '#ccc',
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
});

export default HomeScreen;
