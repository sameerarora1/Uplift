import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView, useColorScheme } from 'react-native';
import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function LeaderboardScreen() {
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [leaderboardMode, setLeaderboardMode] = useState<'individual' | 'gender'>('individual');
  const [individualLeaderboard, setIndividualLeaderboard] = useState<{ first_name: string; points: number }[]>([]);
  const [genderLeaderboard, setGenderLeaderboard] = useState<{ male: number; female: number } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserPoints();
      fetchLeaderboard();
    }
  }, [userId, leaderboardMode]);

  useEffect(() => {
    // ✅ Realtime subscription for profiles (individual points updates)
    const profileSubscription = supabase
      .channel('realtime-leaderboard')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('Profile Updated:', payload);
          fetchUserPoints(); // Refresh user's points
          if (leaderboardMode === 'individual') {
            fetchLeaderboard(); // Refresh individual leaderboard
          }
        }
      )
      .subscribe();

    // ✅ Realtime subscription for leaderboard (gender points updates)
    const leaderboardSubscription = supabase
      .channel('realtime-gender')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'leaderboard' },
        (payload) => {
          console.log('Leaderboard Updated:', payload);
          if (leaderboardMode === 'gender') {
            fetchLeaderboard(); // Refresh gender leaderboard
          }
        }
      )
      .subscribe();

    // ✅ Cleanup on unmount
    return () => {
      supabase.removeChannel(profileSubscription);
      supabase.removeChannel(leaderboardSubscription);
    };
  }, [leaderboardMode]);

  // ✅ Fetch User ID from AsyncStorage
  const fetchUserId = async () => {
    const storedUserId = await AsyncStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  };

  // ✅ Fetch User's Current Points
  const fetchUserPoints = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user points:', error);
    } else {
      setUserPoints(data?.points || 0);
    }
  };

  // ✅ Fetch Leaderboard Data Based on Mode
  const fetchLeaderboard = async () => {
    if (leaderboardMode === 'individual') {
      // 📌 Fetch All Profiles Ranked by Points
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, points')
        .order('points', { ascending: false });

      if (error) {
        console.error('Error fetching individual leaderboard:', error);
      } else {
        setIndividualLeaderboard(data || []);
      }
    } else {
      // 📌 Fetch Gender Points from `leaderboard`
      const { data, error } = await supabase
        .from('leaderboard')
        .select('male_points, female_points')
        .single();

      if (error) {
        console.error('Error fetching gender leaderboard:', error);
      } else {
        setGenderLeaderboard({ male: data.male_points, female: data.female_points });
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#F8F8F8' }]}>
      {/* ✅ User's Current Points inside SafeArea */}
      <View style={styles.userPointsContainer}>
        <ThemedText style={[styles.userPointsText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
          Your Points: {userPoints ?? '...'}
        </ThemedText>
      </View>

      {/* ✅ Toggle Pill for Switching Leaderboard Mode */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, leaderboardMode === 'individual' && styles.activeToggle]}
          onPress={() => setLeaderboardMode('individual')}
        >
          <Text style={[styles.toggleText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>Individual</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, leaderboardMode === 'gender' && styles.activeToggle]}
          onPress={() => setLeaderboardMode('gender')}
        >
          <Text style={[styles.toggleText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>Gender</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Leaderboard Content Based on Selected Mode */}
      {leaderboardMode === 'individual' ? (
        // 📌 Individual Leaderboard (List of Users)
        <FlatList
          data={individualLeaderboard}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.leaderboardItem}>
              <Text style={[styles.rankText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>#{index + 1}</Text>
              <Text style={[styles.nameText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>{item.first_name}</Text>
              <Text style={[styles.pointsText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>{item.points} pts</Text>
            </View>
          )}
        />
      ) : (
        // 📌 Gender Leaderboard (Total Points)
        <View style={styles.genderLeaderboard}>
          <Text style={[styles.genderText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
            👦 Boys: {genderLeaderboard?.male ?? '...'}
          </Text>
          <Text style={[styles.genderText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
            👧 Girls: {genderLeaderboard?.female ?? '...'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  userPointsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  userPointsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#ccc',
  },
  activeToggle: {
    backgroundColor: '#007BFF',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  genderLeaderboard: {
    marginTop: 20,
    alignItems: 'center',
  },
  genderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

});

