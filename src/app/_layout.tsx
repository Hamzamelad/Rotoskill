import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { C } from '@/constants/theme';
import { StoreProvider } from '@/lib/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="session/[drillId]"
          options={{ presentation: 'fullScreenModal', gestureEnabled: false, contentStyle: { backgroundColor: C.ink } }}
        />
        <Stack.Screen name="review/[repId]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="skill/new" />
        <Stack.Screen name="skill/[id]" />
      </Stack>
    </StoreProvider>
  );
}
