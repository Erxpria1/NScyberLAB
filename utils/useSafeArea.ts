import { useSafeAreaInsets as useRNSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

/**
 * Safe area insets hook with platform-specific utilities
 * Provides consistent spacing for notched devices (iPhone 14 Pro Max, etc.)
 */
export const useSafeAreaInsets = () => {
  const insets = useRNSafeAreaInsets();

  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    // Vertical total (top + bottom)
    vertical: insets.top + insets.bottom,
    // Horizontal total (left + right)
    horizontal: insets.left + insets.right,
    // Whether device has a notch/dynamic island
    hasNotch: insets.top > 20,
    // Whether device has home indicator
    hasHomeIndicator: insets.bottom > 0,
    // Platform info
    isIOS: Platform.OS === 'ios',
  };
};
