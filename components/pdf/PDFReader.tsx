import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { Canvas, Rect } from '@shopify/react-native-skia';
import { useLibraryStore } from '@/store/useLibraryStore';
import { Colors, Typography, Spacing } from '@/utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PDFReaderProps {
  uri: string;
  documentId: string;
  onClose?: () => void;
}

// CRT Scanlines Component (with safety check)
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
    // Fallback if Skia is not available
    return <View style={styles.scanlineFallback} />;
  }
};

// Terminal Status Bar
interface TerminalStatusBarProps {
  filename: string;
  currentPage: number;
  totalPages: number;
  paddingTop: number;
}

const TerminalStatusBar: React.FC<TerminalStatusBarProps> = ({
  filename,
  currentPage,
  totalPages,
  paddingTop,
}) => {
  const truncatedName = filename.length > 20 ? filename.substring(0, 17) + '...' : filename;

  const memPercent = totalPages > 0
    ? Math.round(40 + (currentPage / totalPages) * 30)
    : 40;

  return (
    <View style={[styles.statusBar, { paddingTop }]}>
      <View style={styles.statusLeft}>
        <Text style={styles.statusText}>MEM: {memPercent}%</Text>
        <Text style={styles.statusText}>BAT: 78%</Text>
        <Text style={styles.statusText}>CONN: ONLINE</Text>
      </View>
      <View style={styles.statusRight}>
        <Text style={[styles.statusText, styles.modeText]}>MODE: PDF_VIEWER</Text>
      </View>
    </View>
  );
};

// Boot Sequence for PDF Loading
const BootSequence: React.FC<{ filename: string; onComplete: () => void }> = ({ filename, onComplete }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const bootMessages = [
    `> LOADING PDF MODULE...`,
    `> TARGET: ${filename.length > 25 ? filename.substring(0, 22) + '...' : filename}`,
    `> PARSING DOCUMENT STRUCTURE...`,
    `> INITIALIZING RENDER ENGINE...`,
    `> BUILDING PAGE CACHE...`,
    `> READY.`,
  ];

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    bootMessages.forEach((msg, index) => {
      timeout = setTimeout(() => {
        setMessages((prev) => [...prev, msg]);
        setProgress(((index + 1) / bootMessages.length) * 100);

        if (index === bootMessages.length - 1) {
          setTimeout(onComplete, 300);
        }
      }, index * 250);
    });

    return () => clearTimeout(timeout);
  }, [filename, onComplete]);

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

      {/* ASCII Border */}
      <View style={styles.asciiBorder}>
        <Text style={styles.asciiText}>
╔═════════════════════════════════╗
║   PDF RENDER ENGINE v1.0.6      ║
╚═════════════════════════════════╝
        </Text>
      </View>
    </View>
  );
};

