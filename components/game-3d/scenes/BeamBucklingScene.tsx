import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Platform, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors, Typography, Spacing } from '@/utils/theme';
import type { BucklingMode } from '../types';

// ============================================================================
// WEB-SPECIFIC IMPORTS (lazy loaded to prevent RN bundler issues)
// ============================================================================

// These will only be imported on web platform
const CanvasWeb = Platform.OS === 'web'
  ? require('@react-three/fiber').Canvas
  : null;
const useFrameWeb = Platform.OS === 'web'
  ? require('@react-three/fiber').useFrame
  : null;
const THREE = Platform.OS === 'web'
  ? require('three')
  : null;
const OrbitControlsWeb = Platform.OS === 'web'
  ? require('@react-three/drei').OrbitControls
  : null;

// ============================================================================
// SHADERS (2026 High-Tech Aesthetic)
// ============================================================================

const BUCKLING_VERTEX_SHADER = `
  varying vec2 vUv;
  varying float vDisplacement;
  varying vec3 vPosition;

  uniform float uMode;
  uniform float uAmplitude;
  uniform float uTime;
  uniform float uLength;

  void main() {
    vUv = uv;
    vPosition = position;

    // Calculate buckling deformation on the GPU
    // sin(n * pi * x / L)
    float normalizedX = (position.x + uLength / 2.0) / uLength;
    float deformation = sin(uMode * 3.14159 * normalizedX) * uAmplitude;

    // Add subtle micro-vibration if animating
    deformation *= (1.0 + sin(uTime * 4.0) * 0.05);

    vDisplacement = abs(deformation) / 0.8;

    vec3 newPosition = position;
    newPosition.y += deformation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const BUCKLING_FRAGMENT_SHADER = `
  varying vec2 vUv;
  varying float vDisplacement;
  varying vec3 vPosition;

  uniform vec3 uColorSuccess;
  uniform vec3 uColorAmber;
  uniform vec3 uColorError;
  uniform float uTime;

  void main() {
    vec3 color = uColorSuccess;
    if (vDisplacement > 0.3) {
      color = mix(uColorSuccess, uColorAmber, (vDisplacement - 0.3) / 0.4);
    }
    if (vDisplacement > 0.7) {
      color = mix(uColorAmber, uColorError, (vDisplacement - 0.7) / 0.3);
    }

    float scanline = sin(vUv.x * 100.0 + uTime * 5.0) * 0.1;
    color += scanline;

    float glow = 0.2 + 0.1 * sin(uTime * 2.0);

    gl_FragColor = vec4(color, 0.9);
  }
