import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { Canvas, Rect } from '@shopify/react-native-skia';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/utils/theme';
import { useReminderStore } from '@/store/useReminderStore';
import type { Task, Alarm, Priority, SortBy } from '@/types/reminder';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Türkçe gün isimleri
const DAYS_TR = ['PAZ', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CTS'];
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

// CRT Scanlines
const Scanlines: React.FC = () => {
  const lineCount = Math.ceil(SCREEN_HEIGHT / 4);
  try {
    return (
      <Canvas style={styles.scanlineCanvas}>
        {Array.from({ length: lineCount }).map((_, i) => (
          <Rect
            key={i}
            x={0}
            y={i * 4}
            width={SCREEN_WIDTH}
            height={2}
            color={Colors.crt.scanline}
          />
        ))}
      </Canvas>
    );
  } catch {
    return <View style={styles.scanlineFallback} />;
  }
};

// Status Bar
const TerminalStatusBar: React.FC<{ paddingTop: number }> = ({ paddingTop }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[styles.statusBar, { paddingTop }]}>
      <View style={styles.statusLeft}>
        <Text style={styles.statusText}>MOD: SİBER-ANA-SAYFA</Text>
        <Text style={styles.statusText}>DURUM: AKTİF</Text>
      </View>
      <View style={styles.statusCenter}>
        <Text style={styles.statusTime}>
          {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <View style={styles.statusRight}>
        <Text style={[styles.statusText, styles.modeText]}>NS-SİBER-LAB v1.0</Text>
      </View>
    </View>
  );
};

// Haftalık Takvim
interface WeekCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({ selectedDate, onSelectDate }) => {
  const today = new Date();
  const selected = new Date(selectedDate);
  
  // Haftanın günlerini al
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Pazar
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();
  
  return (
    <View style={styles.calendar}>
      <Text style={styles.calendarMonth}>
        {MONTHS_TR[today.getMonth()]} {today.getFullYear()}
      </Text>
      <View style={styles.calendarRow}>
        {weekDays.map((day, index) => {
          const dateStr = day.toISOString().split('T')[0];
          const isSelected = dateStr === selectedDate;
          const isToday = day.toDateString() === today.toDateString();
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarDay,
                isSelected && styles.calendarDaySelected,
                isToday && !isSelected && styles.calendarDayToday,
              ]}
              onPress={() => onSelectDate(dateStr)}
            >
              <Text style={[styles.calendarDayName, isSelected && styles.calendarTextSelected]}>
                {DAYS_TR[index]}
              </Text>
              <Text style={[styles.calendarDayNumber, isSelected && styles.calendarTextSelected]}>
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Countdown Timer
interface CountdownProps {
  targetDate: string;
  targetTime?: string;
  title: string;
}

const CountdownTimer: React.FC<CountdownProps> = ({ targetDate, targetTime, title }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate);
      if (targetTime) {
        const [hours, minutes] = targetTime.split(':');
        target.setHours(parseInt(hours), parseInt(minutes));
      }
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate, targetTime]);

  return (
    <View style={styles.countdown}>
      <Text style={styles.countdownTitle}>{title}</Text>
      <View style={styles.countdownRow}>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNumber}>{String(timeLeft.days).padStart(2, '0')}</Text>
          <Text style={styles.countdownLabel}>GÜN</Text>
        </View>
        <Text style={styles.countdownSeparator}>:</Text>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNumber}>{String(timeLeft.hours).padStart(2, '0')}</Text>
          <Text style={styles.countdownLabel}>SAAT</Text>
        </View>
        <Text style={styles.countdownSeparator}>:</Text>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNumber}>{String(timeLeft.minutes).padStart(2, '0')}</Text>
          <Text style={styles.countdownLabel}>DAK</Text>
        </View>
      </View>
    </View>
  );
};

// Görev Kartı
interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onEdit, onDelete }) => {
  const priorityColors = {
    low: Colors.gray[400],
    medium: Colors.amber.primary,
    high: '#ff6b6b',
  };

  return (
    <View style={[styles.taskItem, task.completed && styles.taskItemCompleted]}>
      <TouchableOpacity style={styles.taskCheckbox} onPress={onToggle}>
        <Text style={styles.taskCheckboxText}>
          {task.completed ? '[✓]' : '[ ]'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.taskContent} onPress={onEdit}>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
          {task.title}
        </Text>
        {task.dueDate && (
          <Text style={styles.taskDue}>
            ⏰ {new Date(task.dueDate).toLocaleDateString('tr-TR')}
            {task.dueTime && ` ${task.dueTime}`}
          </Text>
        )}
      </TouchableOpacity>
      <View style={[styles.taskPriority, { backgroundColor: priorityColors[task.priority] }]} />
      <TouchableOpacity style={styles.taskDelete} onPress={onDelete}>
        <Text style={styles.taskDeleteText}>[×]</Text>
      </TouchableOpacity>
    </View>
  );
};

