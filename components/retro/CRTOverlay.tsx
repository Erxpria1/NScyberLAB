import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const CRTOverlay: React.FC = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.scanlines} />
      <View style={styles.vignette} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    // Simulated vignette with radial-like effect
    borderWidth: 40,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 100, // Roughly simulates a rounded CRT screen
  }
});
