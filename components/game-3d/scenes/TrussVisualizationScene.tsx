import React, { useState, useMemo } from 'react';
import { Platform, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors, Typography, Spacing } from '@/utils/theme';
import type { TrussNode3D, TrussMember3D } from '../types';

// ============================================================================
// WEB-SPECIFIC IMPORTS (lazy loaded to prevent RN bundler issues)
// ============================================================================

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
const HtmlWeb = Platform.OS === 'web'
  ? require('@react-three/drei').Html
  : null;
const gridHelperWeb = Platform.OS === 'web'
  ? require('@react-three/drei').gridHelper
  : null;

// ============================================================================
// TRUSS GEOMETRY GENERATOR
// ============================================================================

const createWarrenTruss = (): {
  nodes: TrussNode3D[];
  members: TrussMember3D[];
} => {
  const nodes: TrussNode3D[] = [];
  const members: TrussMember3D[] = [];
  const spans = 4;
  const spanWidth = 1.5;
  const height = 1.5;

  for (let i = 0; i <= spans; i++) {
    nodes.push({
      id: `B${i}`,
      position: { x: i * spanWidth - (spans * spanWidth) / 2, y: 0, z: 0 },
      fixed: i === 0 || i === spans,
    });
    if (i < spans) {
      nodes.push({
        id: `T${i}`,
        position: { x: (i * spanWidth + spanWidth / 2) - (spans * spanWidth) / 2, y: height, z: 0 },
        fixed: false,
      });
    }
  }

  for (let i = 0; i < spans; i++) {
    members.push({ id: `BM${i}`, nodeA: `B${i}`, nodeB: `B${i + 1}`, tension: Math.random() * 50 });
    if (i < spans - 1) {
      members.push({ id: `TM${i}`, nodeA: `T${i}`, nodeB: `T${i + 1}`, compression: Math.random() * 50 + 50 });
    }
    members.push({ id: `D${i}a`, nodeA: `B${i}`, nodeB: `T${i}`, tension: Math.random() * 30 + 20 });
    members.push({ id: `D${i}b`, nodeA: `B${i + 1}`, nodeB: `T${i}`, compression: Math.random() * 30 + 40 });
  }

  return { nodes, members };
};

// ============================================================================
// WEB 3D COMPONENTS
// ============================================================================

const TrussMember3DWeb: React.FC<{
  member: TrussMember3D;
  nodes: TrussNode3D[];
  showForces: boolean;
  loadFactor: number;
}> = ({ member, nodes, showForces, loadFactor }) => {
  const nodeA = nodes.find(n => n.id === member.nodeA);
  const nodeB = nodes.find(n => n.id === member.nodeB);

  if (!nodeA || !nodeB) return null;

  const posA = new THREE.Vector3(nodeA.position.x, nodeA.position.y, nodeA.position.z);
  const posB = new THREE.Vector3(nodeB.position.x, nodeB.position.y, nodeB.position.z);

  const distance = posA.distanceTo(posB);
  const position = posA.clone().lerp(posB, 0.5);

  const direction = new THREE.Vector3().subVectors(posB, posA).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

  const force = (member.tension || member.compression || 0) * loadFactor;
  const isTension = !!member.tension;

  const color = showForces
    ? isTension
      ? new THREE.Color(Colors.status.info).lerp(new THREE.Color(Colors.white), 0.5 - (force / 200))
      : new THREE.Color(Colors.status.error).lerp(new THREE.Color(Colors.white), 0.5 - (force / 200))
    : new THREE.Color(Colors.gray[400]);

  return (
    //@ts-ignore
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.04, 0.04, distance, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={showForces ? 0.3 : 0} />
    </mesh>
  );
};

const TrussNode3DWeb: React.FC<{ node: TrussNode3D }> = ({ node }) => (
  //@ts-ignore
  <mesh position={[node.position.x, node.position.y, node.position.z]}>
    <sphereGeometry args={[0.08, 16, 16]} />
    <meshStandardMaterial
      color={node.fixed ? Colors.amber.secondary : Colors.gray[300]}
      metalness={0.8}
      roughness={0.2}
    />
    <HtmlWeb distanceFactor={10} position={[0, 0.2, 0]}>
      <View style={styles.nodeLabelContainer}>
        <Text style={styles.nodeLabelText}>{node.id}</Text>
      </View>
    </HtmlWeb>
  </mesh>
);

