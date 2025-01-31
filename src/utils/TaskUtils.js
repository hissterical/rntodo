// utils/TaskUtils.js

const addTask = (taskText, tasks, setTasks) => {
  if (taskText.trim().length > 0) {
    const newTask = { id: Date.now().toString(), text: taskText, completed: false };
    setTasks(prevTasks => [...prevTasks, newTask]);
  }
};

export default addTask;
