import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackScreens } from '../../App';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Button, StyleSheet, View, Alert, Text, TouchableHighlight, TextStyle  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


//Params list that accept the login data and user data
type HomeProps = {
  route: {
    params?: {
      userData: any;
      loginData?: any;
    };
  };
  navigation: any; // Adjust this type based on the actual type of your navigation object
};

// Define the type for the 'Home' screen in the navigation stack
type Home = NativeStackScreenProps<StackScreens, 'Home'>;

// Define the Home component, which represents the main screen of the app
export default function Home({ route, navigation }: HomeProps) {
    // Functions to handle the button presses
    const handleLoginPress = useCallback(() => navigation.navigate("Login"), [navigation?.navigate]);
    const handleRegisterPress = useCallback(() => navigation.navigate('Register'), [navigation?.navigate]);
    const handleWebviewPress = useCallback(() => navigation.navigate('App'), [navigation?.navigate]);
    const [gameResult, setGameResult] = useState<string | null>(null);
   
    const [userData, setUserData] = useState(route.params?.userData);
    const [token, setToken] = useState<string | null>(null);
  
    useEffect(() => {
      setUserData(route.params?.userData);
    }, [route.params?.userData]);

    // Function to retrieve the user token from AsyncStorage
    const retrieveUserToken = async (): Promise<string | null> => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        return userToken;
      } catch (error) {
        console.error('Retrieve User Token Error:', error);
        return null;
      }
    };
  
    // Function to fetch user data using the provided token
    const fetchUserData = async (token: string | null): Promise<void> => {
      try {
        if (!token) {
          console.error('Invalid token');
          return;
        }
  
        // Set the .env. variable to use in local or development,
        // note, change to your own URL in .env.development
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  
        // Make Auth request
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
          console.log('Set user data:', data.data);
        } else {
          Alert.alert('Error', 'Failed to fetch user data');
        }
      } catch (error) {
        console.error('Fetch User Data Error:', error);
        Alert.alert('Error', 'An error occurred while fetching user data');
      }
    };
  
    // useEffect to fetch user token and user data on component mount
    useEffect(() => {
      const fetchData = async () => {
        try {
          // Retrieve the user token
          const userToken = await retrieveUserToken();
          setToken(userToken);
  
          // Fetch user data using the retrieved token
          await fetchUserData(userToken);
        } catch (error) {
          console.error('Fetch Data Error:', error);
        }
      };
  
      // Fetch data on component mount
      fetchData();
    }, []);

  // Function to handle the logout button press
  const handleLogout = async () => {
    try {
      // Clear the stored token and user data in AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
  
      //Set the .env. variable to use in local or development,
      //note, change to your own URL in .env.development
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  
      // Make a request to the backend logout endpoint
      const logoutResponse = await fetch(`${apiUrl}auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
  
      if (logoutResponse.ok) {
        // Reset the token state
        setToken(null);
  
        // Reset the user data state and login data
        navigation.setParams({ userData: undefined });
  
        // Reset the game result state to null
        setGameResult(null);
  
        // Navigate to the login screen
        navigation.navigate('Login');
      } else {
        // Handle unsuccessful logout
        Alert.alert('Error', 'Logout failed');
      }
    } catch (error) {
      // Handle errors, if any
      console.error('Logout Error:', error);
      Alert.alert('Error', 'An error occurred during logout');
    }
  };

    // Function to play the Rock, Paper, Scissors game
    type Choice = 'rock' | 'paper' | 'scissors';

    const playGame = (playerChoice: Choice) => {
      const choices: Choice[] = ['rock', 'paper', 'scissors'];
      const computerChoice: Choice = choices[Math.floor(Math.random() * choices.length)];
      let result;
  
      if (playerChoice === computerChoice) {
        result = "It's a tie!";
      } else if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
      ) {
        result = "You win!";
      } else {
        result = "You lose!";
      }
  
      setGameResult(`You chose ${playerChoice}, computer chose ${computerChoice}. ${result}`);
    };


  return (
    <View style={styles.container}>
      {userData ? (
        <View style={{ flex: 1, justifyContent: 'flex-end', width: '70%' }}>
          <Text style={styles.welcomeText}>Welcome, {userData.user.username}!</Text>
          <Text style={styles.welcomeText}>Are You Ready To Play?</Text>
          {/* Rock, Paper, Scissors Game Section */}
          <View>
            <TouchableHighlight
              style={styles.buttonGame}
              onPress={() => playGame('rock')}
            >
              <Text style={styles.buttonText}>Rock</Text>
            </TouchableHighlight>
            <TouchableHighlight
              style={styles.buttonGame}
              onPress={() => playGame('paper')}
            >
              <Text style={styles.buttonText}>Paper</Text>
            </TouchableHighlight>
            <TouchableHighlight
              style={styles.buttonGame}
              onPress={() => playGame('scissors')}
            >
              <Text style={styles.buttonText}>Scissors</Text>
            </TouchableHighlight>
            <Text style={styles.gameResult}>{gameResult}</Text>
          </View>

          <View style={styles.buttonContainer}>
  <TouchableHighlight
    style={styles.buttonProfile}
    onPress={() =>
      navigation.navigate('Profile', {
        userData: route.params?.userData,
      })
    }
  >
    <Text style={styles.buttonText}>Profile</Text>
  </TouchableHighlight>

  <TouchableHighlight
    style={styles.buttonWebViewLN}
    onPress={handleWebviewPress}
  >
    <Text style={styles.buttonText}>Webview</Text>
  </TouchableHighlight>
</View>

          <TouchableHighlight
            style={styles.buttonLogoutLN}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableHighlight>
        </View>
        
      ) : (
        <>
          <Text style={styles.homeText}>What would you like to do?</Text>
          <TouchableHighlight
            style={styles.buttonLogin}
            onPress={handleLoginPress}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.buttonSignUp}
            onPress={handleRegisterPress}
          >
            <Text style={styles.buttonText}>Create New Account</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.buttonWebView}
            onPress={handleWebviewPress}
          >
            <Text style={styles.buttonText}>Move to Webview!</Text>
          </TouchableHighlight>
        </>
      )}
        <StatusBar style="auto" />
    </View>
  );
}

// Styles for the Home component
const buttonStyles = {
  marginTop: 30,
  padding: 0, 
  borderRadius: 10,
  height: 70, 
  width: 300,
  
};

const buttonText: TextStyle = {
  color: 'white',
  textAlign: 'center',
  lineHeight: 80,
  fontSize: 20, 
  fontWeight: 'bold', 
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
  },
  buttonText: buttonText,
  welcomeText: {
    width: 300,
    fontSize: 30,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center', // Add textAlign: 'center' to center the text
  },
  homeText: {
    fontSize: 30,
    marginTop: 100,
    marginBottom: 70,
  },
  buttonLogin: {
    ...buttonStyles,
    backgroundColor: '#72a4d4',
  },
  buttonSignUp: {
    ...buttonStyles,
    backgroundColor: '#1e4264',
  },
  buttonContainer: {
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'space-between', // Add space between the buttons
    marginBottom: 20, // Adjust the spacing as needed
    marginTop: 'auto',
  },
  buttonWebViewLN: {
    ...buttonStyles,
    backgroundColor: '#c5c13e',
    marginTop: 10,
    width: 125,
    marginBottom:0,
    paddingHorizontal:15,
  },
  buttonProfile: {
    ...buttonStyles,
    backgroundColor: '#c5c13e',
    marginTop: 'auto',
    width: 125,
    marginBottom:0,
    paddingHorizontal:15,
  },
  buttonLogoutLN: {
    ...buttonStyles,
    backgroundColor: 'red',
    marginTop: 10,
    marginBottom:40,
  },
  buttonWebView: {
    ...buttonStyles,
    backgroundColor: '#c5c13e',
    marginTop: 'auto',
    marginBottom:40,
  },
  buttonLogout: {
    ...buttonStyles,
    backgroundColor: 'red',
    marginTop: 'auto',
    marginBottom:40,
  },
  buttonGame: {
    ...buttonStyles,
    backgroundColor: '#9acd32',
  },
  gameResult: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF0000',
    marginTop: 30,
  },
});