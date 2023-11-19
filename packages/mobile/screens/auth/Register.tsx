import React, { useCallback, useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackScreens } from '../../App';

// Define the props type for the Registration component using React Navigation
type RegistrationProps = NativeStackScreenProps<StackScreens, 'Register'>;

// Define the Registration component
export default function Register({ navigation }: RegistrationProps) {

  //Code to show secureTextEntry or not, only texted on one mobile device so might show 
  //up differently on other devices
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginPress = useCallback(() => navigation.navigate("Login"), [navigation?.navigate]);
  // Function to handle the registration process
  const handleRegister = async (username: string, password: string): Promise<void> => {
    try {

      //Set the .env. variable to use in local or development,
      //note, change to your own URL in .env.development
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      
      // Make the registration request
      const registrationResponse = await fetch(`${apiUrl}auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
        credentials: 'include',
      });

      // Parse the JSON response
      const responseData = await registrationResponse.json();
      
      // Check if the registration was successful
      if (registrationResponse.ok) {

        // Display a success message
        Alert.alert('Success', 'Registration successful');

        // Navigate to the login screen
        navigation.navigate('Login');
      } else {
        // Handle unsuccessful registration
        Alert.alert('Error', responseData.message);
      }
    } catch (error) {
      console.error('Registration Error:', error);
      Alert.alert('Error', 'An error occurred during registration');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
  
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={secureTextEntry}
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.toggleButtonContainer}>
        <Button title={secureTextEntry ? 'Show' : 'Hide'} onPress={toggleSecureTextEntry} />
      </View>

        <TouchableOpacity
          style={styles.buttonSignUp}
          onPress={() => handleRegister(username, password)}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonLogin}
          onPress={handleLoginPress}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles for the Registration component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Align at the top
    alignItems: 'center',
    paddingTop: 50, // Add padding at the top
    backgroundColor: '#ecf0f1',
  },
  formContainer: {
    width: '80%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10,
    padding: 10,
    backgroundColor: 'white',
  },
  buttonLogin: {
    backgroundColor: '#72a4d4',
    borderRadius: 8,
    marginVertical: 10,
    padding: 15,
    alignItems: 'center',
  },
  buttonSignUp: {
    backgroundColor: '#1e4264',
    borderRadius: 8,
    marginVertical: 10,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  toggleButtonContainer: {
    position: 'absolute',
    top:73,
    right: 10,
  },
});