// Alarm Kartı
interface AlarmItemProps {
  alarm: Alarm;
  onToggle: () => void;
  onDelete: () => void;
}

const AlarmItem: React.FC<AlarmItemProps> = ({ alarm, onToggle, onDelete }) => (
  <View style={[styles.alarmItem, !alarm.enabled && styles.alarmItemDisabled]}>
    <TouchableOpacity style={styles.alarmToggle} onPress={onToggle}>
      <Text style={styles.alarmToggleText}>
        {alarm.enabled ? '🔔' : '🔕'}
      </Text>
    </TouchableOpacity>
    <View style={styles.alarmContent}>
      <Text style={styles.alarmTime}>{alarm.time}</Text>
      <Text style={styles.alarmLabel}>{alarm.label}</Text>
    </View>
    <TouchableOpacity style={styles.alarmDelete} onPress={onDelete}>
      <Text style={styles.alarmDeleteText}>[×]</Text>
    </TouchableOpacity>
  </View>
);

// Görev Ekleme/Düzenleme Modal
interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, priority: Priority) => void;
  editTask?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ visible, onClose, onSave, editTask }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setPriority(editTask.priority);
    } else {
      setTitle('');
      setPriority('medium');
    }
  }, [editTask, visible]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim(), priority);
      setTitle('');
      setPriority('medium');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            ╔══════════════════════════╗{'\n'}
            ║  {editTask ? 'GÖREV DÜZENLE' : 'YENİ GÖREV EKLE'}  ║{'\n'}
            ╚══════════════════════════╝
          </Text>
          
          <TextInput
            style={styles.modalInput}
            placeholder="Görev başlığı..."
            placeholderTextColor={Colors.amber.dim}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
          
          <Text style={styles.modalLabel}>ÖNCELİK{'>'}</Text>
          <View style={styles.priorityRow}>
            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.priorityButton, priority === p && styles.priorityButtonActive]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.priorityButtonText, priority === p && styles.priorityTextActive]}>
                  {p === 'low' ? 'DÜŞÜK' : p === 'medium' ? 'ORTA' : 'YÜKSEK'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButtonCancel} onPress={onClose}>
              <Text style={styles.modalButtonText}>[İPTAL]</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonOk} onPress={handleSave}>
              <Text style={styles.modalButtonText}>{editTask ? '[KAYDET]' : '[EKLE]'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Ana Ekran
interface SupportScreenProps {
  onReturn: () => void;
}

export const SupportScreen: React.FC<SupportScreenProps> = ({ onReturn }) => {
  const insets = useSafeAreaInsets();
  const {
    tasks,
    alarms,
    selectedDate,
    sortBy,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    deleteAlarm,
    toggleAlarm,
    setSelectedDate,
    setSortBy,
  } = useReminderStore();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleReturn = () => {
    onReturn();
  };

  const handleSaveTask = (title: string, priority: Priority) => {
    if (editingTask) {
      updateTask(editingTask.id, { title, priority });
    } else {
      addTask({
        title,
        priority,
        completed: false,
        dueDate: selectedDate,
      });
    }
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  // Aktif (tamamlanmamış ve tarihi olan) görevleri bul
  const activeTasks = tasks.filter(t => !t.completed && t.dueDate);
  const nextTask = activeTasks.sort((a, b) => 
    new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
  )[0];

  // Sıralama fonksiyonu
  const sortTasks = (tasksToSort: Task[]): Task[] => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    return [...tasksToSort].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title, 'tr');
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  // Seçili güne ait görevler (sıralı)
  const dayTasks = sortTasks(tasks.filter(t => t.dueDate === selectedDate));

  // Sıralama seçenekleri
  const sortOptions: { key: SortBy; label: string }[] = [
    { key: 'priority', label: 'ÖNCELİK' },
    { key: 'dueDate', label: 'TARİH' },
    { key: 'title', label: 'BAŞLIK' },
    { key: 'createdAt', label: 'EKLENME' },
  ];

  return (
    <View style={styles.container}>
      <Scanlines />
      <TerminalStatusBar paddingTop={insets.top} />

      {/* ASCII Header */}
      <View style={styles.asciiHeader}>
        <Text style={styles.asciiHeaderText}>
          ╔══════════════════════════════════════╗{'\n'}
          ║       GÖREV YÖNETİCİSİ v1.0          ║{'\n'}
          ╚══════════════════════════════════════╝
        </Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleReturn}>
          <Text style={styles.headerButtonText}>[← GERİ]</Text>
        </TouchableOpacity>
        <Text style={styles.title}>GÖREV MERKEZİ</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => { setEditingTask(null); setShowTaskModal(true); }}>
          <Text style={styles.headerButtonText}>[+ EKLE]</Text>
        </TouchableOpacity>
      </View>

      {/* Haftalık Takvim */}
      <WeekCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      >
        {/* Aktif Görev Countdown */}
        {nextTask && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>┌─ AKTİF GÖREV ─────────────────────┐</Text>
            <CountdownTimer
              targetDate={nextTask.dueDate!}
              targetTime={nextTask.dueTime}
              title={nextTask.title}
            />
            <Text style={styles.sectionTitle}>└───────────────────────────────────┘</Text>
          </View>
        )}

        {/* Yapılacaklar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>┌─ YAPILACAKLAR ({dayTasks.length}) ──────────────┐</Text>
          
          {/* Sıralama Bar */}
          <View style={styles.sortBar}>
            <Text style={styles.sortLabel}>SIRALA{'>'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
              {sortOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.sortButton, sortBy === opt.key && styles.sortButtonActive]}
                  onPress={() => setSortBy(opt.key)}
                >
                  <Text style={[styles.sortButtonText, sortBy === opt.key && styles.sortButtonTextActive]}>
                    [{opt.label}]
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {dayTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Bu gün için görev yok.</Text>
              <Text style={styles.emptyText}>[+ EKLE] ile yeni görev ekleyin.</Text>
            </View>
          ) : (
            dayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => toggleTaskComplete(task.id)}
                onEdit={() => handleEditTask(task)}
                onDelete={() => {
                  Alert.alert('Sil', `"${task.title}" silinsin mi?`, [
                    { text: 'İptal', style: 'cancel' },
                    { text: 'Sil', style: 'destructive', onPress: () => deleteTask(task.id) },
                  ]);
                }}
              />
            ))
          )}
          
          <Text style={styles.sectionTitle}>└───────────────────────────────────┘</Text>
        </View>

        {/* Alarmlar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>┌─ ALARMLAR ({alarms.length}) ────────────────────┐</Text>
          
          {alarms.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Henüz alarm yok.</Text>
            </View>
          ) : (
            alarms.map((alarm) => (
              <AlarmItem
                key={alarm.id}
                alarm={alarm}
                onToggle={() => toggleAlarm(alarm.id)}
                onDelete={() => deleteAlarm(alarm.id)}
              />
            ))
          )}
          
          <Text style={styles.sectionTitle}>└───────────────────────────────────┘</Text>
        </View>
      </ScrollView>

      {/* Task Modal */}
      <TaskModal
        visible={showTaskModal}
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        editTask={editingTask}
      />

      {/* CRT Vignette */}
      <View style={styles.vignette} pointerEvents="none" />
    </View>
  );
};