`;

// ============================================================================
// CONSTANTS
// ============================================================================

const BEAM_LENGTH = 4;
const BEAM_RADIUS = 0.08;

// ============================================================================
// WEB 3D COMPONENTS
// ============================================================================

const BuckledBeam3DWeb: React.FC<{
  mode: BucklingMode;
  amplitude: number;
  animating: boolean;
}> = ({ mode, amplitude, animating }) => {
  const meshRef = useRef<any>(null);
  const materialRef = useRef<any>(null);

  const uniforms = useMemo(() => ({
    uMode: { value: mode },
    uAmplitude: { value: amplitude },
    uTime: { value: 0 },
    uLength: { value: BEAM_LENGTH },
    uColorSuccess: { value: new THREE.Color(Colors.status.success) },
    uColorAmber: { value: new THREE.Color(Colors.amber.primary) },
    uColorError: { value: new THREE.Color(Colors.status.error) },
  }), [mode, amplitude]);

  useEffect(() => {
    if (uniforms) {
      uniforms.uMode.value = mode;
      uniforms.uAmplitude.value = amplitude;
    }
  }, [mode, amplitude, uniforms]);

  if (useFrameWeb) {
    useFrameWeb((state: any) => {
      if (materialRef.current && animating) {
        materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      }
    });
  }

  return (
    //@ts-ignore - web only component
    <mesh ref={meshRef}>
      <cylinderGeometry args={[BEAM_RADIUS, BEAM_RADIUS, BEAM_LENGTH, 16, 128, true]} />
      <primitive
        object={new THREE.Matrix4().makeRotationZ(Math.PI / 2)}
        attach="geometry-applyMatrix4"
      />
      <shaderMaterial
        ref={materialRef}
        vertexShader={BUCKLING_VERTEX_SHADER}
        fragmentShader={BUCKLING_FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
};

const SceneGridWeb = () => (
  //@ts-ignore
  <gridHelper args={[10, 20, Colors.amber.dim, Colors.gray[300]]} position={[0, -1, 0]} />
);

const Supports3DWeb = () => (
  //@ts-ignore
  <group>
    <mesh position={[-BEAM_LENGTH / 2, -0.2, 0]}>
      <coneGeometry args={[0.2, 0.4, 4]} />
      <meshStandardMaterial color={Colors.gray[400]} />
    </mesh>
    <mesh position={[BEAM_LENGTH / 2, -0.2, 0]}>
      <coneGeometry args={[0.2, 0.4, 4]} />
      <meshStandardMaterial color={Colors.gray[400]} />
    </mesh>
  </group>
);

// ============================================================================
// REACT NATIVE 2D VISUALIZATION
// ============================================================================

const BucklingBeamNative: React.FC<{
  mode: BucklingMode;
  amplitude: number;
  animating: boolean;
}> = ({ mode, amplitude, animating }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!animating) return;
    const interval = setInterval(() => {
      setTime(t => (t + 0.05) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, [animating]);

  const animatedAmplitude = animating
    ? amplitude * (1 + Math.sin(time * 2) * 0.1)
    : amplitude;

  return (
    <View style={styles.beamContainer}>
      <View style={styles.support}>
        <View style={styles.supportTriangle} />
      </View>
      <View style={styles.beam}>
        {Array.from({ length: 30 }).map((_, i) => {
          const x = i / 29;
          const phase = x * Math.PI * mode;
          const yOffset = Math.sin(phase) * animatedAmplitude * 40;
          const colorIntensity = Math.abs(yOffset) / 30;
          const color = colorIntensity > 0.6
            ? Colors.status.error
            : colorIntensity > 0.3
            ? Colors.amber.primary
            : Colors.status.success;

          return (
            <View
              key={i}
              style={[
                styles.beamSegment,
                {
                  left: `${x * 100}%`,
                  height: 4 + Math.abs(yOffset) / 5,
                  marginTop: yOffset > 0 ? -yOffset / 5 : 0,
                  backgroundColor: color,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.support}>
        <View style={styles.supportTriangle} />
      </View>
    </View>
  );
};

// ============================================================================
// WEB 3D SCENE
// ============================================================================

const Web3DScene: React.FC<{
  mode: BucklingMode;
  amplitude: number;
  animating: boolean;
}> = ({ mode, amplitude, animating }) => (
  //@ts-ignore - web only component
  <CanvasWeb camera={{ position: [0, 1, 5], fov: 45 }}>
    <color attach="background" args={[Colors.black]} />
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} intensity={1} />
    <pointLight position={[-10, 5, -5]} color={Colors.amber.primary} intensity={0.5} />
    <OrbitControlsWeb enableDamping dampingFactor={0.05} />
    <SceneGridWeb />
    <Supports3DWeb />
    <BuckledBeam3DWeb mode={mode} amplitude={amplitude} animating={animating} />
  </CanvasWeb>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface BeamBucklingSceneProps {
  onModeChange: (mode: BucklingMode) => void;
  onAmplitudeChange: (amplitude: number) => void;
  onToggleAnimation: () => void;
  initialMode?: BucklingMode;
}

export const BeamBucklingScene: React.FC<BeamBucklingSceneProps> = ({
  onModeChange,
  onAmplitudeChange,
  onToggleAnimation,
  initialMode = 1,
}) => {
  const [mode, setMode] = useState<BucklingMode>(initialMode);
  const [amplitude, setAmplitude] = useState(0.3);
  const [animating, setAnimating] = useState(true);

  const handleModeChange = (newMode: BucklingMode) => {
    setMode(newMode);
    onModeChange(newMode);
  };

  const handleAmplitudeChange = (delta: number) => {
    const newAmplitude = Math.max(0.1, Math.min(0.8, amplitude + delta));
    setAmplitude(newAmplitude);
    onAmplitudeChange(newAmplitude);
  };

  const handleToggleAnimation = () => {
    setAnimating(!animating);
    onToggleAnimation();
  };

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer}>
        {isWeb ? (
          <>
            <Web3DScene mode={mode} amplitude={amplitude} animating={animating} />
            {/* HUD Info Overlay */}
            <View style={styles.hudOverlay}>
              <Text style={styles.hudTitle}>[ BURKULMA_ANALİZİ_v2.0 ]</Text>
              <Text style={styles.hudText}>ŞEKİL: sin({mode}πx/L)</Text>
              <Text style={styles.hudText}>YÜK: P_cr ∝ {mode * mode}π²EI/L²</Text>
              <Text style={styles.platformBadge}>WEB 3D</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.nativeCanvas}>
              <Text style={styles.nativeTitle}>◀ BURKULMA GÖRSELLEŞTİRME ▶</Text>
              <Text style={styles.nativeSubtitle}>Mod {mode} | Genlik: {amplitude.toFixed(1)}</Text>
              <BucklingBeamNative mode={mode} amplitude={amplitude} animating={animating} />
            </View>
            {/* HUD Info */}
            <View style={styles.hudOverlay}>
              <Text style={styles.hudTitle}>[ BURKULMA_ANALİZİ_v2.0 ]</Text>
              <Text style={styles.hudText}>ŞEKİL: sin({mode}πx/L)</Text>
              <Text style={styles.hudText}>YÜK: P_cr ∝ {mode * mode}π²EI/L²</Text>
              <Text style={styles.platformBadge}>MOBİL 2D</Text>
            </View>
          </>
        )}
      </View>

      {/* Controls Panel */}
      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <Text style={styles.label}>MOD:</Text>
          {[1, 2, 3].map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.modeButton, mode === m && styles.modeButtonActive]}
              onPress={() => handleModeChange(m as BucklingMode)}
            >
              <Text style={[styles.modeButtonText, mode === m && styles.modeButtonTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.controlRow}>
          <Text style={styles.label}>GENLİK:</Text>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleAmplitudeChange(-0.1)}>
            <Text style={styles.controlButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.valueText}>{amplitude.toFixed(1)}</Text>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleAmplitudeChange(0.1)}>
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.animButton, !animating && styles.animButtonPaused]}
          onPress={handleToggleAnimation}
        >
          <Text style={styles.animButtonText}>{animating ? '◼ SİM DURDUR' : '▶ SİM DEVAM'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  hudOverlay: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    padding: Spacing.sm,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    zIndex: 10,
  },
  hudTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  hudText: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.amber.secondary,
  },
  platformBadge: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.gray[400],
    marginTop: 4,
    textAlign: 'right',
  },
  // Native canvas styles
  nativeCanvas: {
    flex: 1,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.amber.primary,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  nativeSubtitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.secondary,
    marginBottom: Spacing.lg,
  },
  beamContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '80%',
    height: 100,
  },
  beam: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.amber.bg,
    position: 'relative',
    marginHorizontal: 4,
  },
  beamSegment: {
    position: 'absolute',
    width: 3,
    borderRadius: 1,
  },
  support: {
    width: 20,
    height: 30,
    alignItems: 'center',
  },
  supportTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.gray[400],
  },
  controls: {
    padding: Spacing.md,
    backgroundColor: Colors.gray[100],
    borderTopWidth: 2,
    borderTopColor: Colors.amber.dim,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    width: 50,
  },
  modeButton: {
    width: 44,
    height: 44,
    marginRight: Spacing.sm,
    backgroundColor: Colors.gray[200],
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: Colors.amber.bg,
    borderColor: Colors.amber.secondary,
  },
  modeButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.amber.dim,
  },
  modeButtonTextActive: {
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  controlButton: {
    width: 44,
    height: 44,
    marginHorizontal: Spacing.xs,
    backgroundColor: Colors.gray[200],
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.lg,
    color: Colors.amber.primary,
  },
  valueText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.amber.secondary,
    width: 50,
    textAlign: 'center',
  },
  animButton: {
    backgroundColor: Colors.amber.bg,
    borderWidth: 1,
    borderColor: Colors.amber.secondary,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  animButtonPaused: {
    backgroundColor: Colors.gray[200],
    borderColor: Colors.gray[400],
  },
  animButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
