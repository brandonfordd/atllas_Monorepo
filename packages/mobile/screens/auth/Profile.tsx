import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput,  Modal, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackScreens } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Profile = NativeStackScreenProps<StackScreens, 'Profile'>;

export default function UserProfile({}: Profile) {
    const [userData, setUserData] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { displayName: currentDisplayName, username, registered } = userData?.user || {};

    const [newDisplayName, setNewDisplayName] = useState('');
    const [displayName, setDisplayName] = useState(currentDisplayName);
    const [isEditing, setIsEditing] = useState(false);

    const handleChangeDisplayName = async () => {
        try {
            const userId = userData.user.id;
            const apiUrl = process.env.EXPO_PUBLIC_API_URL;

            // Make a request to the backend to update the display name
            const response = await fetch(`${apiUrl}auth/update-display-name`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    displayName: newDisplayName,
                }),
            });

            console.log('Request update displayname:', {
                apiUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    displayName: newDisplayName,
                }),
            });
            
            //This console log throws PrettyFormatPluginError because its too big,
            // seems to be a babel issue from what I researched
            // console.log('Response:', response);
            if (response.ok) {
                // Update the local state with the new display name
                setDisplayName(newDisplayName);

                // Reset the input field
                setNewDisplayName('');

                // Update userData in AsyncStorage
                const updatedUserData = {
                    ...userData,
                    user: {
                        ...userData.user,
                        displayName: newDisplayName,
                    },
                };

                //Store the new userData in the asyncStorage for the home page
                await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

                // Close the modal after changing the display name
                handleCloseEditModal();

                console.log('Display name updated successfully');
            } else {
                console.error('Failed to update display name');
            }
        } catch (error) {
            console.error('Error updating display name:', error);
        }
    };

    const retrieveUserToken = async (): Promise<string | null> => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            console.log('Logged token', userToken);
            return userToken;
        } catch (error) {
            console.error('Retrieve User Token Error:', error);
            return null;
        }
    };

    const fetchUserData = async (token: string | null): Promise<void> => {
        try {
            if (!token) {
                console.error('Invalid token');
                return;
            }

            const apiUrl = process.env.EXPO_PUBLIC_API_URL;

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
        } finally {
            // Set loading state to false after fetching data, whether successful or not
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userToken = await retrieveUserToken();
                setToken(userToken);

                await fetchUserData(userToken);
            } catch (error) {
                console.error('Fetch Data Error:', error);
            }
        };

        fetchData();
    }, []);

    // Log the userData when it's available or changed
    useEffect(() => {
        console.log('user data on user profile', userData);
    }, [userData]);

    // Update displayName when userData changes
    useEffect(() => {
        setDisplayName(currentDisplayName);
    }, [userData]);

    const handleOpenEditModal = () => {
        setIsEditing(true);
    };

    const handleCloseEditModal = () => {
        setIsEditing(false);
        setNewDisplayName('');
    };

    

    // Don't render until userData is available
        return (
            <View>
            {isLoading ? (
            <Text>Loading...</Text>
            ) : (
                <View>
                    <View style={styles.textBox}>
                        <Text style={styles.text}>Username: {username}</Text>
                    </View>
                    <View style={styles.textBox}>
                        <Text style={styles.text}>Registered Date & Time: {registered}</Text>
                    </View>
                    <View style={[styles.textBox, styles.displayNameContainer]}>
                        <Text style={styles.text}>Display Name: {displayName}</Text>
                        <View style={styles.changeButtonBox}>
                          <Button title="Change" color="#FFFFFF" onPress={handleOpenEditModal} />
                        </View>
                    </View>
                
                    <Modal visible={isEditing} animationType="slide" transparent={true}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="New Display Name"
                                    value={newDisplayName}
                                    onChangeText={(text) => setNewDisplayName(text)}
                                />
                                <View style={styles.buttonContainer}>
                                    <Button title="Save" color="#007BFF" onPress={handleChangeDisplayName} />
                                    <Button title="Cancel" color="#FF0000" onPress={handleCloseEditModal} />
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            )}
            </View>
        );
      }

      const styles = StyleSheet.create({
        container: {
          flex: 1,
          padding: 16,
        },
        textBox: {
          backgroundColor: 'lightgray',
          borderRadius: 10,
          marginBottom: 16,
          padding: 10,
          margin:10,
        },
        text: {
          fontSize: 25,
          marginTop: 8,
          marginBottom: 8,
          marginLeft: 16,
        },
        modalContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContent: {
          backgroundColor: 'white',
          padding: 20,
          width: '70%',
          borderRadius: 10,
          elevation: 5,
        },
        input: {
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 16,
          paddingHorizontal: 8,
        },
        displayNameContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        changeButtonBox: {
          backgroundColor: '#007BFF',
          borderRadius: 5,
          padding: 5,
        },
        buttonContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        },  
      });