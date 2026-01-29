/**
 * Hatırlatıcı ve Yapılacaklar Sayfa Tipleri
 */

export type Priority = 'low' | 'medium' | 'high';
export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type SortBy = 'priority' | 'dueDate' | 'createdAt' | 'title';
export type Category = 'work' | 'personal' | 'school' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO string
  dueTime?: string; // "HH:mm"
  completed: boolean;
  priority: Priority;
  category?: Category;
  createdAt: string;
}

export interface Alarm {
  id: string;
  time: string; // "HH:mm"
  label: string;
  enabled: boolean;
  repeat: WeekDay[];
}

export interface ReminderState {
  tasks: Task[];
  alarms: Alarm[];
  selectedDate: string; // ISO date string
}
