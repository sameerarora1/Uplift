import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, useColorScheme } from 'react-native';
import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LeaderboardScreen() {
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [leaderboardMode, setLeaderboardMode] = useState<'individual' | 'gender'>('individual');
  const [individualLeaderboard, setIndividualLeaderboard] = useState<{ first_name: string; last_name: string; points: number }[]>([]);
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
    const profileSubscription = supabase
      .channel('realtime-leaderboard')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => {
        fetchUserPoints();
        if (leaderboardMode === 'individual') fetchLeaderboard();
      })
      .subscribe();

    const leaderboardSubscription = supabase
      .channel('realtime-gender')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leaderboard' }, () => {
        if (leaderboardMode === 'gender') fetchLeaderboard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileSubscription);
      supabase.removeChannel(leaderboardSubscription);
    };
  }, [leaderboardMode]);

  const fetchUserId = async () => {
    const storedUserId = await AsyncStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  };

  const fetchUserPoints = async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('profiles').select('points').eq('id', userId).single();
    if (!error) setUserPoints(data?.points || 0);
  };

  const fetchLeaderboard = async () => {
    if (leaderboardMode === 'individual') {
      const { data, error } = await supabase.from('profiles').select('first_name, last_name, points').order('points', { ascending: false });
      if (!error) setIndividualLeaderboard(data || []);
    } else {
      const { data, error } = await supabase.from('leaderboard').select('male_points, female_points').single();
      if (!error) setGenderLeaderboard({ male: data.male_points, female: data.female_points });
    }
  };

  const maxPoints = (genderLeaderboard?.male || 0) + (genderLeaderboard?.female || 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#F8F8F8' }]}>
      <View style={styles.userPointsContainer}>
        <Text style={[styles.userPointsText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
          Your Points: {userPoints ?? '...'}
        </Text>
      </View>

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

      {leaderboardMode === 'individual' ? (
        <FlatList
          data={individualLeaderboard}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 80 }} // ✅ Adds padding so last item isn't hidden
          renderItem={({ item, index }) => (
            <View style={styles.leaderboardItem}>
              <Text style={[styles.rankText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>#{index + 1}</Text>
              <Text style={[styles.nameText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>{item.first_name + " " + item.last_name}</Text>
              <Text style={[styles.pointsText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>{item.points} pts</Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.genderLeaderboard}>
          <View style={styles.barContainer}>
            {/* Boys Bar */}
            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  styles.boysBar,
                  { height: maxPoints ? `${(genderLeaderboard?.male / maxPoints) * 100}%` : '10%' },
                ]}
              />
              <Text style={[styles.genderLabel, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>👦 Boys</Text>
              <Text style={[styles.genderPoints, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
                {genderLeaderboard?.male ?? '...'}
              </Text>
            </View>

            {/* Girls Bar */}
            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  styles.girlsBar,
                  { height: maxPoints ? `${(genderLeaderboard?.female / maxPoints) * 100}%` : '10%' },
                ]}
              />
              <Text style={[styles.genderLabel, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>👧 Girls</Text>
              <Text style={[styles.genderPoints, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
                {genderLeaderboard?.female ?? '...'}
              </Text>
            </View>
          </View>
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
  genderLeaderboard: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    flex: 1,
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: '70%',
    alignItems: 'flex-end',
  },
  barWrapper: {
    alignItems: 'center',
    width: 80,
  },
  bar: {
    width: 40,
    borderRadius: 10,
  },
  boysBar: {
    backgroundColor: '#007BFF',
  },
  girlsBar: {
    backgroundColor: '#FF69B4',
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  genderPoints: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 25
  },
  nameText: {
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 25
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 20
  },
});
