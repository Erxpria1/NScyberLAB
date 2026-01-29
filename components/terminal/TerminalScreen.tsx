import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTerminalStore, type ActiveScreen } from '@/store/useTerminalStore';
import { ControlTower } from './ControlTower';
import { ReactionScreen } from '@/components/reaction';
import { SupportScreen } from '@/components/support';
import { Colors, Typography, Spacing } from '@/utils/theme';
import { StatusBar } from 'expo-status-bar';
import { Canvas, Rect } from '@shopify/react-native-skia';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Scanline Component using Skia
const Scanlines: React.FC = () => {
  const lineCount = Math.ceil(SCREEN_HEIGHT / 4);

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
};

// Status Bar Component
interface TerminalStatusBarProps {
  paddingTop: number;
}

const TerminalStatusBar: React.FC<TerminalStatusBarProps> = ({ paddingTop }) => {
  const status = useTerminalStore((s) => s.status);

  return (
    <View style={[styles.statusBar, { paddingTop }]}>
      <View style={styles.statusLeft}>
        <Text style={styles.statusText}>MEM: {status.memory}%</Text>
        <Text style={styles.statusText}>BAT: {status.battery}%</Text>
        <Text style={styles.statusText}>CONN: {status.connection}</Text>
      </View>
      <View style={styles.statusRight}>
        <Text style={[styles.statusText, styles.modeText]}>NS-CYBER-LAB v1.0</Text>
      </View>
    </View>
  );
};

// Command History Item
const CommandItem: React.FC<{
  command: string;
  output?: string;
  timestamp: Date | string;
}> = ({ command, output, timestamp }) => {
  const timeStr = timestamp instanceof Date ? timestamp.toLocaleTimeString('tr-TR') : timestamp;

  return (
    <View style={styles.commandItem}>
      <Text style={styles.commandText}>
        <Text style={styles.prompt}>$ </Text>
        {command}
      </Text>
      {output && (
        <Text style={styles.outputText}>{output}</Text>
      )}
      <Text style={styles.timestampText}>{timeStr}</Text>
    </View>
  );
};

// Boot Sequence Component
const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const bootMessages = [
    'NS-CYBER-LAB OS v1.0',
    'Checking hardware...',
    'Loading kernel...',
    'Initializing math engine...',
    'Loading graphics modules...',
    'Mounting filesystem...',
    '',
    'SYSTEM READY',
  ];

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    bootMessages.forEach((msg, index) => {
      timeout = setTimeout(() => {
        setMessages((prev) => [...prev, msg]);
        setProgress(((index + 1) / bootMessages.length) * 100);

        if (index === bootMessages.length - 1) {
          setTimeout(onComplete, 800);
        }
      }, index * 400);
    });

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.bootContainer}>
      <View style={styles.bootContent}>
        {messages.map((msg, i) => (
          <Text key={i} style={styles.bootText}>{msg}</Text>
        ))}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
};

