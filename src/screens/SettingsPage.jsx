// src/screens/SettingsPage.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SpeechToText from '../components/SpeechToText';

export const SettingsPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bettigns</Text>
      <SpeechToText />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});