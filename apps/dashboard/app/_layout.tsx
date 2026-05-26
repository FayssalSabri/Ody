import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { tokens } from '@odyssey/shared'

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <QueryClientProvider client={queryClient}>
        <View style={styles.root}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: styles.screen
            }}
          />
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: '100%'
  },
  root: {
    flex: 1,
    height: '100%',
    backgroundColor: tokens.colors.canvas,
    fontFamily: tokens.typography.families.sans
  },
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.canvas,
    fontFamily: tokens.typography.families.sans
  }
})