// Main Terminal Screen
export const TerminalScreen: React.FC = () => {
  const router = useRouter();
  const {
    commandHistory,
    currentInput,
    addCommand,
    setInput,
    clearHistory,
    isBooting,
    setBooting,
    controlTowerVisible,
    availableTabs,
    activeTabIndex,
    toggleControlTower,
    navigateTabUp,
    navigateTabDown,
    navigateTabLeft,
    navigateTabRight,
    selectActiveTab,
    activeScreen,
    setActiveScreen,
  } = useTerminalStore();
  const [cursorVisible, setCursorVisible] = useState(true);
  const [bootComplete, setBootComplete] = useState(false);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 500);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollViewRef.current && commandHistory.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [commandHistory]);

  const processCommand = (text: string) => {
    const cmd = text.trim().toUpperCase();
    const timestamp = new Date().toLocaleTimeString('tr-TR');

    switch (cmd) {
      case 'BEAM':
        addCommand(text, '>> BEAM MODULE INITIALIZED\n>> Enter beam parameters or type "beam help"');
        break;
      case 'TRUSS':
        addCommand(text, '>> TRUSS SOLVER READY\n>> Use node/add and member/add commands');
        break;
      case 'PDF':
      case 'LIBRARY':
        addCommand(text, '>> PDF LIBRARY ACCESS\n>> Opening library...');
        router.push('/library');
        break;
      case 'CALC':
        addCommand(text, '>> CALCULATOR MODE\n>> Type expression (e.g., "calc 2+2" or "calc x^2")\n>> LaTeX formulas supported');
        break;
      case '3D':
        addCommand(text, '>> 3D RENDERING ENGINE\n>> WebGL context: READY');
        break;
      case 'SUPPORT':
        addCommand(text, '>> SUPPORT MODULE INITIALIZED\n>> Opening documentation...');
        setActiveScreen('support');
        break;
      case 'REACTION':
        addCommand(text, '>> REACTION FORCES MODULE\n>> Opening simulation interface...');
        setActiveScreen('reaction');
        break;
      case 'HELP':
        addCommand(text,
          '>> AVAILABLE COMMANDS:\n' +
          '   BEAM    - Beam analysis module\n' +
          '   TRUSS   - Truss solver\n' +
          '   PDF     - Document library\n' +
          '   CALC    - Calculator & converter\n' +
          '   3D      - 3D visualization\n' +
          '   SUPPORT - Help & documentation\n' +
          '   REACTION- Force reaction calculator\n' +
          '   CLEAR   - Clear terminal\n' +
          '   STATUS  - System status'
        );
        break;
      case 'CLEAR':
        clearHistory();
        break;
      case 'STATUS':
        addCommand(text,
          '>> SYSTEM STATUS:\n' +
          '   Memory: 75%\n' +
          '   Storage: 2.4GB free\n' +
          '   Modules: LOADED\n' +
          '   Connection: ONLINE'
        );
        break;
      default:
        // Handle calc expressions: calc <expression>
        if (text.toLowerCase().startsWith('calc ')) {
          const expression = text.substring(5).trim();
          try {
            const { evaluate, format } = require('mathjs');
            const result = evaluate(expression);
            const latex = format(result, { latex: true, precision: 4 });
            addCommand(text,
              `>> Expression: ${expression}\n` +
              `>> Result: ${result}\n` +
              `>> LaTeX: ${latex}`
            );
          } catch (err) {
            addCommand(text, `>> Calculation error: ${(err as Error).message}\n>> Check expression syntax`);
          }
        } else if (text) {
          addCommand(text, `>> Unknown command: ${text}\n>> Type HELP for available commands`);
        }
    }
  };

  const handleSubmit = () => {
    if (currentInput.trim()) {
      processCommand(currentInput);
    }
  };

  const handleSelectTab = () => {
    const tab = selectActiveTab();
    processCommand(tab.toLowerCase());
  };

  if (!bootComplete) {
    return (
      <>
        <StatusBar style="light" />
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <BootSequence onComplete={() => setBootComplete(true)} />
        </View>
      </>
    );
  }

  // Show ReactionScreen when active
  if (activeScreen === 'reaction') {
    return (
      <>
        <StatusBar style="light" />
        <View style={styles.container}>
          {/* Back Button Header */}
          <View style={[styles.screenHeader, { paddingTop: insets.top }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setActiveScreen('terminal')}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← TERMINAL</Text>
            </TouchableOpacity>
            <Text style={styles.screenTitle}>REACTION FORCES</Text>
            <View style={styles.placeholder} />
          </View>
          <ReactionScreen />
        </View>
      </>
    );
  }

  // Show SupportScreen when active
  if (activeScreen === 'support') {
    return (
      <>
        <StatusBar style="light" />
        <SupportScreen onReturn={() => setActiveScreen('terminal')} />
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Scanlines />

        <TerminalStatusBar paddingTop={insets.top} />

        <ScrollView
          ref={scrollViewRef}
          style={styles.historyContainer}
          contentContainerStyle={styles.historyContent}
        >
          {commandHistory.map((item) => (
            <CommandItem
              key={item.id}
              command={item.command}
              output={item.output}
              timestamp={item.timestamp}
            />
          ))}
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + Spacing.sm }]}>
          <Text style={styles.prompt}>$ </Text>
          <TextInput
            style={styles.input}
            value={currentInput}
            onChangeText={setInput}
            onSubmitEditing={handleSubmit}
            placeholder="Enter command..."
            placeholderTextColor={Colors.amber.dim}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
          />
          <View style={[styles.cursor, { opacity: cursorVisible ? 1 : 0 }]} />
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleControlTower}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleIcon}>{controlTowerVisible ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>

        <ControlTower
          visible={controlTowerVisible}
          availableTabs={availableTabs}
          activeTabIndex={activeTabIndex}
          onUp={navigateTabUp}
          onDown={navigateTabDown}
          onLeft={navigateTabLeft}
          onRight={navigateTabRight}
          onEnter={handleSelectTab}
          onClose={toggleControlTower}
        />

        {/* CRT Vignette Effect */}
        <View style={styles.vignette} pointerEvents="none" />
      </View>
    </>
  );
};

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
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.dim,
  },
  statusLeft: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statusRight: {},
  statusText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.primary,
  },
  modeText: {
    fontWeight: 'bold',
  },
  historyContainer: {
    flex: 1,
  },
  historyContent: {
    padding: Spacing.sm,
  },
  commandItem: {
    marginBottom: Spacing.sm,
  },
  commandText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
  },
  prompt: {
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  outputText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.status.success,
    marginLeft: Spacing.md,
    marginTop: 2,
  },
  timestampText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[300],
    marginLeft: Spacing.md,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.amber.dim,
  },
  input: {
    flex: 1,
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    paddingVertical: 0,
  },
  cursor: {
    width: 8,
    height: Typography.sizes.sm + 2,
    backgroundColor: Colors.amber.secondary,
  },
  toggleButton: {
    width: 32,
    height: 32,
    marginLeft: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.amber.bg,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
  },
  toggleIcon: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.secondary,
  },
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 100,
  },
  bootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  bootContent: {
    marginBottom: Spacing.xl,
  },
  bootText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.amber.primary,
    marginBottom: 4,
  },
  progressContainer: {
    width: 200,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.amber.primary,
  },
  progressText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.primary,
    textAlign: 'right',
    marginTop: 4,
  },
  // Screen navigation header
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.secondary,
    backgroundColor: Colors.gray[100],
  },
  backButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.amber.bg,
    borderWidth: 1,
    borderColor: Colors.amber.secondary,
  },
  backButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  screenTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 80,
  },
});
