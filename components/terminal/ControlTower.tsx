import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors, Typography, Spacing } from '@/utils/theme';
import { useThemeStore } from '@/store/useThemeStore';
import { RetroDpad, RetroButton, RetroStatusBar } from '@/components/retro';

interface ControlTowerProps {
  visible: boolean;
  availableTabs: readonly string[];
  activeTabIndex: number;
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  onEnter: () => void;
  onClose: () => void;
}

export const ControlTower: React.FC<ControlTowerProps> = ({
  visible,
  availableTabs,
  activeTabIndex,
  onUp,
  onDown,
  onLeft,
  onRight,
  onEnter,
  onClose,
}) => {
  const [buttonAnim] = React.useState(new Animated.Value(0));
  const { mode } = useThemeStore();
  const isRetroMode = mode === 'retro';

  const animateButton = () => {
    buttonAnim.setValue(0);
    Animated.timing(buttonAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start(() => buttonAnim.setValue(0));
  };

  const handlePress = (action: () => void) => {
    animateButton();
    action();
  };

  const renderTabRow = () => {
    return availableTabs.map((tab, index) => {
      const isActive = index === activeTabIndex;
      return (
        <Text
          key={tab}
          style={[
            styles.tabText,
            isActive && styles.tabTextActive,
          ]}
        >
          {tab}
        </Text>
      );
    });
  };

  if (!visible) return null;

  // Retro mode render
  if (isRetroMode) {
    const handleRetroDirection = (direction: 'up' | 'down' | 'left' | 'right' | null) => {
      switch (direction) {
        case 'up': onUp(); break;
        case 'down': onDown(); break;
        case 'left': onLeft(); break;
        case 'right': onRight(); break;
      }
    };

    return (
      <View style={[styles.container, styles.retroContainer]}>
        {/* Tab Selection Display */}
        <View style={styles.tabDisplay}>
          <Text style={[styles.navLabel, styles.retroNavLabel]}>{'>>>'} NAVIGATE:</Text>
          <View style={styles.tabRow}>
            {availableTabs.map((tab, index) => {
              const isActive = index === activeTabIndex;
              return (
                <Text
                  key={tab}
                  style={[
                    styles.tabText,
                    styles.retroTabText,
                    isActive && styles.tabTextActive,
                    isActive && styles.retroTabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              );
            })}
          </View>
        </View>

        {/* Retro Status Bar */}
        <View style={styles.retroStatusBar}>
          <RetroStatusBar showLoad={false} />
        </View>

        {/* D-Pad Controls */}
        <View style={styles.dPadContainer}>
          <RetroDpad
            size={100}
            onDirection={handleRetroDirection}
            onRelease={() => {}}
          />

          {/* Action Buttons */}
          <View style={styles.retroActions}>
            <RetroButton type="start" onPress={onEnter} />
            <TouchableOpacity
              style={[styles.closeButton, styles.retroCloseButton]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.closeButtonText, styles.retroCloseButtonText]}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Cyber mode render
  return (
    <View style={styles.container}>
      {/* Tab Selection Display */}
      <View style={styles.tabDisplay}>
        <Text style={styles.navLabel}>{'>>>'} NAVIGATE:</Text>
        <View style={styles.tabRow}>
          {renderTabRow()}
        </View>
      </View>

      {/* D-Pad Controls */}
      <View style={styles.dPadContainer}>
        <View style={styles.dPad}>
          {/* Up Button */}
          <TouchableOpacity
            style={styles.dPadButton}
            onPress={() => handlePress(onUp)}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.dPadButtonInner,
                { opacity: Animated.add(0.8, Animated.multiply(buttonAnim, -0.3)) },
              ]}
            >
              <Text style={styles.dPadArrow}>▲</Text>
            </Animated.View>
          </TouchableOpacity>

          {/* Middle Row: Left, Down, Right */}
          <View style={styles.dPadMiddleRow}>
            <TouchableOpacity
              style={styles.dPadButton}
              onPress={() => handlePress(onLeft)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.dPadButtonInner,
                  { opacity: Animated.add(0.8, Animated.multiply(buttonAnim, -0.3)) },
                ]}
              >
                <Text style={styles.dPadArrow}>◄</Text>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dPadButton}
              onPress={() => handlePress(onDown)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.dPadButtonInner,
                  { opacity: Animated.add(0.8, Animated.multiply(buttonAnim, -0.3)) },
                ]}
              >
                <Text style={styles.dPadArrow}>▼</Text>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dPadButton}
              onPress={() => handlePress(onRight)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.dPadButtonInner,
                  { opacity: Animated.add(0.8, Animated.multiply(buttonAnim, -0.3)) },
                ]}
              >
                <Text style={styles.dPadArrow}>►</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Enter Button */}
          <TouchableOpacity
            style={[styles.dPadButton, styles.enterButton]}
            onPress={() => handlePress(onEnter)}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.dPadButtonInner,
                styles.enterButtonInner,
                { opacity: Animated.add(0.8, Animated.multiply(buttonAnim, -0.3)) },
              ]}
            >
              <Text style={styles.enterText}>ENTER</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderTopColor: Colors.amber.dim,
    paddingVertical: Spacing.sm,
  },
  tabDisplay: {
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  navLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[300],
    marginBottom: Spacing.xs,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tabText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.dim,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  tabTextActive: {
    color: Colors.amber.secondary,
    backgroundColor: Colors.amber.bg,
    fontWeight: 'bold',
  },
  dPadContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.lg,
  },
  dPad: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dPadMiddleRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dPadButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dPadButtonInner: {
    width: 40,
    height: 40,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.amber.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dPadArrow: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.lg,
    color: Colors.amber.primary,
  },
  enterButton: {
    marginTop: Spacing.xs,
  },
  enterButtonInner: {
    backgroundColor: Colors.amber.bg,
    width: 80,
    height: 36,
  },
  enterText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: Spacing.sm,
    top: Spacing.sm,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.status.error,
  },
  closeButtonText: {
    color: Colors.status.error,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
  },
  // Retro mode styles
  retroContainer: {
    backgroundColor: Colors.retro.bg,
    borderTopColor: Colors.retro.lightGray,
  },
  retroNavLabel: {
    color: Colors.retro.text,
  },
  retroTabText: {
    color: Colors.retro.gray,
  },
  retroTabTextActive: {
    color: Colors.retro.primary,
    backgroundColor: Colors.retro.dark,
  },
  retroStatusBar: {
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  retroActions: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  retroCloseButton: {
    backgroundColor: Colors.retro.dark,
    borderColor: Colors.retro.primary,
  },
  retroCloseButtonText: {
    color: Colors.retro.primary,
  },
});
