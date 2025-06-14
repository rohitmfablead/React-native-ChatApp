import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  PanResponder,
} from 'react-native';
import {GameEngine} from 'react-native-game-engine';
import Matter from 'matter-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  bone1,
  bone2,
  bone3,
  bone4,
  bone6,
  bone7,
  bone8,
  user,
  user1,
} from './assets';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('screen');

// Power-up images
const powerUpImage = 'https://example.com/powerup.png'; // Replace with actual URL

const dogImages = [
  {id: 1, uri: user},
  {id: 2, uri: user1},
  {id: 3, uri: user},
  {id: 4, uri: user1},
];

const boneImages = [
  {id: 1, image: bone1, score: 30},
  {id: 2, image: bone2, score: 500},
  {id: 3, image: bone3, score: 142},
  {id: 4, image: bone4, score: 85},
  {id: 5, image: bone6, score: 45},
  {id: 6, image: bone7, score: 25},
  {id: 7, image: bone8, score: 60},
  {id: 8, image: bone7, score: 25},
  {id: 9, image: bone1, score: 1000, bonus: true},
];

// Function to generate random positions for bones and power-ups
const getBoxPositions = (centerX, centerY, spacing, countPerSide) => {
  let positions = [];

  // Left column
  for (let i = 0; i < countPerSide; i++) {
    positions.push({
      x: centerX - spacing * 1.5,
      y: centerY - spacing * (countPerSide / 2) + i * spacing,
    });
  }

  // Right column
  for (let i = 0; i < countPerSide; i++) {
    positions.push({
      x: centerX + spacing, // Shift right
      y: centerY - spacing * (countPerSide / 2) + i * spacing,
    });
  }

  // Bottom row
  for (let i = 0; i < countPerSide; i++) {
    positions.push({
      x: centerX - (spacing * countPerSide) / 2 + i * spacing, // Shift further left
      y: centerY + spacing,
    });
  }

  return positions;
};

const createWorld = () => {
  let engine = Matter.Engine.create({enableSleeping: false});
  let world = engine.world;
  let dog = Matter.Bodies.circle(width / 2, height / 2, 40, {isStatic: true});

  let bonePositions = getBoxPositions(width / 1.7, height / 2, 100, 4);
  let bones = bonePositions.map((pos, index) => {
    const x = Math.max(40, Math.min(width - 40, pos.x - 30)); // Clamp x between 40 and screen width - 40
    const y = Math.max(40, Math.min(height - 40, pos.y - 150)); // Clamp y between 40 and screen height - 40

    return Matter.Bodies.circle(x, y, 10, {
      id: boneImages[index % boneImages.length].id,
    });
  });

  // Adding power-ups with similar clamping
  let powerUpPositions = getBoxPositions(width / 1.7, height / 2, 200, 2);
  let powerUps = powerUpPositions.map(pos => {
    const x = Math.max(40, Math.min(width - 40, pos.x - 30));
    const y = Math.max(40, Math.min(height - 40, pos.y - 150));
    return Matter.Bodies.circle(x, y, 15, {
      id: 'powerup',
      isSensor: true,
    });
  });

  Matter.World.add(world, [dog, ...bones, ...powerUps]);
  return {engine, world, dog, bones, powerUps};
};

