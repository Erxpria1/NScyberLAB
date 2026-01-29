import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task, Alarm, Priority, SortBy } from '@/types/reminder';

interface ReminderStore {
  // State
  tasks: Task[];
  alarms: Alarm[];
  selectedDate: string;
  sortBy: SortBy;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;

  // Alarm Actions
  addAlarm: (alarm: Omit<Alarm, 'id'>) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;

  // Date Actions
  setSelectedDate: (date: string) => void;
  setSortBy: (sortBy: SortBy) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set, get) => ({
      // Initial State
      tasks: [],
      alarms: [],
      selectedDate: new Date().toISOString().split('T')[0],
      sortBy: 'priority' as SortBy,

      // Task Actions
      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      toggleTaskComplete: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        }));
      },

      // Alarm Actions
      addAlarm: (alarm) => {
        const newAlarm: Alarm = {
          ...alarm,
          id: generateId(),
        };
        set((state) => ({ alarms: [...state.alarms, newAlarm] }));
      },

      updateAlarm: (id, updates) => {
        set((state) => ({
          alarms: state.alarms.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },

      deleteAlarm: (id) => {
        set((state) => ({
          alarms: state.alarms.filter((a) => a.id !== id),
        }));
      },

      toggleAlarm: (id) => {
        set((state) => ({
          alarms: state.alarms.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
          ),
        }));
      },

      // Date Actions
      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },

      setSortBy: (sortBy) => {
        set({ sortBy });
      },
    }),
    {
      name: 'reminder-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