// Animated Terminal Button with press feedback
interface TerminalButtonProps {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const TerminalButton: React.FC<TerminalButtonProps> = ({ onPress, disabled, children }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false, // Border color cannot use native driver
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 8,
        stiffness: 400,
      }),
      Animated.timing(borderAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.amber.dim, Colors.amber.glow],
  });

  const backgroundColor = disabled
    ? Colors.gray[200]
    : borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [Colors.black as any, `${Colors.amber.bg}CC` as any],
      });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.terminalButton,
          {
            transform: [{ scale: scaleAnim }],
            borderColor,
            backgroundColor,
          },
          disabled && styles.terminalButtonDisabledBg,
        ]}
      >
        <Text style={[styles.terminalButtonText, disabled && styles.terminalButtonDisabled]}>
          {children}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const PDFReader: React.FC<PDFReaderProps> = ({ uri, documentId, onClose }) => {
  const pdfRef = useRef<any>(null);
  const insets = { top: Platform.OS === 'ios' ? 50 : 10 };
  const {
    currentDocument,
    updateCurrentPage,
    setCurrentDocument,
  } = useLibraryStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [showPageInput, setShowPageInput] = useState(false);
  const [pageInput, setPageInput] = useState('');
  const [bootComplete, setBootComplete] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);

  // Update store when page changes
  useEffect(() => {
    if (currentDocument?.id === documentId) {
      updateCurrentPage(currentPage);
    }
  }, [currentPage, documentId, currentDocument, updateCurrentPage]);

  // Load document
  useEffect(() => {
    setCurrentDocument(documentId);
  }, [documentId, setCurrentDocument]);

  const handleLoadComplete = (numberOfPages: number) => {
    setTotalPages(numberOfPages);
    setPdfReady(true);
  };

  const handlePageChanged = (page: number) => {
    setCurrentPage(page);
  };

  const goToPage = () => {
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (pdfRef.current) {
        pdfRef.current.setPage(page);
      }
    }
    setShowPageInput(false);
    setPageInput('');
  };

  const changePage = (delta: number) => {
    const newPage = Math.max(1, Math.min(totalPages, currentPage + delta));
    setCurrentPage(newPage);
    if (pdfRef.current) {
      pdfRef.current.setPage(newPage);
    }
  };

  const zoomIn = () => {
    setScale(s => Math.min(3.0, s + 0.25));
  };

  const zoomOut = () => {
    setScale(s => Math.max(0.5, s - 0.25));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  if (!bootComplete) {
    return (
      <View style={[styles.bootWrapper, { paddingTop: insets.top }]}>
        <StatusBarFallback />
        <BootSequence
          filename={documentId || 'DOCUMENT.PDF'}
          onComplete={() => setBootComplete(true)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Scanlines />

      {/* Terminal Status Bar */}
      <TerminalStatusBar
        filename={currentDocument?.filename || 'DOCUMENT.PDF'}
        currentPage={currentPage}
        totalPages={totalPages}
        paddingTop={insets.top}
      />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.asciiBorderTop}>╔══════════════════════════╗</Text>
          <Text style={styles.title} numberOfLines={1}>
            {currentDocument?.filename || 'PDF'}
          </Text>
          <Text style={styles.asciiBorderBottom}>╚══════════════════════════╝</Text>
        </View>

        <TouchableOpacity onPress={resetZoom} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>⟲</Text>
        </TouchableOpacity>
      </View>

      {/* PDF View with ASCII Frame */}
      <View style={styles.pdfContainer}>
        <View style={styles.asciiFrameTop}>
          <Text style={styles.asciiFrameText}>╔═══════════════════════════════════════════════════════════════╗</Text>
        </View>
        <View style={styles.pdfWrapper}>
          <View style={styles.asciiFrameSideLeft}>
            <Text style={styles.asciiFrameText}>║</Text>
          </View>
          <View style={styles.pdfInner}>
            {!pdfReady ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.amber.primary} />
                <Text style={styles.loadingText}>LOADING PAGES...</Text>
              </View>
            ) : (
              <Pdf
                ref={pdfRef}
                source={{ uri }}
                style={[styles.pdf, { transform: [{ scale }] }]}
                onLoadComplete={handleLoadComplete}
                onPageChanged={handlePageChanged}
                trustAllCerts={false}
                spacing={10}
                fitPolicy={0}
                enablePaging
                page={currentPage}
              />
            )}
          </View>
          <View style={styles.asciiFrameSideRight}>
            <Text style={styles.asciiFrameText}>║</Text>
          </View>
        </View>
        <View style={styles.asciiFrameBottom}>
          <Text style={styles.asciiFrameText}>╚═══════════════════════════════════════════════════════════════╝</Text>
        </View>
      </View>

      {/* Terminal Toolbar */}
      <View style={styles.toolbar}>
        {/* Page Navigation - Terminal Style */}
        <View style={styles.terminalNav}>
          <Text style={styles.terminalPrompt}>PAGE_NAV{'>'}</Text>

          <TerminalButton
            onPress={() => changePage(-1)}
            disabled={currentPage <= 1}
          >
            [◄ PREV]
          </TerminalButton>

          <TerminalButton onPress={() => setShowPageInput(true)}>
            [{currentPage}/{totalPages || '?'}]
          </TerminalButton>

          <TerminalButton
            onPress={() => changePage(1)}
            disabled={currentPage >= totalPages}
          >
            [NEXT ►]
          </TerminalButton>
        </View>

        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={zoomOut} activeOpacity={0.7}>
            <Text style={styles.zoomButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.zoomText}>{Math.round(scale * 100)}%</Text>
          <TouchableOpacity style={styles.zoomButton} onPress={zoomIn} activeOpacity={0.7}>
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Page Input Modal - Terminal Style */}
      {showPageInput && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>╔══════════════╗</Text>
            <Text style={styles.modalTitle}>║ ENTER PAGE   ║</Text>
            <Text style={styles.modalTitle}>╚══════════════╝</Text>
            <TextInput
              style={styles.pageInput}
              value={pageInput}
              onChangeText={setPageInput}
              keyboardType="number-pad"
              placeholder={`1-${totalPages}`}
              placeholderTextColor={Colors.amber.dim}
              autoFocus
              onSubmitEditing={goToPage}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setShowPageInput(false);
                  setPageInput('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>[CANCEL]</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonOk} onPress={goToPage} activeOpacity={0.7}>
                <Text style={styles.modalButtonText}>[GO]</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalHint}>PRESS ENTER TO CONFIRM</Text>
          </View>
        </View>
      )}

      {/* CRT Vignette Effect */}
      <View style={styles.vignette} pointerEvents="none" />
    </View>
  );
};

