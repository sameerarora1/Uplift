import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { activities, Activity } from '../activities';

type RootStackParamList = {
  Home: undefined;
  Activity: { activity: Activity };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // ✅ Function to Reset AsyncStorage
  const handleResetStorage = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Reset Complete', 'AsyncStorage has been cleared.');
      console.log('AsyncStorage cleared successfully');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      Alert.alert('Error', 'Failed to clear AsyncStorage.');
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/ramadan-background.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Ramadan Mubarak!</ThemedText>
        <HelloWave />
      </ThemedView>

      {activities.map((activity) => (
        <TouchableOpacity
          key={activity.title}
          onPress={() => navigation.navigate('activity', { activity })}
        >
          <ThemedView style={styles.activityContainer}>
            <ThemedText type="subtitle">{activity.title}</ThemedText>
            <ThemedText>{activity.subtitle}</ThemedText>
          </ThemedView>
        </TouchableOpacity>
      ))}

      {/* ✅ Reset AsyncStorage Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Reset AsyncStorage"
          onPress={handleResetStorage}
          buttonStyle={styles.button}
        />
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  activityContainer: {
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  reactLogo: {
    resizeMode: 'cover',
    height: '150%',
    width: '100%',
    bottom: -50,
    position: 'absolute',
  },
  buttonContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FF3B30', // Red color for reset
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
