import {StatusBar} from 'expo-status-bar';
import {StyleSheet, View,  TextInput, Button, Alert, TouchableOpacity, Text, } from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreens } from '../../App';

// Define the props type for the Login component using React Navigation
type LoginProps = NativeStackScreenProps<StackScreens, 'Login'>;

// Login component using React Navigation props
export default function Login({ navigation }: LoginProps) {

  //Code to show secureTextEntry or not, only texted on one mobile device so might show 
  //up differently on other devices
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [_, setUserData] = useState(null);

  //Handle navigation back to register if misclick
  const handleRegisterPress = useCallback(() => navigation.navigate('Register'), [navigation?.navigate]);
  // Function to fetch user data using the stored token
  const fetchUserData = async (token: string): Promise<void> => {
    try {

      //Set the .env. variable to use in local or development,
      //note, change to your own URL in .env.development
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;

      //Make Auth request
      const response = await fetch(`${apiUrl}auth`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.data);
        console.log('Set user data :', data.data)
      } else {
        Alert.alert('Error', 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Fetch User Data Error:', error);
      Alert.alert('Error', 'An error occurred while fetching user data');
    }
  };

  // Function to handle login
  const handleLogin = async (username: string, password: string): Promise<void> => {
    try {
      
      //Set the .env. variable to use in local or development,
      //note, change to your own URL in .env.development
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;

      // Make the login request
      const loginResponse = await fetch(`${apiUrl}auth/login`, {
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
      const responseData = await loginResponse.json();

      //If the response is good store the users Token from loginResponse to loginData
      //Then store the token into the function AsyncStorage to be used on the scope
      if (loginResponse.ok) {

        // Save the token to AsyncStorage
        await AsyncStorage.setItem('userToken', responseData.data.token);

        console.log('User data from login:', responseData)
        
        // Fetch user data using the token
        fetchUserData(responseData.data.token);

        // Set user data and navigate to the home screen, passing user data
        setUserData(responseData.data);
        navigation.navigate('Home', {
          userData: responseData,
          loginData: responseData.data,
        });

      } else {
        // Handle unsuccessful login
        Alert.alert('Error', responseData.message);
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'An error occurred during login');
    }
  };
  
  return (
  <View style={styles.container}>
    <StatusBar style="auto" />

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
        style={styles.buttonLogin}
        onPress={() => handleLogin(username, password)}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonSignUp}
        onPress={handleRegisterPress}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  </View>
);
}

// Styles for the Login component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50, 
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