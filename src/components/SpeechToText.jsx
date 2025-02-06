import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Voice from '@react-native-voice/voice';

const SpeechToText = ({ onTextChange, theme }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = (e) => {
      setText(e.value.join(' '));
      if (onTextChange) onTextChange(e.value.join(' '));
    };
    return () => Voice.destroy().then(Voice.removeAllListeners);
  }, []);

  const startListening = async () => {
    try {
      setText('');
      setIsListening(true);
      await Voice.start('en-US');
    } catch (error) {
      console.error(error);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.text, theme === 'dark' && styles.textDark]}>
        {text || 'Press the button and speak'}
      </Text>
      <Button title={isListening ? 'Stop' : 'Start'} onPress={isListening ? stopListening : startListening} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, marginBottom: 20, textAlign: 'center', color: 'black' }, // Default color
  textDark: { color: 'white' }, // Dark mode color
});

export default SpeechToText;
