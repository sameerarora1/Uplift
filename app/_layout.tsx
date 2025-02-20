import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRootNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const navigation = useRootNavigation(); // ✅ Safe navigation
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        console.log("Checking AsyncStorage for user_id...");
        const storedUserId = await AsyncStorage.getItem('user_id');
        console.log("Stored user_id:", storedUserId);

        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          console.log("No user found, redirecting to Auth...");
          // 🔥 Ensure navigation is mounted before navigating
          setTimeout(() => {
            if (navigation?.isReady()) {
              navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
            }
          }, 300);
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      }
      setIsLoading(false);
    };

    checkUserSession();
  }, [navigation]);

  if (isLoading) {
    console.log("App is still loading...");
    return null; // Prevents flashing and early navigation
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {userId ? (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="activity" options={{ headerShown: false }} />
          </>
        ) : (
          <Stack.Screen name="Auth" options={{ headerShown: false }} />
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
