import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/utils/theme';
import { BeamBucklingScene } from './scenes/BeamBucklingScene';
import { TrussVisualizationScene } from './scenes/TrussVisualizationScene';
import { VirtualJoystick, SwipeControls } from './controls';
import { RetroModeToggle } from '@/components/theme';
import { RetroStatusBar } from '@/components/retro';
import { useThemeStore } from '@/store/useThemeStore';
import type { SceneType, BucklingMode } from './types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Game3DScreenProps {
  onBack?: () => void;
}

export const Game3DScreen: React.FC<Game3DScreenProps> = ({ onBack }) => {
  const [currentScene, setCurrentScene] = useState<SceneType>('buckling');
  const [joystickEnabled, setJoystickEnabled] = useState(true);
  const insets = useSafeAreaInsets();
  const { mode } = useThemeStore();
  const isRetroMode = mode === 'retro';

  const handleSceneChange = (scene: SceneType) => {
    setCurrentScene(scene);
  };

  const handleJoystickMove = (x: number, y: number) => {
    // Handle joystick input for camera/scene control
    console.log('Joystick:', x, y);
  };

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    switch (direction) {
      case 'left':
        if (currentScene === 'truss') setCurrentScene('buckling');
        break;
      case 'right':
        if (currentScene === 'buckling') setCurrentScene('truss');
        break;
      case 'up':
      case 'down':
        // Could be used for zoom or other controls
        break;
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.header, isRetroMode && styles.retroHeader]}>
          <TouchableOpacity
            style={[styles.backButton, isRetroMode && styles.retroBackButton]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={[styles.backButtonText, isRetroMode && styles.retroButtonText]}>← GERİ</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isRetroMode && styles.retroHeaderTitle]}>3D GÖRSELLEŞTİRME</Text>
          <RetroModeToggle size="sm" showLabel={false} />
        </View>

        {/* Retro Status Bar (shown only in retro mode) */}
        {isRetroMode && (
          <View style={styles.retroStatusContainer}>
            <RetroStatusBar showLoad={false} showBattery={true} showXP={true} />
          </View>
        )}

        {/* Scene Selector */}
        <View style={styles.sceneSelector}>
          <TouchableOpacity
            style={[
              styles.sceneTab,
              currentScene === 'buckling' && styles.sceneTabActive,
            ]}
            onPress={() => handleSceneChange('buckling')}
          >
            <Text
              style={[
                styles.sceneTabText,
                currentScene === 'buckling' && styles.sceneTabTextActive,
              ]}
            >
              BURKULMA
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sceneTab,
              currentScene === 'truss' && styles.sceneTabActive,
            ]}
            onPress={() => handleSceneChange('truss')}
          >
            <Text
              style={[
                styles.sceneTabText,
                currentScene === 'truss' && styles.sceneTabTextActive,
              ]}
            >
              KAFES
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <SwipeControls
          enabled={true}
          onSwipeLeft={() => handleSwipe('left')}
          onSwipeRight={() => handleSwipe('right')}
          onSwipeUp={() => handleSwipe('up')}
          onSwipeDown={() => handleSwipe('down')}
        >
          <View style={styles.content}>
            {currentScene === 'buckling' ? (
              <BeamBucklingScene
                onModeChange={(mode: BucklingMode) =>
                  console.log('Mode changed:', mode)
                }
                onAmplitudeChange={(amp) => console.log('Amplitude:', amp)}
                onToggleAnimation={() => console.log('Toggle animation')}
                initialMode={1}
              />
            ) : (
              <TrussVisualizationScene
                onLoadChange={(load) => console.log('Load changed:', load)}
              />
            )}
          </View>
        </SwipeControls>

        {/* Virtual Joystick (shown when enabled) */}
        {joystickEnabled && currentScene === 'buckling' && (
          <VirtualJoystick
            onMove={handleJoystickMove}
            onRelease={() => console.log('Joystick released')}
            position="left"
          />
        )}

        {/* Scene Info Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {currentScene === 'buckling'
              ? 'KİRİŞ BURKULMA MODLARI (1, 2, 3)'
              : 'WARREN KAFES SİSTEMİ ANALİZİ'}
          </Text>
          <TouchableOpacity
            style={styles.joystickToggle}
            onPress={() => setJoystickEnabled(!joystickEnabled)}
          >
            <Text style={styles.joystickToggleText}>
              {joystickEnabled ? 'JOYSTICK GİZLE' : 'JOYSTICK GÖSTER'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 191, 0, 0.3)', // Glassy amber
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    zIndex: 20,
  },
  backButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(255, 191, 0, 0.1)',
    borderWidth: 1,
    borderColor: Colors.amber.secondary,
    borderRadius: 2,
  },
  backButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  placeholder: {
    width: 60,
  },
  sceneSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(44, 44, 46, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 191, 0, 0.2)',
  },
  sceneTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  sceneTabActive: {
    borderBottomColor: Colors.amber.secondary,
    backgroundColor: 'rgba(255, 191, 0, 0.05)',
  },
  sceneTabText: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.gray[400],
    letterSpacing: 1,
  },
  sceneTabTextActive: {
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 191, 0, 0.2)',
    backgroundColor: 'rgba(28, 28, 30, 0.9)',
  },
  footerText: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.gray[400],
  },
  joystickToggle: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 191, 0, 0.3)',
    borderRadius: 2,
  },
  joystickToggleText: {
    fontFamily: Typography.family.mono,
    fontSize: 9,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  // Retro mode styles
  retroHeader: {
    backgroundColor: Colors.retro.bg,
    borderBottomColor: Colors.retro.lightGray,
  },
  retroHeaderTitle: {
    color: Colors.retro.text,
  },
  retroBackButton: {
    backgroundColor: Colors.retro.dark,
    borderColor: Colors.retro.primary,
  },
  retroButtonText: {
    color: Colors.retro.primary,
  },
  retroStatusContainer: {
    padding: Spacing.sm,
    backgroundColor: Colors.retro.bg,
  },
});