const Web3DScene: React.FC<{
  nodes: TrussNode3D[];
  members: TrussMember3D[];
  appliedLoad: number;
  showForces: boolean;
}> = ({ nodes, members, appliedLoad, showForces }) => (
  //@ts-ignore
  <CanvasWeb camera={{ position: [0, 2, 8], fov: 40 }}>
    <color attach="background" args={[Colors.black]} />
    <ambientLight intensity={0.4} />
    <pointLight position={[10, 10, 10]} intensity={1} />
    <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} castShadow />
    <OrbitControlsWeb enableDamping />
    {gridHelperWeb && <gridHelperWeb args={[20, 20, Colors.gray[150], Colors.gray[200]]} position={[0, -0.1, 0]} />}
    <group>
      {members.map(m => (
        <TrussMember3DWeb
          key={m.id}
          member={m}
          nodes={nodes}
          showForces={showForces}
          loadFactor={appliedLoad / 100}
        />
      ))}
      {nodes.map(n => (
        <TrussNode3DWeb key={n.id} node={n} />
      ))}
    </group>
    <fog attach="fog" args={[Colors.black, 10, 25]} />
  </CanvasWeb>
);

// ============================================================================
// NATIVE 2D VISUALIZATION
// ============================================================================

const TrussVisualizationNative: React.FC<{
  nodes: TrussNode3D[];
  members: TrussMember3D[];
  appliedLoad: number;
  showForces: boolean;
}> = ({ nodes, members, appliedLoad, showForces }) => {
  const scale = 50;
  const offsetX = 30;
  const offsetY = 200;

  // Calculate bounds
  const xValues = nodes.map(n => n.position.x * scale + offsetX);
  const yValues = nodes.map(n => offsetY - n.position.y * scale);
  const minX = Math.min(...xValues) - 20;
  const maxX = Math.max(...xValues) + 20;
  const minY = Math.min(...yValues) - 40;
  const maxY = Math.max(...yValues) + 20;

  return (
    <View style={styles.nativeCanvas}>
      <Text style={styles.nativeTitle}>◀ KAFES_SİSTEMİ_ANALİZİ ▶</Text>
      <Text style={styles.nativeSubtitle}>Warren Kafes | {nodes.length} Düğüm | {members.length} Eleman</Text>

      <View style={[styles.trussView, { width: '100%', height: 250 }]}>
        {/* Render connection lines first */}
        {members.map((member) => {
          const nodeA = nodes.find(n => n.id === member.nodeA);
          const nodeB = nodes.find(n => n.id === member.nodeB);
          if (!nodeA || !nodeB) return null;

          const x1 = nodeA.position.x * scale + offsetX;
          const y1 = offsetY - nodeA.position.y * scale;
          const x2 = nodeB.position.x * scale + offsetX;
          const y2 = offsetY - nodeB.position.y * scale;

          const color = showForces
            ? member.tension
              ? Colors.status.info
              : member.compression
              ? Colors.status.error
              : Colors.gray[400]
            : Colors.gray[400];

          // Calculate line properties
          const dx = x2 - x1;
          const dy = y2 - y1;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);

          return (
            <View
              key={member.id}
              style={[
                styles.memberLine,
                {
                  left: Math.min(x1, x2),
                  top: Math.min(y1, y2),
                  width: length + 2,
                  height: 3,
                  backgroundColor: color,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}

        {/* Render nodes */}
        {nodes.map((node) => {
          const x = node.position.x * scale + offsetX;
          const y = offsetY - node.position.y * scale;

          return (
            <View
              key={node.id}
              style={[
                styles.node,
                {
                  left: x - 10,
                  top: y - 10,
                  backgroundColor: node.fixed ? Colors.amber.secondary : Colors.gray[300],
                },
              ]}
            >
              <Text style={styles.nodeLabel}>{node.id}</Text>
            </View>
          );
        })}

        {/* Load indicators */}
        {showForces && nodes.filter(n => !n.fixed).map((node) => {
          const x = node.position.x * scale + offsetX;
          const y = offsetY - node.position.y * scale;
          const loadValue = Math.floor(appliedLoad / nodes.filter(n => !n.fixed).length);

          return (
            <View key={`load-${node.id}`} style={[styles.loadArrowNative, { left: x - 15, top: y - 50 }]}>
              <Text style={styles.loadArrowText}>↓</Text>
              <Text style={styles.loadLabel}>{loadValue}kN</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TrussVisualizationScene: React.FC<{
  onLoadChange?: (load: number) => void;
}> = ({ onLoadChange }) => {
  const [appliedLoad, setAppliedLoad] = useState(100);
  const [showForces, setShowForces] = useState(true);
  const { nodes, members } = useMemo(() => createWarrenTruss(), []);

  const handleLoadChange = (delta: number) => {
    const newLoad = Math.max(0, Math.min(200, appliedLoad + delta));
    setAppliedLoad(newLoad);
    onLoadChange?.(newLoad);
  };

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer}>
        {isWeb ? (
          <>
            <Web3DScene nodes={nodes} members={members} appliedLoad={appliedLoad} showForces={showForces} />
            {/* HUD Info */}
            <View style={styles.hudOverlay}>
              <Text style={styles.hudTitle}>[ KAFES_SİSTEMİ_ANALİZİ ]</Text>
              <Text style={styles.hudText}>YÜK: {appliedLoad} kN</Text>
              <Text style={styles.hudText}>DÜĞÜM: {nodes.length} | ELEMAN: {members.length}</Text>
              <View style={styles.legend}>
                <View style={[styles.legendBox, { backgroundColor: Colors.status.info }]} />
                <Text style={styles.legendLabel}>ÇEKME</Text>
                <View style={[styles.legendBox, { backgroundColor: Colors.status.error, marginLeft: 8 }]} />
                <Text style={styles.legendLabel}>BASMA</Text>
              </View>
              <Text style={styles.platformBadge}>WEB 3D</Text>
            </View>
          </>
        ) : (
          <>
            <TrussVisualizationNative
              nodes={nodes}
              members={members}
              appliedLoad={appliedLoad}
              showForces={showForces}
            />
            {/* HUD Info */}
            <View style={styles.hudOverlay}>
              <Text style={styles.hudTitle}>[ KAFES_SİSTEMİ_ANALİZİ ]</Text>
              <Text style={styles.hudText}>YÜK: {appliedLoad} kN</Text>
              <Text style={styles.hudText}>DÜĞÜM: {nodes.length} | ELEMAN: {members.length}</Text>
              <View style={styles.legend}>
                <View style={[styles.legendBox, { backgroundColor: Colors.status.info }]} />
                <Text style={styles.legendLabel}>ÇEKME</Text>
                <View style={[styles.legendBox, { backgroundColor: Colors.status.error, marginLeft: 8 }]} />
                <Text style={styles.legendLabel}>BASMA</Text>
              </View>
              <Text style={styles.platformBadge}>MOBİL 2D</Text>
            </View>
          </>
        )}
      </View>

      {/* Control Panel */}
      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <Text style={styles.label}>YÜK:</Text>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleLoadChange(-10)}>
            <Text style={styles.controlButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.valueText}>{appliedLoad} kN</Text>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleLoadChange(10)}>
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.toggleButton, showForces && styles.toggleButtonActive]}
          onPress={() => setShowForces(!showForces)}
        >
          <Text style={styles.toggleButtonText}>
            {showForces ? '◼ ISI HARİTASI KAPAT' : '▶ ISI HARİTASI AÇ'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoPanel}>
          <Text style={styles.infoText}>
            Maks Çekme: {Math.floor(appliedLoad * 0.4)} kN
          </Text>
          <Text style={styles.infoText}>
            Maks Basma: {Math.floor(appliedLoad * 0.6)} kN
          </Text>
        </View>
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
    right: Spacing.md,
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
  },
  hudText: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.white,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  legendBox: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.gray[400],
    marginLeft: 4,
  },
  platformBadge: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.gray[400],
    marginTop: 8,
    textAlign: 'right',
  },
  nodeLabelContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: Colors.amber.dim,
  },
  nodeLabelText: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.amber.secondary,
  },
  // Native canvas styles
  nativeCanvas: {
    flex: 1,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  nativeTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  nativeSubtitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.secondary,
    marginTop: Spacing.xs,
  },
  trussView: {
    width: '100%',
    height: 250,
    marginTop: Spacing.lg,
    position: 'relative',
  },
  memberLine: {
    position: 'absolute',
    height: 3,
    borderRadius: 1,
  },
  node: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.amber.primary,
  },
  nodeLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.black,
    fontWeight: 'bold',
  },
  loadArrowNative: {
    position: 'absolute',
    alignItems: 'center',
  },
  loadArrowText: {
    fontFamily: Typography.family.mono,
    fontSize: 20,
    color: Colors.status.error,
  },
  loadLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.status.error,
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
    width: 60,
  },
  controlButton: {
    width: 44,
    height: 44,
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
    width: 70,
    textAlign: 'center',
  },
  toggleButton: {
    backgroundColor: Colors.gray[200],
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  toggleButtonActive: {
    backgroundColor: Colors.amber.bg,
    borderColor: Colors.amber.secondary,
  },
  toggleButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  infoPanel: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.gray[150],
    borderRadius: 4,
  },
  infoText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.dim,
    marginBottom: 2,
  },
});
