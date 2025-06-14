import storage from '@react-native-firebase/storage';

export const uploadFileToFirebase = async (file) => {
  const reference = storage().ref(file.fileName);
  const task = reference.putFile(file.uri);

  task.on('state_changed', taskSnapshot => {
    console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
  });

  try {
    await task;
    const url = await reference.getDownloadURL();
    return url;
  } catch (e) {
    console.error('Error uploading file:', e);
    throw e;
  }
};
