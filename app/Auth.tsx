import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  Text,
  Image,
  Platform,
  TouchableOpacity,
  ActionSheetIOS,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Button, Input } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import PhoneInput from 'react-native-phone-number-input';

export default function Auth() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const phoneInputRef = useRef(null);
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

  // ✅ Format Name Input (Trims spaces and capitalizes first letter)
  const formatName = (name: string) => {
    return name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
  };

  const handleSignup = async () => {
    const trimmedFirstName = formatName(firstName);
    const trimmedLastName = formatName(lastName);

    if (!trimmedFirstName || !trimmedLastName || !gender || !formattedPhone) {
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
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          gender,
          phone_number: formattedPhone,
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

  // ✅ Function to open Action Sheet for gender selection on iOS
  const openGenderPickerIOS = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Male', 'Female'],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) setGender('male');
        if (buttonIndex === 2) setGender('female');
      }
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Square Logo at the Top */}
        <Image source={require('@/assets/images/icon.png')} style={styles.logo} />

        {/* First Name Input */}
        <Input
          label="First Name"
          value={firstName}
          onChangeText={(text) => setFirstName(text.replace(/\s/g, ''))} // ✅ Removes spaces
          inputStyle={styles.inputText}
          labelStyle={styles.labelText}
        />

        {/* Last Name Input */}
        <Input
          label="Last Name"
          value={lastName}
          onChangeText={(text) => setLastName(text.replace(/\s/g, ''))} // ✅ Removes spaces
          inputStyle={styles.inputText}
          labelStyle={styles.labelText}
        />

        {/* ✅ Phone Number Input */}
        <Text style={styles.label}>Phone Number</Text>
        <PhoneInput
          ref={phoneInputRef}
          defaultValue={phone}
          defaultCode="US"
          layout="first"
          autoFocus={false}
          returnKeyType="done" // ✅ Allows "Done" button on iOS
          blurOnSubmit={true} // ✅ Allows dismissing keyboard on submit
          containerStyle={styles.phoneContainer}
          textContainerStyle={styles.textContainer}
          textInputStyle={{ color: '#000' }}
          onChangeFormattedText={(text) => {
            if (text.length <= 10) {
              setFormattedPhone(text);
            }
          }}
        />

        {/* Gender Header */}
        <Text style={styles.genderHeader}>Select Gender</Text>

        {/* ✅ Gender Picker for Android */}
        {Platform.OS === 'android' ? (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={styles.picker}
              mode="dropdown"
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
          </View>
        ) : (
          // ✅ iOS Custom Gender Picker (Opens Action Sheet)
          <TouchableOpacity style={styles.iosPicker} onPress={openGenderPickerIOS}>
            <Text style={styles.iosPickerText}>
              {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'Tap Here!'}
            </Text>
          </TouchableOpacity>
        )}

        <Button title="Sign Up" onPress={handleSignup} loading={loading} buttonStyle={styles.button} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF', // White background for light mode
  },
  logo: {
    width: 150, // Square size
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 10, // Slightly rounded corners for a modern look
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  labelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  genderHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  inputText: {
    fontSize: 16,
    color: '#000',
  },
  phoneContainer: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#F8F8F8',
    marginBottom: 20,
  },
  textContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingVertical: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#F8F8F8',
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  iosPicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    marginBottom: 20,
  },
  iosPickerText: {
    fontSize: 16,
    color: '#000',
  },
  button: {
    margin: 20,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    height: 50,
  },
});
