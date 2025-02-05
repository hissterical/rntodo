// src/screens/SettingsPage.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SettingsPage = () => {
  return (
    <View style={styles.container}>
        <Text style={styles.title}> BETTINGS </Text>
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