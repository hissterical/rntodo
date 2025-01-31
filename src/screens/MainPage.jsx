import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TextInput, Alert, Linking } from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   ExpoSpeechRecognitionModule,
//   useSpeechRecognitionEvent,
// } from "expo-speech-recognition";
import { sendToLLM } from "../api/Gemini";

export default function MainPage() {
  const [userMsg, setUserMsg] = useState("");
  const [tasks, setTasks] = useState([]);
  const [llmMessage, setLlmMessage] = useState("");
  // const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");

  // useSpeechRecognitionEvent("start", () => setRecognizing(true));
  // useSpeechRecognitionEvent("end", () => {
  //   setRecognizing(false);
  //   handleSTTComplete();
  // });
  // useSpeechRecognitionEvent("result", (event) => {
  //   setTranscript(event.results[0]?.transcript);
  // });
  // useSpeechRecognitionEvent("error", (event) => {
  //   console.log("GOT ERROR", event.error);
  // });

  // const handleStart = async () => {
  //   const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  
  //   if (!result.granted) {
  //     if (result.canAskAgain) {
  //       Alert.alert(
  //         "Permission Required",
  //         "We need access to the microphone to use speech recognition."
  //       );
  //     } else {
  //       Alert.alert(
  //         "Permission Denied",
  //         "Microphone access has been denied. Please enable it in your device settings.",
  //         [
  //           {
  //             text: "Cancel",
  //             style: "cancel",
  //           },
  //           {
  //             text: "Open Settings",
  //             onPress: () => Linking.openSettings(),
  //           },
  //         ]
  //       );
  //     }
  //     return;
  //   }
  
  //   ExpoSpeechRecognitionModule.start({
  //     lang: "en-US",
  //     interimResults: true,
  //     maxAlternatives: 1,
  //     continuous: false, // End session after a single recognition
  //     requiresOnDeviceRecognition: false,
  //     addsPunctuation: true, // Adds punctuation to the transcript
  //   });
  // };
  // const handleSTTComplete = () => {
  //   if (transcript.trim()) {
  //     sendToLLM(transcript);
  //     setTranscript("");
  //   }
  // };

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

  return (
    <View style={styles.container}>
      {/* <Text style={styles.text}>Welcome to the GAY Page!</Text>
      <Button
        title={!recognizing ? "Start" : "Stop"}
        onPress={() => {
          if (!recognizing) {
            handleStart();
          } else {
            ExpoSpeechRecognitionModule.stop();
          }
        }}
      />*/}

    <GestureHandlerRootView>
      <ScrollView>
        <Text>{transcript}</Text>
      </ScrollView>
      <TextInput
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

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    width: 300,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
  },
  llmMessage: {
    marginTop: 20,
    fontSize: 18,
    color: "gray",
    textAlign: "center",
  },
});