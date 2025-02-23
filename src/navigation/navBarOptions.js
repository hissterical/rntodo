import Icon from 'react-native-vector-icons/Ionicons';

const navBarOptions = (theme, {route}) => ({
  tabBarIcon: ({focused, color, size}) => {
    let iconName;

    if (route.name === 'Home') {
      iconName = focused ? 'home' : 'home-outline';
    } else if (route.name === 'Tasks') {
      iconName = focused ? 'list' : 'list-outline';
    } else if (route.name === 'Notes') {
      iconName = focused ? 'journal' : 'journal-outline';
    } else if (route.name === 'Settings') {
      iconName = focused ? 'settings' : 'settings-outline';
    }

    return <Icon name={iconName} size={size} color={color} />;
  },
  tabBarStyle: {
    backgroundColor: theme === 'dark' ? '#1A1B1E' : '#FFFFFF',
    borderTopColor: theme === 'dark' ? '#2A2B2E' : '#E5E5EA',
  },
  // Tab bar icon and label color
  tabBarActiveTintColor: theme === 'dark' ? '#FFFFFF' : '#007AFF',
  tabBarInactiveTintColor: theme === 'dark' ? '#71717A' : '#8E8E93',
  // Header style
  headerStyle: {
    backgroundColor: theme === 'dark' ? '#1A1B1E' : '#FFFFFF',
    borderBottomColor: theme === 'dark' ? '#2A2B2E' : '#E5E5EA',
    borderBottomWidth: 1,
  },
  // Header text color
  headerTintColor: theme === 'dark' ? '#FFFFFF' : '#000000',
});

export { navBarOptions };
