import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Note module for reusability across other screens
const NotesModule = {
  saveNote: async (note) => {
    try {
      const existingNotes = await NotesModule.getNotes();
      
      // If editing an existing note
      if (note.id) {
        const updatedNotes = existingNotes.map(item => 
          item.id === note.id ? note : item
        );
        await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
        return updatedNotes;
      } 
      // If creating a new note
      else {
        const newNote = {
          ...note,
          id: Date.now().toString(),
          date: new Date().toISOString()
        };
        const updatedNotes = [...existingNotes, newNote];
        await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
        return updatedNotes;
      }
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  },
  
  getNotes: async () => {
    try {
      const notes = await AsyncStorage.getItem('notes');
      return notes ? JSON.parse(notes) : [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  },
  
  deleteNote: async (noteId) => {
    try {
      const existingNotes = await NotesModule.getNotes();
      const updatedNotes = existingNotes.filter(note => note.id !== noteId);
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      return updatedNotes;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
};

const NotesScreen = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();
  
  // Load notes on component mount
  useEffect(() => {
    loadNotes();
  }, []);
  
  const loadNotes = async () => {
    const fetchedNotes = await NotesModule.getNotes();
    setNotes(fetchedNotes);
  };
  
  const handleSaveNote = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Error', 'Title or content cannot be empty');
      return;
    }
    
    const noteToSave = {
      title,
      content,
      id: editingNote ? editingNote.id : null,
      date: editingNote ? editingNote.date : new Date().toISOString()
    };
    
    try {
      const updatedNotes = await NotesModule.saveNote(noteToSave);
      setNotes(updatedNotes);
      clearForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
    }
  };
  
  const handleDeleteNote = async (noteId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedNotes = await NotesModule.deleteNote(noteId);
              setNotes(updatedNotes);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note');
            }
          } 
        }
      ]
    );
  };
  
  const editNote = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setModalVisible(true);
  };
  
  const clearForm = () => {
    setTitle('');
    setContent('');
    setEditingNote(null);
    setModalVisible(false);
  };
  
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: theme === 'dark' ? '#121212' : '#F5F5F5',
      flex: 1,
    },
    headerText: {
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
    },
    searchInput: {
      backgroundColor: theme === 'dark' ? '#333333' : '#FFFFFF',
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
      borderColor: theme === 'dark' ? '#444444' : '#DDDDDD',
    },
    noteCard: {
      backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
      shadowColor: theme === 'dark' ? '#000000' : '#000000',
    },
    noteTitle: {
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
    },
    noteContent: {
      color: theme === 'dark' ? '#BBBBBB' : '#666666',
    },
    noteDate: {
      color: theme === 'dark' ? '#888888' : '#999999',
    },
    modalContainer: {
      backgroundColor: theme === 'dark' ? '#121212' : '#F5F5F5',
    },
    modalTitle: {
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
    },
    textInput: {
      backgroundColor: theme === 'dark' ? '#333333' : '#FFFFFF',
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
      borderColor: theme === 'dark' ? '#444444' : '#DDDDDD',
    },
    fab: {
      backgroundColor: theme === 'dark' ? '#BB86FC' : '#6200EE',
    },
    emptyText: {
      color: theme === 'dark' ? '#BBBBBB' : '#666666',
    }
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Text style={[styles.headerText, dynamicStyles.headerText]}>My Notes</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, dynamicStyles.searchInput]}
          placeholder="Search notes..."
          placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
            You don't have any notes yet. Tap + to create one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.noteCard, dynamicStyles.noteCard]} 
              onPress={() => editNote(item)}
            >
              <View style={styles.noteContent}>
                <Text style={[styles.noteTitle, dynamicStyles.noteTitle]} numberOfLines={1}>
                  {item.title || 'Untitled Note'}
                </Text>
                <Text style={[styles.notePreview, dynamicStyles.noteContent]} numberOfLines={2}>
                  {item.content}
                </Text>
                <Text style={[styles.noteDate, dynamicStyles.noteDate]}>
                  {formatDate(item.date)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteNote(item.id)}
              >
                <Icon name="delete" size={22} color={theme === 'dark' ? '#FF5252' : '#F44336'} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.notesList}
        />
      )}
      
      <TouchableOpacity
        style={[styles.fab, dynamicStyles.fab]}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          if (title.trim() || content.trim()) {
            Alert.alert(
              'Discard changes?',
              'You have unsaved changes. Are you sure you want to discard them?',
              [
                { text: 'Keep Editing', style: 'cancel' },
                { 
                  text: 'Discard', 
                  style: 'destructive', 
                  onPress: clearForm 
                }
              ]
            );
          } else {
            clearForm();
          }
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.modalContainer, dynamicStyles.modalContainer]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={clearForm} style={styles.modalButton}>
              <Icon name="close" size={24} color={theme === 'dark' ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>
              {editingNote ? 'Edit Note' : 'New Note'}
            </Text>
            <TouchableOpacity onPress={handleSaveNote} style={styles.modalButton}>
              <Icon name="check" size={24} color={theme === 'dark' ? '#BB86FC' : '#6200EE'} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={[styles.titleInput, dynamicStyles.textInput]}
            placeholder="Title"
            placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
            value={title}
            onChangeText={setTitle}
          />
          
          <TextInput
            style={[styles.contentInput, dynamicStyles.textInput]}
            placeholder="Type your note here..."
            placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchInput: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
  },
  notesList: {
    padding: 15,
  },
  noteCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notePreview: {
    fontSize: 14,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingLeft: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  modalButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleInput: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 15,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  }
});

export default NotesScreen;