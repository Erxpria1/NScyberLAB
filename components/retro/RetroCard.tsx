import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors } from '@/utils/theme';

interface RetroCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  color?: string;
}

export const RetroCard: React.FC<RetroCardProps> = ({ children, style, color = Colors.retro.bg }) => {
  return (
    <View style={[styles.outerBorder, { backgroundColor: Colors.black }]}>
      <View style={[styles.container, { backgroundColor: color }, style]}>
        {/* Highlight inner border for 3D effect */}
        <View style={styles.highlight} />
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerBorder: {
    borderWidth: 3,
    borderColor: Colors.black,
    // Chunky hard shadow
    shadowColor: Colors.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 8,
    marginRight: 4,
  },
  container: {
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Subtle inner highlight
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
