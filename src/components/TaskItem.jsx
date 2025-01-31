// TaskItem.js
import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

const TaskItem = ({ task, toggleCompletion, deleteTask }) => {
  return (
    <View style={styles.taskContainer}>
      <TouchableOpacity style={styles.completeButton} onPress={() => toggleCompletion(task.id)}>
        <Text style={styles.buttonText}>{task.completed ? "[X]" : "[   ]"}</Text>
      </TouchableOpacity>

      <Text style={[styles.task, task.completed && styles.completedTask]}>
        {task.text}
      </Text>

      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTask(task.id)}>
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  task: {
    fontSize: 18,
    flex: 1,
    color: '#333',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TaskItem;
