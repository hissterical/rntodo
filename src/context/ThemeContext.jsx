import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// da context 
const ThemeContext = createContext();


// 
const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme) {
                setTheme(savedTheme);
            }
        } catch (err) {
            console.error("THEMECONTEXTLOADINGERROR", err);
        }
    }

    useEffect(() => {
        loadTheme();    
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem('theme', newTheme);
        } catch (err) {
            console.error("THEMECONTEXTSAVINGERROR", err);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          {children}
        </ThemeContext.Provider>
      );
}

const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export { ThemeProvider, useTheme };