const DogGame = () => {
  const [selectedDog, setSelectedDog] = useState(dogImages[0].uri);
  const [score, setScore] = useState(0);
  const [bonesState, setBonesState] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [highScore, setHighScore] = useState(0);
  const [completionPopupVisible, setCompletionPopupVisible] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('green');

  const gameEngine = useRef(null);
  const {engine, world, dog, bones, powerUps} = createWorld();

  useEffect(() => {
    setBonesState(bones);
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    loadHighScore();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) saveHighScore();
  }, [timeLeft]);

  const loadHighScore = async () => {
    const savedScore = await AsyncStorage.getItem('highScore1');
    if (savedScore) setHighScore(parseInt(savedScore, 10));
  };

  const saveHighScore = async () => {
    if (score > highScore) {
      setHighScore(score);
      await AsyncStorage.setItem('highScore1', score.toString());
    }
  };

  const eatBone = () => {
    if (bonesState.length > 0) {
      let randomIndex = Math.floor(Math.random() * bonesState.length);
      let boneToEat = bonesState[randomIndex];

      // Get bone's data
      let boneData = boneImages.find(b => b.id === boneToEat.id);
      let gainedScore = boneData ? boneData.score : 50;

      // Animate the bone to the dog's position
      animateBoneToDog(boneToEat, () => {
        setBonesState(prevBones =>
          prevBones.filter((_, i) => i !== randomIndex),
        );
        setScore(prev => prev + gainedScore);

        // If all bones are eaten, show completion popup
        if (bonesState.length === 1) {
          setTimeout(() => setCompletionPopupVisible(true), 500);
        }
      });
    }
  };

  // Function to animate the bone movement
  const animateBoneToDog = (bone, onComplete) => {
    const dogPosition = dog.position;
    const boneIndex = bonesState.findIndex(b => b.id === bone.id);

    if (boneIndex !== -1) {
      let interval = setInterval(() => {
        let xDiff = dogPosition.x - bone.position.x;
        let yDiff = dogPosition.y - bone.position.y;

        // Move the bone step by step
        Matter.Body.setPosition(bone, {
          x: bone.position.x + xDiff * 0.1,
          y: bone.position.y + yDiff * 0.1,
        });

        // If bone reaches the dog, stop animation
        if (Math.abs(xDiff) < 2 && Math.abs(yDiff) < 2) {
          clearInterval(interval);
          onComplete(); // Hide the bone and update the score
        }
      }, 16); // 60 FPS update
    }
  };

  const changeDog = newDog => {
    setSelectedDog(newDog);
  };

  const restartGame = () => {
    setScore(0);
    setBonesState(createWorld().bones);
    setTimeLeft(30);
    setCompletionPopupVisible(false);
    setBackgroundColor('green'); // Reset background color
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const x = gestureState.moveX - 40;
        const y = gestureState.moveY - 40;
        Matter.Body.setPosition(dog, {x, y});
      },
    }),
  ).current;

  return (
    <LinearGradient
      colors={['#ff9966', '#ff5e62']}
      style={[styles.container, {backgroundColor}]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          paddingVertical: 10,
          height: 100,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            color: '#fff',
            fontSize: 20,
            // fontFamily: Fonts.UbuntuBold,
          }}>
          Xpets
        </Text>
      </TouchableOpacity>
      <LinearGradient
        colors={['#34ebba', '#2a7bc4']} // Gradient colors
        style={styles.container1} // Apply to the main container
      >
        <GameEngine
          ref={gameEngine}
          style={styles.gameArea}
          entities={{
            physics: {engine, world},
            dog,
            bones: bonesState,
            powerUps,
          }}>
          <View
            style={{
              top: '2%',
              width: 100,
              height: 100,
              borderRadius: 50,
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'green',
            }}>
            <Image
              source={selectedDog}
              style={styles.dog}
              {...panResponder.panHandlers}
            />
          </View>
          {bonesState.map((bone, index) => {
            let boneData = boneImages.find(b => b.id === bone.id);
            return (
              <Image
                key={index}
                source={boneData ? boneData.image : bone1}
                style={[
                  styles.bone,
                  {
                    left: bone.position.x - 20,
                    top: bone.position.y - 20,
                  },
                ]}
              />
            );
          })}
          <View
            style={{
              width: '30%',
              height: 180,
              top: 20,
              // backgroundColor: 'red',
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 15,
            }}>
            <TouchableOpacity
              style={{
                width: 70,
                height: 30,
                borderRadius: 25,
                backgroundColor: 'blue', // पहला बटन नीला
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text>Score</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 70,
                height: 30,
                borderRadius: 25,
                backgroundColor: 'orange', // दूसरा बटन ऑरेंज
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text>Score</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 70,
                height: 30,
                borderRadius: 25,
                backgroundColor: 'purple', // तीसरा बटन पर्पल
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text>Score</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={eatBone}
            style={{
              position: 'absolute',
              bottom: 20,
              backgroundColor: 'red',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 10,
            }}>
            <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold'}}>
              Eat
            </Text>
          </TouchableOpacity>
        </GameEngine>
      </LinearGradient>

      <View style={styles.dogRowContainer}>
        {dogImages.map((dog, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => changeDog(dog.uri)}
            style={{
              borderWidth: 3,
              backgroundColor: 'green',
              borderColor: '#000',
              borderRadius: 10,
              borderColor: '#fff',
              width: width / 5,
              height: height / 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image source={dog.uri} style={styles.smallDog} />
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        transparent={true}
        visible={completionPopupVisible}
        animationType="fade">
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <Text style={styles.popupText}>🎉 All Bones Eaten! 🎉</Text>
            <Text style={styles.popupText}>Final Score: {score}</Text>
            <TouchableOpacity style={styles.popupButton} onPress={restartGame}>
              <Text style={styles.buttonText}>Restart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  gameArea: {
    width: width * 0.9,
    height: '50%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dog: {
    width: 75,
    height: 75,
    resizeMode: 'contain',
  },
  bone: {
    width: 40,
    height: 40,
    position: 'absolute',
  },
  powerUp: {
    width: 40,
    height: 40,
    position: 'absolute',
  },
  dogRowContainer: {
    flexDirection: 'row',
    width: '90%',
    paddingVertical: 10,
    marginVertical: 15,
    justifyContent: 'center',
    gap: 10,
  },
  smallDog: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  popup: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  popupText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  popupButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#34ebba',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreContainer: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'red',
    width: '30%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  scoreButton: {
    width: 70,
    height: 30,
    borderRadius: 25,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DogGame;
