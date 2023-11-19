import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackScreens } from '../../App';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView as NativeWebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the 'WebView' component, which represents a web view screen in the app
export default function WebView({}: NativeStackScreenProps<StackScreens, 'App'>) {
  // Function to fetch the user token from AsyncStorage
  const fetchUserToken = async () => {
    try {
      // Fetch the userToken
      const userToken = await AsyncStorage.getItem('userToken');
      console.log('Webview userToken', userToken);
      return userToken;
    } catch (error) {
      console.error('Error fetching userToken:', error);
      return null;
    }
  };

   // UseEffect hook to fetch user token and set headers when the component mounts
  useEffect(() => {
    // Fetch the userToken and set the headers
    fetchUserToken().then(userToken => {
       // UseEffect hook to fetch user token and set headers when the component mounts
      const webViewHeaders = {
        Cookie: `SESSION_TOKEN=${userToken}`,
      };
      // Show headers in the console for debugging
      console.log('Webview Header', webViewHeaders);
    });
  }, []);

  return (
    <View style={styles.container}>
      <NativeWebView
        source={{uri: process.env.EXPO_PUBLIC_WEBAPP_ROOT as string}}
        javaScriptEnabled={true}
        thirdPartyCookiesEnabled={true}
        withCredentials={true}
      />
      <StatusBar style="auto" />
    </View>
  );
}

// Styles for the WebView component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});