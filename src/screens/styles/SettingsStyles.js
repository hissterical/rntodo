import { theme } from '../../styles/theme';
import {StyleSheet} from 'react-native';


export const createSettingsStyles = (mode) => 
    StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: theme[mode].colors.background,
        alignItems: 'center',
        backgroundColor: '#fff',
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme[mode].colors.text,
  
      },
      container: {
        flex: 1,
        backgroundColor: theme[mode].colors.background,
        padding: theme[mode].spacing.md,
      },
      text: {
        color: theme[mode].colors.text,
        fontSize: 16,
      },
      heading: {
        color: theme[mode].colors.text,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: theme[mode].spacing.md,
      },
      button: {
        backgroundColor: theme[mode].colors.primary,
        padding: theme[mode].spacing.md,
        borderRadius: 8,
        alignItems: 'center',
      },
      buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
      },
  });