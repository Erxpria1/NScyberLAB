// ============================================================================
// RETRO MODAL COMPONENT - FIXED
// Mobile-friendly bottom sheet / center modal with retro styling
// ============================================================================

import React, { useEffect, useRef, useMemo, type ReactNode } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing } from '@/utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RetroButton } from './RetroButton';

// ============================================================================
// TYPES
// ============================================================================

export type ModalVariant = 'center' | 'bottomSheet';

export interface RetroModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  variant?: ModalVariant;
  style?: ViewStyle;
  closeOnOverlayTap?: boolean;
  actions?: ReactNode; // Action buttons outside scroll area
}

// ============================================================================
// MOBILE DETECTION
// ============================================================================

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_MOBILE = SCREEN_HEIGHT < 700;

// ============================================================================
// COMPONENT
// ============================================================================

export const RetroModal: React.FC<RetroModalProps> = React.memo(({
  visible,
  onClose,
  children,
  title,
  variant = IS_MOBILE ? 'bottomSheet' : 'center',
  style,
  closeOnOverlayTap = true,
  actions,
}) => {
  // Use refs properly - only initialize once
  const slideAnim = useRef<Animated.Value>(null);
  const fadeAnim = useRef<Animated.Value>(null);

  // Lazy initialization
  const slideValue = slideAnim.current || (slideAnim.current = new Animated.Value(0));
  const fadeValue = fadeAnim.current || (fadeAnim.current = new Animated.Value(0));

  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Animation cleanup function
    let isMounted = true;

    if (visible) {
      Animated.parallel([
        Animated.timing(fadeValue, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideValue, { toValue: 1, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeValue, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(slideValue, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [visible]); // Remove slideAnim/fadeAnim from deps - refs are stable

  // Memoize contentStyle to prevent recreation on every render
  const contentStyle = useMemo(() => ({
    opacity: fadeValue,
    transform: [
      {
        translateY: slideValue.interpolate({
          inputRange: [0, 1],
          outputRange: variant === 'bottomSheet' ? [300, 0] : [20, 0],
        }),
      },
    ],
  }), [variant, slideValue, fadeValue]); // Only recreate when variant or values change

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.modalRoot}>
        {/* Background overlay - closes modal on tap */}
        {closeOnOverlayTap && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={onClose}
          >
            <View style={StyleSheet.absoluteFill} />
          </TouchableOpacity>
        )}

        {/* Modal container - fills the screen for proper alignment */}
        <View
          style={[
            variant === 'bottomSheet' ? styles.bottomWrapper : styles.centerWrapper,
            styles.modalWrapper,
          ]}
          pointerEvents="box-none"
        >
          <Animated.View 
            style={[
              variant === 'bottomSheet' ? styles.bottomSheetContainer : styles.centerContainer,
              styles.modalContent, 
              contentStyle,
              style
            ]} 
            pointerEvents="auto"
          >
            {/* Title bar */}
            {title && (
              <View style={styles.titleBar}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Fixed height or scrollable content */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardView}
            >
              <ScrollView
                bounces={true}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.scrollContent}
                style={actions ? styles.scrollWithActions : undefined}
              >
                {children}
              </ScrollView>

              {/* Action buttons - outside scroll */}
              {actions && (
                <View style={[styles.actionsContainer, { paddingBottom: Math.max(Spacing.lg, insets.bottom + 8) }]}>
                  {actions}
                </View>
              )}
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
});

// ============================================================================
// MODAL ACTION BUTTONS ROW
// ============================================================================

export interface ModalActionsProps {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmColor?: string;
  renderExtra?: () => React.ReactNode;
}

export const ModalActions: React.FC<ModalActionsProps> = React.memo(({
  onCancel,
  onConfirm,
  cancelLabel = 'İPTAL',
  confirmLabel = 'TAMAM',
  confirmColor = Colors.retro.primary,
  renderExtra,
}) => {
  return (
    <View style={styles.actionsColumn}>
      {renderExtra && renderExtra()}
      <View style={styles.actionsRow}>
        <RetroButton
          label={cancelLabel}
          onPress={onCancel}
          color={Colors.retro.gray}
          style={{ flex: 1, minHeight: 44 }}
        />
        <View style={styles.buttonSpacer} />
        <RetroButton
          label={confirmLabel}
          onPress={onConfirm}
          color={confirmColor}
          style={{ flex: 1, minHeight: 44 }}
        />
      </View>
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  centerWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomWrapper: {
    justifyContent: 'flex-end',
  },
  centerContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  bottomSheetContainer: {
    width: '100%',
    maxHeight: '90%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalContent: {
    backgroundColor: Colors.retro.dark,
    borderWidth: 2,
    borderColor: Colors.retro.primary,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    overflow: 'hidden',
  },
  keyboardView: {
    // In bottom sheets, we don't want flex: 1 to collapse if empty,
    // but we need it to fill the maxHeight if provided.
    flexShrink: 1, 
    flexGrow: 0,
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.black,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 184, 0, 0.3)',
  },
  title: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.retro.secondary,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.retro.dark,
    borderWidth: 1,
    borderColor: Colors.retro.gray,
  },
  closeButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: 16,
    color: Colors.retro.secondary,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  scrollWithActions: {
    paddingBottom: Spacing.lg,
  },
  actionsContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionsInner: {
    flexDirection: 'row',
  },
  actionsColumn: {
    flexDirection: 'column',
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  buttonSpacer: {
    width: Spacing.sm,
  },
});
