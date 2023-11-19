import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './screens/home/Home';
import WebView from './screens/webview/WebView';
import Login from './screens/auth/Login';
import Register from './screens/auth/Register';


// Defining the type for the stack screen props
export type StackScreens = {
  Home: {
     // 'loginData' is an optional property of any type to match data coming from login
    userData: any;
     // 'loginData' is an optional property of any type to match data coming from login
    loginData?: any;
  };
  Login: undefined
  Register:  undefined;
  App: undefined;
}

export const Stack = createNativeStackNavigator<StackScreens>();

// Main App component
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="App" component={WebView} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