// Alias for backwards compatibility
export const CyberHome = SupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  scanlineCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  scanlineFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.secondary,
    backgroundColor: Colors.gray[100],
  },
  statusLeft: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusRight: {},
  statusCenter: {
    flex: 1,
    alignItems: 'center',
  },
  statusTime: {
    fontFamily: Typography.family.mono,
    fontSize: 14,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  statusText: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.amber.primary,
  },
  modeText: {
    fontWeight: 'bold',
    color: Colors.amber.secondary,
  },
  asciiHeader: {
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
  },
  asciiHeaderText: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.amber.secondary,
    letterSpacing: -1,
    lineHeight: 12,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.gray[100],
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.dim,
  },
  headerButton: {
    backgroundColor: Colors.amber.bg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.amber.secondary,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  title: {
    fontFamily: Typography.family.mono,
    fontSize: 14,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  
  // Calendar
  calendar: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.dim,
  },
  calendarMonth: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.amber.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calendarDay: {
    alignItems: 'center',
    padding: Spacing.xs,
    minWidth: 40,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  calendarDaySelected: {
    backgroundColor: Colors.amber.bg,
    borderColor: Colors.amber.secondary,
  },
  calendarDayToday: {
    borderColor: Colors.amber.dim,
  },
  calendarDayName: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.gray[400],
  },
  calendarDayNumber: {
    fontFamily: Typography.family.mono,
    fontSize: 14,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  calendarTextSelected: {
    color: Colors.amber.secondary,
  },

  // Content
  content: {
    flex: 1,
    backgroundColor: Colors.gray[100],
  },
  section: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.family.mono,
    fontSize: 11,
    color: Colors.amber.secondary,
    lineHeight: 14,
  },

  // Countdown
  countdown: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.black,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
  },
  countdownTitle: {
    fontFamily: Typography.family.mono,
    fontSize: 14,
    color: Colors.amber.primary,
    marginBottom: Spacing.sm,
    fontWeight: 'bold',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownBox: {
    alignItems: 'center',
    backgroundColor: Colors.gray[200],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.amber.secondary,
    minWidth: 60,
  },
  countdownNumber: {
    fontFamily: Typography.family.mono,
    fontSize: 24,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  countdownLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.gray[400],
  },
  countdownSeparator: {
    fontFamily: Typography.family.mono,
    fontSize: 24,
    color: Colors.amber.secondary,
    marginHorizontal: Spacing.xs,
  },

  // Task
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    marginVertical: 2,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  taskItemCompleted: {
    opacity: 0.6,
    borderColor: Colors.gray[400],
  },
  taskCheckbox: {
    marginRight: Spacing.sm,
  },
  taskCheckboxText: {
    fontFamily: Typography.family.mono,
    fontSize: 14,
    color: Colors.amber.primary,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.amber.primary,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.gray[400],
  },
  taskDue: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.gray[400],
    marginTop: 2,
  },
  taskPriority: {
    width: 4,
    height: '100%',
    minHeight: 30,
    marginHorizontal: Spacing.xs,
  },
  taskDelete: {
    padding: Spacing.xs,
  },
  taskDeleteText: {
    fontFamily: Typography.family.mono,
    fontSize: 14,
    color: Colors.gray[400],
  },

  // Alarm
  alarmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    marginVertical: 2,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  alarmItemDisabled: {
    opacity: 0.5,
  },
  alarmToggle: {
    marginRight: Spacing.sm,
  },
  alarmToggleText: {
    fontSize: 18,
  },
  alarmContent: {
    flex: 1,
  },
  alarmTime: {
    fontFamily: Typography.family.mono,
    fontSize: 18,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  alarmLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 11,
    color: Colors.gray[400],
  },
  alarmDelete: {
    padding: Spacing.xs,
  },
  alarmDeleteText: {
    fontFamily: Typography.family.mono,
    fontSize: 14,
    color: Colors.gray[400],
  },

  // Empty State
  emptyState: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.amber.dim,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.black,
    borderWidth: 2,
    borderColor: Colors.amber.secondary,
    padding: Spacing.lg,
    width: '90%',
    maxWidth: 350,
  },
  modalTitle: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.amber.secondary,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: Spacing.md,
  },
  modalInput: {
    fontFamily: Typography.family.mono,
    fontSize: 14,
    color: Colors.amber.primary,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    height: 48,
  },
  modalLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.amber.secondary,
    marginBottom: Spacing.xs,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: Colors.amber.bg,
    borderColor: Colors.amber.secondary,
  },
  priorityButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.gray[400],
  },
  priorityTextActive: {
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.gray[200],
    borderWidth: 1,
    borderColor: Colors.gray[400],
    alignItems: 'center',
  },
  modalButtonOk: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.amber.bg,
    borderWidth: 1,
    borderColor: Colors.amber.secondary,
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },

  // Sort Bar
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.black,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
  },
  sortLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.amber.secondary,
    marginRight: Spacing.sm,
  },
  sortScroll: {
    flex: 1,
  },
  sortButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.xs,
  },
  sortButtonActive: {
    backgroundColor: Colors.amber.bg,
    borderWidth: 1,
    borderColor: Colors.amber.secondary,
  },
  sortButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.gray[400],
  },
  sortButtonTextActive: {
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },

  // Vignette
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 70,
  },
});
