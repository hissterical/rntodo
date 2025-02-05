// src/navigation/AppNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import MainPage from '../screens/MainPage';
import TasksPage from '../screens/TasksPage';
import { SettingsPage } from '../screens/SettingsPage';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Tasks') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
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