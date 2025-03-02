import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Voice from '@react-native-voice/voice';
import { useTheme } from '../context/ThemeContext';
import { Svg, Path } from "react-native-svg";

// Audio Visualizer Component
const AudioVisualizer = ({ isActive }) => {
  const [bars, setBars] = useState(Array(12).fill(10));
  const animationRef = useRef(null);
  
  useEffect(() => {
    if (isActive) {
      const animate = () => {
        setBars(prevBars => 
          prevBars.map(() => Math.floor(Math.random() * 40) + 10)
        );
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setBars(Array(12).fill(10));
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);
  
  return (
    <View style={styles.visualizerContainer}>
      {bars.map((height, index) => (
        <View 
          key={index} 
          style={[
            styles.visualizerBar, 
            { 
              height, 
              backgroundColor: isActive ? '#4F46E5' : '#9CA3AF',
              marginHorizontal: 2
            }
          ]} 
        />
      ))}
    </View>
  );
};

// Microphone Button Component
const MicrophoneButton = ({ isListening, onPress, theme }) => {
  return (
    <TouchableOpacity
      style={[
        styles.micButton,
        theme === 'dark' ? styles.micButtonDark : styles.micButtonLight,
        isListening && styles.micButtonActive
      ]}
      onPress={onPress}
    >
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
          fill={isListening ? "#FFFFFF" : (theme === 'dark' ? "#FFFFFF" : "#4F46E5")}
        />
        <Path
          d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
          fill={isListening ? "#FFFFFF" : (theme === 'dark' ? "#FFFFFF" : "#4F46E5")}
        />
      </Svg>
    </TouchableOpacity>
  );
};

import { sendToLLM } from '../api/Gemini';

const SpeechToText = ({ onTextChange, theme }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const processingRef = useRef(false);
  
  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => {
      setIsListening(false);
      // This delay helps prevent multiple results being processed
      setTimeout(() => {
        processingRef.current = false;
      }, 500);
    };
   
    // Only use final results to prevent duplicates
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0 && !processingRef.current) {
        processingRef.current = true;
        const transcriptText = e.value[0];
        setText(transcriptText);
        if (onTextChange) onTextChange(transcriptText);
      }
    };
    
    return () => Voice.destroy().then(Voice.removeAllListeners);
  }, []);
  
  const toggleListening = async () => {
    try {
      if (isListening) {
        await Voice.stop();
        setIsListening(false);
      } else {
        setText('');
        processingRef.current = false; // Reset processing state
        setIsListening(true);
        await Voice.start('en-US');
      }
    } catch (error) {
      console.error(error);
      setIsListening(false);
    }
  };
  
  return (
    <View style={styles.speechContainer}>
      <Text style={[styles.speechTitle, theme === 'dark' && styles.textDark]}>
        Voice Assistant
      </Text>
      
      <AudioVisualizer isActive={isListening} />
      
      <Text style={[styles.speechStatus, theme === 'dark' && styles.textDark]}>
        {isListening ? 'Listening...' : 'Press the mic to speak'}
      </Text>
      
      <MicrophoneButton 
        isListening={isListening} 
        onPress={toggleListening} 
        theme={theme}
      />
      
      {text ? (
        <View style={styles.transcriptContainer}>
          <Text style={[styles.transcriptLabel, theme === 'dark' && styles.textDark]}>
            Transcript:
          </Text>
          <Text style={[styles.transcriptText, theme === 'dark' && styles.textDark]}>
            {text}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default function MainPage() {
  const [userMsg, setUserMsg] = useState("");
  const [tasks, setTasks] = useState([]);
  const [llmMessage, setLlmMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessedTranscript, setHasProcessedTranscript] = useState(false);
  const {theme} = useTheme();
  const transcriptRef = useRef(null);
  
  useEffect(() => {
    const loadTasks = async () => {
      const savedTasks = await AsyncStorage.getItem("tasks");
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    };
    loadTasks();
  }, []);
  
  const addTasksMain = async (tasksJson) => {
    const newTasks = tasksJson.addTasks.map((task) => ({
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      text: task.task,
      completed: false,
    }));
    
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, ...newTasks];
      AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
      return updatedTasks;
    });
    
    setLlmMessage(tasksJson.message);
    setHasProcessedTranscript(false); // Reset for next transcript
  };
  
  const onTranscriptChange = (transcript) => {
    // Only process if we haven't processed this transcript already
    if (transcript && transcript !== transcriptRef.current && !hasProcessedTranscript) {
      transcriptRef.current = transcript;
      setHasProcessedTranscript(true);
      sendToLLM(transcript, addTasksMain, setIsProcessing);
    }
  };
  
  return (
    <GestureHandlerRootView style={styles.rootContainer}>
      <View style={[styles.container, theme === 'dark' ? styles.containerDark : styles.containerLight]}>
        <SpeechToText onTextChange={onTranscriptChange} theme={theme}/>
        
        <View style={styles.divider} />
        
        <View style={styles.inputContainer}>
          <TextInput
            placeholderTextColor={theme === 'dark' ? '#71717A' : '#A1A1AA'}
            style={[styles.input, theme === 'dark' && styles.inputDark]}
            value={userMsg}
            onChangeText={(text) => setUserMsg(text)}
            placeholder="Type your message here..."
          />
          <TouchableOpacity
            style={[styles.sendButton, theme === 'dark' ? styles.sendButtonDark : styles.sendButtonLight]}
            disabled={isProcessing}
            onPress={() => {
              if (userMsg.trim()) {
                sendToLLM(userMsg, addTasksMain, setIsProcessing);
                setUserMsg("");
              }
            }}
          >
            {isProcessing ? (
              <ActivityIndicator color={theme === 'dark' ? '#FFFFFF' : '#FFFFFF'} />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {llmMessage ? (
          <View style={[styles.messageContainer, theme === 'dark' ? styles.messageContainerDark : styles.messageContainerLight]}>
            <Text style={[styles.llmMessage, theme === 'dark' && styles.llmMessageDark]}>
              {llmMessage}
            </Text>
          </View>
        ) : null}
        
        {tasks.length > 0 && (
          <View style={styles.tasksContainer}>
            <Text style={[styles.tasksTitle, theme === 'dark' && styles.textDark]}>
              Tasks ({tasks.length})
            </Text>
            <ScrollView style={styles.tasksList}>
              {tasks.map(task => (
                <View key={task.id} style={[styles.taskItem, theme === 'dark' ? styles.taskItemDark : styles.taskItemLight]}>
                  <Text style={[styles.taskText, theme === 'dark' && styles.textDark]}>
                    {task.text}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  containerLight: {
    backgroundColor: '#F9FAFB',
  },
  speechContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  speechTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1F2937',
  },
  speechStatus: {
    marginVertical: 12,
    fontSize: 16,
    color: '#4B5563',
  },
  visualizerContainer: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  visualizerBar: {
    width: 4,
    borderRadius: 2,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  micButtonLight: {
    backgroundColor: '#EEF2FF',
  },
  micButtonDark: {
    backgroundColor: '#374151',
  },
  micButtonActive: {
    backgroundColor: '#4F46E5',
  },
  transcriptContainer: {
    marginTop: 16,
    width: '100%',
    padding: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderRadius: 8,
  },
  transcriptLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1F2937',
  },
  transcriptText: {
    fontSize: 16,
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
    marginVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    fontSize: 16,
  },
  inputDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    color: '#F9FAFB',
  },
  sendButton: {
    marginLeft: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  sendButtonLight: {
    backgroundColor: '#4F46E5',
  },
  sendButtonDark: {
    backgroundColor: '#6366F1',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  messageContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  messageContainerLight: {
    backgroundColor: '#EEF2FF',
  },
  messageContainerDark: {
    backgroundColor: '#374151',
  },
  llmMessage: {
    fontSize: 16,
    color: '#1F2937',
  },
  llmMessageDark: {
    color: '#F9FAFB',
  },
  tasksContainer: {
    flex: 1,
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937',
  },
  tasksList: {
    flex: 1,
  },
  taskItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskItemLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  taskItemDark: {
    backgroundColor: '#374151',
  },
  taskText: {
    fontSize: 16,
    color: '#1F2937',
  },
  textDark: {
    color: '#F9FAFB',
  },
});

const styles = createStyles('light');