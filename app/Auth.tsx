import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Auth() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const allowedGenders = ['male', 'female'];

  useEffect(() => {
    const checkUserSession = async () => {
      const storedUserId = await AsyncStorage.getItem('user_id');
      if (storedUserId) {
        router.replace('/'); // Redirect to main screen if user exists
      }
    };
    checkUserSession();
  }, []);

  const handleSignup = async () => {
    if (!firstName || !lastName || !gender || !phone) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    if (!allowedGenders.includes(gender)) {
      Alert.alert('Invalid Gender', 'Please select a valid gender.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          gender,
          phone_number: phone,
          points: 0,
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      Alert.alert('Signup Error', error.message);
      setLoading(false);
      return;
    }

    await AsyncStorage.setItem('user_id', data.id);
    Alert.alert('Success', 'Account created successfully!');
    router.replace('/');
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Input label="First Name" value={firstName} onChangeText={setFirstName} />
      <Input label="Last Name" value={lastName} onChangeText={setLastName} />
      <Input label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <Picker
        selectedValue={gender}
        onValueChange={(itemValue) => setGender(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Gender" value="" />
        <Picker.Item label="Male" value="male" />
        <Picker.Item label="Female" value="female" />
      </Picker>

      <Button title="Sign Up" onPress={handleSignup} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  picker: {
    marginVertical: 10,
  },
});
