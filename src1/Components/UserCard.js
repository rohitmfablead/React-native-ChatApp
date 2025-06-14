import React from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, Image } from 'react-native';
import moment from 'moment';

const UserCard = ({
  user,
  onToggleExpand,
  onStart,
  onStop,
  onDelete,
  isExpanded,
  currentTime,
}) => {
  return (
    <View style={styles.userCard}>
      <TouchableOpacity onPress={() => onToggleExpand(user.id)}>
        <Text style={styles.userName}>{user.name} ▼</Text>
      </TouchableOpacity>
      <Text style={styles.rateText}>₹{user.rate}/hour</Text>

      <View style={styles.buttonContainer}>
        {!user.startTime ? (
          <Button title="Start" color="green" onPress={() => onStart(user.id)} />
        ) : (
          <View style={styles.activeMachine}>
            <Button
              title="Stop"
              color="red"
              onPress={() => onStop(user.id, user.startTime, user.rate)}
            />
            <Text style={styles.runningTime}>
              {moment
                .utc(moment(currentTime).diff(moment(user.startTime)))
                .format('HH:mm:ss')}
            </Text>
          </View>
        )}
        <Button title="Delete" color="gray" onPress={() => onDelete(user.id)} />
      </View>

      {isExpanded && (
        <>
          {user.machines?.map((machine, index) => {
            const durationMinutes = moment(machine.endTime).diff(moment(machine.startTime), 'minutes');
            const durationHours = Math.floor(durationMinutes / 60);
            const remainingMinutes = durationMinutes % 60;

            return (
              <Text key={index} style={styles.machineInfo}>
                ⏳ {moment(machine.startTime).format('hh:mm A')} - 🛑 {moment(machine.endTime).format('hh:mm A')} | ₹
                {machine.cost.toFixed(2)} | ⏱ {durationHours}h {remainingMinutes}m
              </Text>
            );
          })}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  userName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  rateText: { fontSize: 16, color: 'blue', fontWeight: 'bold', marginBottom: 5 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  activeMachine: { flexDirection: 'row', alignItems: 'center' },
  runningTime: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  machineInfo: { fontSize: 14, color: '#555', marginTop: 5 },
});

export default UserCard;
