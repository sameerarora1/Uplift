import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@rneui/themed';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Activity } from './activities';

// Define a mapping of image paths
const imageMap: { [key: string]: any } = {
  '@/assets/images/rcm.png': require('@/assets/images/rcm.png'),
  '@/assets/images/quran.png': require('@/assets/images/quran.png'),
  '@/assets/images/sadaqah.png': require('@/assets/images/sadaqah.png'),
  '@/assets/images/taraweeh.png': require('@/assets/images/taraweeh.png'),
};

type RootStackParamList = {
  Activity: { activity: Activity };
};

type ActivityScreenRouteProp = RouteProp<RootStackParamList, 'Activity'>;

export default function ActivityScreen() {
  const route = useRoute<ActivityScreenRouteProp>();
  const navigation = useNavigation();

  // Fallback if params are not passed
  const activity = route.params?.activity || {
    title: 'Unknown Activity',
    subtitle: 'No details available',
    pointValue: 0,
    imagePath: '@/assets/images/rcm.png',
  };

  // ✅ Function to Add Points to User Profile
  const handleCompleteActivity = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        Alert.alert("Error", "User not found. Please restart the app.");
        return;
      }

      // ✅ Fetch user's current points & gender
      const { data: user, error: fetchError } = await supabase
        .from('profiles')
        .select('first_name, points, gender')
        .eq('id', userId)
        .single();

      if (fetchError || !user) {
        console.error("Fetch Error:", fetchError);
        Alert.alert("Error", "Could not retrieve user data.");
        return;
      }

      console.log("User Data Before Update:", user);

      if (typeof user.points !== 'number') {
        console.error("Error: User points is not a number", user.points);
        Alert.alert("Error", "User points value is invalid.");
        return;
      }

      const newPoints = user.points + activity.pointValue;
      console.log("New Calculated Points:", newPoints);

      // ✅ Update user's individual points
      console.log(`Attempting to update user ${userId} (${typeof userId}) to ${newPoints} points`);


      const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ points: newPoints })
      .eq('id', String(userId)) // Ensure it's a string
      .select('*'); // Forces Supabase to return updated row
    
      console.log(`Just attempted to update user ${userId} (${typeof userId}) to ${newPoints} points`);

      if (updateError) {
        console.error("Profile Update Error:", updateError);
        Alert.alert("Error", `Could not update user points: ${updateError.message}`);
        return;
      }
      
      console.log("Updated Profile Response:", updatedProfile);
      
      

      // ✅ Fetch the updated user data again for verification
      const { data: refreshedUser, error: refreshError } = await supabase
        .from('profiles')
        .select('first_name, points')
        .eq('id', userId)
        .single();

      console.log(`Updating user ${userId} to ${newPoints} points`);


      if (refreshError) {
        console.error("Refresh Error:", refreshError);
      } else {
        console.log("Refreshed User Data (Post-Update):", refreshedUser);
      }

      // ✅ Update leaderboard points
      const gender = user.gender.toLowerCase();
      if (gender !== 'male' && gender !== 'female') {
        Alert.alert("Error", "Invalid gender.");
        return;
      }

      const genderColumn = gender === 'male' ? 'male_points' : 'female_points';

      // ✅ Use `rpc()` correctly to update leaderboard
      const { error: leaderboardError } = await supabase.rpc('increment_leaderboard_points', {
        column_name: genderColumn,
        points_to_add: activity.pointValue,
      });

      if (leaderboardError) {
        console.error("Leaderboard Update Error:", leaderboardError);
        Alert.alert("Error", "Could not update leaderboard points.");
        return;
      }

      console.log("Updated Leaderboard Successfully");
      Alert.alert("Success", `You earned ${activity.pointValue} points!`);
    } catch (error) {
      console.error("Unexpected Error Completing Activity:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Back Button in Top Left */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={48} color="#007BFF" />
      </TouchableOpacity>

      <Image style={styles.image} />
      <Image source={imageMap[activity.imagePath] || imageMap['@/assets/images/rcm.png']} style={styles.image} />
      <ThemedText type="title">{activity.title}</ThemedText>
      <ThemedText type="subtitle">{activity.subtitle}</ThemedText>
      <ThemedText>Point Value: {activity.pointValue}</ThemedText>

      {/* ✅ Button to Add Points */}
      <Button
        title="Complete Activity"
        onPress={handleCompleteActivity}
        buttonStyle={styles.button}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
