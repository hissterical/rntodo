import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TextInput, Alert, Linking } from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendToLLM } from "../api/Gemini";
import SpeechToText from "../components/SpeechToText";
import { useTheme } from '../context/ThemeContext';

export default function MainPage() {
  const [userMsg, setUserMsg] = useState("");
  const [tasks, setTasks] = useState([]);
  const [llmMessage, setLlmMessage] = useState("");
  const [transcript, setTranscript] = useState("");

  const {theme} = useTheme();
  const styles = createStyles(theme);

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
      id: Date.now().toString() + Math.random().toString(36).substring(7), // Unique ID
      text: task.task,
      completed: false,
    }));

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, ...newTasks];
      AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks)); // Persist tasks
      return updatedTasks;
    });

    setLlmMessage(tasksJson.message); // Update LLM message
  };

  const onTranscriptChange = (transcript) => { 
    setTranscript(transcript);
    sendToLLM(transcript, addTasksMain);
  }

  return (
    <View style={styles.container}>

      <SpeechToText onTextChange={onTranscriptChange} theme={theme}/>


    <GestureHandlerRootView>
      <ScrollView>
        <Text>{transcript}</Text>
      </ScrollView>
      <TextInput
        placeholderTextColor={theme === 'dark' ? '#71717A' : '#A1A1AA'}
        style={styles.input}
        value={userMsg}
        onChangeText={(text) => setUserMsg(text)}
        placeholder="Type your message here..."
      />
      <Button
        title="Run"
        onPress={() => {
          sendToLLM(userMsg, addTasksMain);
          setUserMsg("");
        }}
      />
      {llmMessage ? <Text style={styles.llmMessage}>{llmMessage}</Text> : null} 
      </GestureHandlerRootView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#2A2B2E' : '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: theme === 'dark' ? '#1A1B1E' : '#fff',
    color: theme === 'dark' ? '#fff' : '#000',
    width: 300,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme === 'dark' ? '#1A1B1E' : '#fff',
  },
  text: {
    fontSize: 24,
    color: theme === 'dark' ? '#fff' : '#000',
  },
  llmMessage: {
    marginTop: 20,
    fontSize: 18,
    color: theme === 'dark' ? '#A1A1AA' : 'gray',
    textAlign: "center",
  },
});