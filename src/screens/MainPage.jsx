// src/screens/TasksPage.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default MainPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>GAY page</Text>
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