// Fallback StatusBar for boot screen
const StatusBarFallback = () => {
  return null; // expo-status-bar handled by layout
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  bootWrapper: {
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
  statusText: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.amber.primary,
    lineHeight: 16,
  },
  modeText: {
    fontWeight: 'bold',
    color: Colors.amber.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.gray[100],
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.dim,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.amber.bg,
    borderWidth: 1,
    borderColor: Colors.amber.secondary,
  },
  backButtonText: {
    fontSize: 20,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 20,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  asciiBorderTop: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.amber.dim,
    letterSpacing: -1,
  },
  asciiBorderBottom: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.amber.dim,
    letterSpacing: -1,
  },
  title: {
    fontFamily: Typography.family.mono,
    fontSize: 16,
    color: Colors.amber.primary,
    fontWeight: 'bold',
    paddingHorizontal: Spacing.xs,
    lineHeight: 20,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  asciiFrameTop: {
    backgroundColor: Colors.black,
    paddingVertical: 0,
    alignItems: 'center',
  },
  asciiFrameBottom: {
    backgroundColor: Colors.black,
    paddingVertical: 0,
    alignItems: 'center',
  },
  asciiFrameText: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.amber.dim,
    letterSpacing: -2,
    lineHeight: 10,
  },
  pdfWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.black,
  },
  asciiFrameSideLeft: {
    width: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  asciiFrameSideRight: {
    width: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  pdfInner: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
  },
  pdf: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'column',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.gray[100],
    borderTopWidth: 2,
    borderTopColor: Colors.amber.secondary,
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  terminalNav: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  terminalPrompt: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.amber.secondary,
    minWidth: 85,
    lineHeight: 16,
  },
  terminalButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    borderRadius: 2,
  },
  terminalButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.amber.primary,
    lineHeight: 16,
  },
  terminalButtonDisabled: {
    color: Colors.gray[400],
  },
  terminalButtonDisabledBg: {
    backgroundColor: Colors.gray[200],
    borderColor: Colors.gray[400],
    opacity: 0.6,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  zoomButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.amber.bg,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    borderRadius: 2,
  },
  zoomButtonText: {
    fontSize: 18,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  zoomText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[300],
    minWidth: 45,
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.black,
    borderWidth: 2,
    borderColor: Colors.amber.primary,
    padding: Spacing.lg,
    width: '85%',
    maxWidth: 320,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 14,
  },
  pageInput: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.lg,
    color: Colors.amber.primary,
    backgroundColor: Colors.gray[100],
    borderWidth: 2,
    borderColor: Colors.amber.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    textAlign: 'center',
    minWidth: 120,
    letterSpacing: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: Colors.gray[200],
    borderWidth: 1,
    borderColor: Colors.gray[400],
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  modalButtonOk: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: Colors.amber.bg,
    borderWidth: 1,
    borderColor: Colors.amber.secondary,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    shadowColor: Colors.amber.glow,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    elevation: 2,
  },
  modalButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  modalHint: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[400],
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 80,
  },
  bootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
    padding: Spacing.lg,
  },
  bootContent: {
    marginBottom: Spacing.xl,
    alignItems: 'flex-start',
    width: '100%',
  },
  bootText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    marginBottom: 6,
  },
  progressContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  progressBarBg: {
    height: 6,
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
  asciiBorder: {
    marginTop: Spacing.md,
  },
  asciiText: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.amber.dim,
    lineHeight: 12,
    letterSpacing: -2,
  },
});
