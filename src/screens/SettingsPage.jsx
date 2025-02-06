import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createGlobalStyles } from '../styles/GlobalStyles';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const styles = createGlobalStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      <TouchableOpacity style={styles.button} onPress={toggleTheme}>
        <Text style={styles.buttonText}>
          Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export {SettingsPage};
