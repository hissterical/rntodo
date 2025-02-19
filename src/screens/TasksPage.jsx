import React, { useState, useEffect } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native"; // Import useIsFocused
import { createGlobalStyles } from "../styles/GlobalStyles";

import TaskItem from "../components/TaskItem";
import TaskInput from "../components/TaskInput";
import addTask from "../utils/TaskUtils"; // Keep the utility function

import { useTheme } from "../context/ThemeContext";

export default function TasksPage() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const isFocused = useIsFocused(); // Get the focused state of the screen
  
  const {theme} = useTheme();
  const styles = createGlobalStyles(theme);

  const loadTasks = async () => {
    const savedTasks = await AsyncStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadTasks(); // Reload tasks whenever the screen gains focus
    }
  }, [isFocused]);

  useEffect(() => {
    AsyncStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    addTask(task, tasks, setTasks); // Use shared function
    setTask("");
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleTaskCompletion = (id) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  return (
    <View style={styles.container}>
      <TaskInput task={task} setTask={setTask} addTask={handleAddTask} />
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            toggleCompletion={toggleTaskCompletion}
            deleteTask={deleteTask}
            theme={theme}
          />
        )}
      />
    </View>
  );
}