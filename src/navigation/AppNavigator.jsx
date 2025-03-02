import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainPage from '../screens/MainPage';
import TasksPage from '../screens/TasksPage';
import NotesScreen from '../screens/NotesPage';
import { SettingsPage } from '../screens/SettingsPage';
import { navBarOptions } from './navBarOptions';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  const { theme } = useTheme();  // Get the theme here

  return (
    <Tab.Navigator
      screenOptions={(props) => navBarOptions(theme, props)}  // Pass theme here
    >
      <Tab.Screen 
        name="Notes" 
        component={NotesScreen} 
        options={{ title: 'Notes' }}
      />
      <Tab.Screen 
        name="Home" 
        component={MainPage} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksPage} 
        options={{ title: 'Tasks' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsPage} 
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};
