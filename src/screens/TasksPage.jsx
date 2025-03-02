import React, { useState, useEffect } from "react";
import { 
  FlatList, 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Animated, 
  Dimensions, 
  StatusBar,
  Platform,
  KeyboardAvoidingView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

// Task Input Component with improved styling
const TaskInput = ({ task, setTask, addTask, theme }) => {
  const inputRef = React.useRef(null);

  return (
    <View style={[styles.inputContainer, theme === 'dark' ? styles.darkInputContainer : styles.lightInputContainer]}>
      <TextInput
        ref={inputRef}
        style={[
          styles.input, 
          theme === 'dark' ? styles.darkInput : styles.lightInput
        ]}
        placeholder="Add a new task..."
        placeholderTextColor={theme === 'dark' ? '#888888' : '#AAAAAA'}
        value={task}
        onChangeText={setTask}
        onSubmitEditing={addTask}
        returnKeyType="done"
      />
      <TouchableOpacity 
        style={[styles.addButton, task.trim().length === 0 && styles.disabledButton]} 
        onPress={addTask}
        disabled={task.trim().length === 0}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

// Checkbox component
const Checkbox = ({ checked, onPress, theme }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.checkbox,
        checked ? 
          (theme === 'dark' ? styles.checkedDark : styles.checkedLight) : 
          (theme === 'dark' ? styles.uncheckedDark : styles.uncheckedLight)
      ]} 
      onPress={onPress}
    >
      {checked && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
};

// Animated Task Item with swipe-to-delete functionality
const TaskItem = ({ task, toggleCompletion, deleteTask, theme }) => {
  const checkboxAnimatedValue = useState(new Animated.Value(task.completed ? 1 : 0))[0];
  
  useEffect(() => {
    Animated.timing(checkboxAnimatedValue, {
      toValue: task.completed ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [task.completed]);

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });
    
    return (
      <TouchableOpacity 
        style={styles.deleteAction}
        onPress={() => deleteTask(task.id)}
      >
        <Animated.View
          style={[
            styles.deleteActionContent,
            {
              transform: [{ translateX: trans }],
            },
          ]}>
          <Text style={styles.deleteActionText}>Delete</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const isChecked = checkboxAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],  // Use numeric values for interpolation
    extrapolate: 'clamp'
  });

  const textOpacity = checkboxAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6]
  });

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <Animated.View 
        style={[
          styles.taskContainer, 
          theme === 'dark' ? styles.darkTaskContainer : styles.lightTaskContainer
        ]}
      >
        <Checkbox 
          checked={task.completed}
          onPress={() => toggleCompletion(task.id)}
          theme={theme}
        />
        
        <Animated.Text
  style={[
    styles.taskText,
    theme === 'dark' ? styles.darkTaskText : styles.lightTaskText,
    {
      // Use the underlying numeric value to determine the text decoration
      textDecorationLine: isChecked.__getValue() >= 0.5 ? 'line-through' : 'none',
      opacity: textOpacity
    }
  ]}
  numberOfLines={2}
>
          {task.text}
        </Animated.Text>
      </Animated.View>
    </Swipeable>
  );
};

// Helper function for adding tasks
const addTask = (taskText, tasks, setTasks) => {
  if (taskText.trim().length > 0) {
    const newTask = { 
      id: Date.now().toString(), 
      text: taskText.trim(), 
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  }
};

// Main component
export default function TasksPage() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const isFocused = useIsFocused();
  const { theme } = useTheme();
  const [completedCount, setCompletedCount] = useState(0);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem("tasks");
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
        updateCompletedCount(parsedTasks);
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadTasks();
    }
  }, [isFocused]);

  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks:", error);
      }
    };

    saveTasks();
    updateCompletedCount(tasks);
  }, [tasks]);

  const updateCompletedCount = (taskList) => {
    const completed = taskList.filter(task => task.completed).length;
    setCompletedCount(completed);
  };

  const handleAddTask = () => {
    addTask(task, tasks, setTasks);
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

  const deleteCompletedTasks = () => {
    if (completedCount > 0) {
      setTasks(tasks.filter(task => !task.completed));
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by completion status (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Then sort by creation date (newest first for each group)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={[
        styles.container, 
        theme === 'dark' ? styles.darkContainer : styles.lightContainer
      ]}>
        <StatusBar
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme === 'dark' ? '#121212' : '#FFFFFF'}
        />
        
        <View style={styles.header}>
          <Text style={[
            styles.title, 
            theme === 'dark' ? styles.darkTitle : styles.lightTitle
          ]}>
            My Tasks
          </Text>
          
          <View style={styles.statsContainer}>
            <Text style={[
              styles.statsText,
              theme === 'dark' ? styles.darkStatsText : styles.lightStatsText
            ]}>
              {completedCount} of {tasks.length} completed
            </Text>
            
            {completedCount > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={deleteCompletedTasks}
              >
                <Text style={styles.clearButtonText}>Clear completed</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TaskInput 
          task={task} 
          setTask={setTask} 
          addTask={handleAddTask} 
          theme={theme}
        />
        
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Text style={[
                styles.emptyIconText,
                theme === 'dark' ? { color: '#444444' } : { color: '#DDDDDD' }
              ]}>
                📝
              </Text>
            </View>
            <Text style={[
              styles.emptyText,
              theme === 'dark' ? styles.darkEmptyText : styles.lightEmptyText
            ]}>
              No tasks yet. Add a task to get started!
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem
                task={item}
                toggleCompletion={toggleTaskCompletion}
                deleteTask={deleteTask}
                theme={theme}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  lightContainer: {
    backgroundColor: '#F5F5F5',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  darkTitle: {
    color: '#FFFFFF',
  },
  lightTitle: {
    color: '#222222',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
  },
  darkStatsText: {
    color: '#BBBBBB',
  },
  lightStatsText: {
    color: '#777777',
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 87, 87, 0.1)',
  },
  clearButtonText: {
    color: '#FF5757',
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  darkInputContainer: {
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
  },
  lightInputContainer: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
  },
  input: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    borderRadius: 12,
  },
  darkInput: {
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
  },
  lightInput: {
    backgroundColor: '#FFFFFF',
    color: '#222222',
  },
  addButton: {
    backgroundColor: '#6200EE',
    borderRadius: 12,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  darkTaskContainer: {
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
  },
  lightTaskContainer: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  uncheckedLight: {
    borderColor: '#AAAAAA',
    backgroundColor: 'transparent',
  },
  uncheckedDark: {
    borderColor: '#777777',
    backgroundColor: 'transparent',
  },
  checkedLight: {
    borderColor: '#6200EE',
    backgroundColor: '#6200EE',
  },
  checkedDark: {
    borderColor: '#BB86FC',
    backgroundColor: '#BB86FC',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskText: {
    fontSize: 16,
    flex: 1,
  },
  darkTaskText: {
    color: '#FFFFFF',
  },
  lightTaskText: {
    color: '#222222',
  },
  deleteAction: {
    backgroundColor: '#FF5757',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteActionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconText: {
    fontSize: 70,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  darkEmptyText: {
    color: '#888888',
  },
  lightEmptyText: {
    color: '#999999',
  },
  listContent: {
    paddingBottom: 20,
  },
});