import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { Canvas, Rect } from "@shopify/react-native-skia";
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLibraryStore } from "@/store/useLibraryStore";
import { Colors, Typography, Spacing } from "@/utils/theme";
import type { ViewMode, SortBy } from "@/types/pdf";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface LibraryScreenProps {
  onOpenPDF?: (uri: string, documentId: string) => void;
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
  paddingTop: number;
}

const TerminalStatusBar: React.FC<TerminalStatusBarProps> = ({
  paddingTop,
}) => {
  return (
    <View style={[styles.statusBar, { paddingTop }]}>
      <View style={styles.statusLeft}>
        <Text style={styles.statusText}>BELLEK: 62%</Text>
        <Text style={styles.statusText}>PİL: 78%</Text>
        <Text style={styles.statusText}>BAĞLANTI: AKTİF</Text>
      </View>
      <View style={styles.statusRight}>
        <Text style={[styles.statusText, styles.modeText]}>MOD: KÜTÜPHANE</Text>
      </View>
    </View>
  );
};

// Quick Boot Effect
const BootEffect: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timeout = setTimeout(onComplete, 600);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <View style={styles.bootContainer}>
      <Text style={styles.bootText}>{"> "}KÜTÜPHANE MODÜLÜ YÜKLENİYOR...</Text>
      <View style={styles.bootProgress}>
        <View style={styles.bootProgressFill} />
      </View>
    </View>
  );
};

export const LibraryScreen: React.FC<LibraryScreenProps> = ({ onOpenPDF }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    documents,
    folders,
    currentFolder,
    viewMode,
    sortBy,
    addDocument,
    setCurrentFolder,
    toggleFavorite,
    setViewMode,
    setSortBy,
  } = useLibraryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [bootComplete, setBootComplete] = useState(false);

  // Filter and sort documents
  const filteredDocs = documents
    .filter((doc) => {
      const matchesFolder =
        !currentFolder ||
        currentFolder === "root" ||
        currentFolder === "recent" ||
        currentFolder === "favorites" ||
        doc.folder === currentFolder;

      if (!matchesFolder) return false;

      if (currentFolder === "favorites") return doc.isFavorite;

      if (searchQuery) {
        return doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.filename.localeCompare(b.filename);
        case "date":
          return b.lastOpened.getTime() - a.lastOpened.getTime();
        case "size":
          return b.fileSize - a.fileSize;
        case "progress":
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

  const handleImportPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Store'a belge ekle
        addDocument({
          uri: file.uri,
          filename: file.name || 'Isimsiz.pdf',
          fileSize: file.size || 0,
          pageCount: 1, // PDF açıldığında güncellenecek
          currentPage: 1,
          bookmarks: [],
          annotations: [],
          notes: [],
          isFavorite: false,
          progress: 0,
        });

        Alert.alert('Başarılı', `"${file.name}" kütüphaneye eklendi.`);
      }
    } catch (error) {
      Alert.alert('Hata', 'Belge seçilirken bir hata oluştu.');
      console.error('Document picker error:', error);
    }
  };

  const handleOpenDocument = (doc: (typeof documents)[0]) => {
    if (onOpenPDF) {
      onOpenPDF(doc.uri, doc.id);
    } else {
      router.push({
        pathname: "/pdf-reader",
        params: { uri: doc.uri, id: doc.id },
      } as any);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!bootComplete) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <BootEffect onComplete={() => setBootComplete(true)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Scanlines />

      <TerminalStatusBar paddingTop={insets.top} />

      {/* ASCII Header */}
      <View style={styles.asciiHeader}>
        <Text style={styles.asciiHeaderText}>
          ╔════════════════════════════════════════╗
        </Text>
        <Text style={styles.asciiHeaderText}>
          ║   AKADEMİK BELGE KÜTÜPHANESİ v1.0    ║
        </Text>
        <Text style={styles.asciiHeaderText}>
          ╚════════════════════════════════════════╝
        </Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.importButton, { minHeight: 44 }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.importButtonText}>[← GERİ]</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.importButton, { minHeight: 44 }]}
          onPress={handleImportPDF}
          activeOpacity={0.7}
        >
          <Text style={styles.importButtonText}>[+EKLE]</Text>
        </TouchableOpacity>
      </View>

      {/* Terminal Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchPrompt}>ARAMA{">"}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="BELGE ARA..."
          placeholderTextColor={Colors.amber.dim}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Folders - Terminal Style */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.foldersScroll}
      >
        {folders.map((folder) => (
          <TouchableOpacity
            key={folder.id}
            style={[
              styles.folderButton,
              currentFolder === folder.id && styles.folderButtonActive,
            ]}
            onPress={() => setCurrentFolder(folder.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.folderButtonText,
                currentFolder === folder.id && styles.folderButtonTextActive,
              ]}
            >
              [{folder.name}]
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort/View controls - Terminal Style */}
      <View style={styles.controls}>
        <Text style={styles.controlsPrompt}>KOMUT{">"}</Text>
        <TouchableOpacity
          style={[styles.controlButton, { minHeight: 44 }]}
          onPress={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>
            [{viewMode === "list" ? "IZGARA" : "LİSTE"}]
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { minHeight: 44 }]}
          onPress={() => setSortBy(sortBy === "date" ? "name" : "date")}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>
            [SIRALA:{sortBy === "date" ? "TARİH" : "AD"}]
          </Text>
        </TouchableOpacity>
      </View>

      {/* ASCII Section Divider */}
      <View style={styles.asciiDivider}>
        <Text style={styles.asciiDividerText}>
          ══════════════════════════════════════════════════════
        </Text>
      </View>

      {/* Documents - ASCII Card Style */}
      <ScrollView
        style={styles.documents}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.md }}
      >
        {filteredDocs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.asciiEmpty}>┌────────────────────────────────────────┐</Text>
            <Text style={styles.asciiEmpty}>│                                        │</Text>
            <Text style={styles.asciiEmpty}>│        BELGE BULUNAMADI               │</Text>
            <Text style={styles.asciiEmpty}>│                                        │</Text>
            <Text style={styles.asciiEmpty}>│   BELGE EKLEMEK İÇİN [+EKLE] KULLANIN │</Text>
            <Text style={styles.asciiEmpty}>│                                        │</Text>
            <Text style={styles.asciiEmpty}>└────────────────────────────────────────┘</Text>
          </View>
        ) : (
          filteredDocs.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={styles.documentCard}
              onPress={() => handleOpenDocument(doc)}
              activeOpacity={0.7}
            >
              {/* ASCII Border */}
              <Text style={styles.asciiCardBorder}>
                ┌────────────────────────────────────────────┐
              </Text>

              <View style={styles.documentContent}>
                {/* File icon + name */}
                <View style={styles.documentHeader}>
                  <Text style={styles.fileIcon}>[PDF]</Text>
                  <View style={styles.documentTitleWrapper}>
                    <Text style={styles.documentTitle} numberOfLines={1}>
                      {doc.filename}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(doc.id)}
                    style={styles.favoriteButtonWrapper}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.favoriteButton}>
                      {doc.isFavorite ? "★" : "☆"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Meta info */}
                <View style={styles.documentMeta}>
                  <Text style={styles.metaText}>SAYFA:{doc.pageCount}</Text>
                  <Text style={styles.metaText}>
                    BOYUT:{formatFileSize(doc.fileSize)}
                  </Text>
                  <Text style={styles.metaText}>
                    {formatDate(doc.lastOpened)}
                  </Text>
                </View>

                {/* Progress Bar - Terminal Style */}
                {doc.progress > 0 && (
                  <View style={styles.progressWrapper}>
                    <Text style={styles.progressLabel}>OKUMA_İLERLEMESİ:</Text>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${doc.progress}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressPercent}>
                        {doc.progress}%
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <Text style={styles.asciiCardBorder}>
                └────────────────────────────────────────────┘
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* CRT Vignette Effect */}
      <View style={styles.vignette} pointerEvents="none" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  scanlineCanvas: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  scanlineFallback: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    pointerEvents: "none",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.secondary,
    backgroundColor: Colors.gray[100],
  },
  statusLeft: {
    flexDirection: "row",
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
    fontWeight: "bold",
    color: Colors.amber.secondary,
  },
  asciiHeader: {
    paddingVertical: Spacing.sm,
    alignItems: "center",
    backgroundColor: Colors.gray[100],
  },
  asciiHeaderText: {
    fontFamily: Typography.family.mono,
    fontSize: 14,
    color: Colors.amber.secondary,
    letterSpacing: -1,
    lineHeight: 18,
    opacity: 0.85,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.gray[100],
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.dim,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  backButton: {
    backgroundColor: Colors.black,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    justifyContent: "center",
  },
  backButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
  },
  title: {
    fontFamily: Typography.family.mono,
    fontSize: 16,
    color: Colors.amber.secondary,
    fontWeight: "bold",
    lineHeight: 20,
  },
  importButton: {
    backgroundColor: Colors.amber.bg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.amber.secondary,
    justifyContent: "center",
    minWidth: 100,
  },
  importButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.secondary,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.gray[100],
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.dim,
  },
  searchPrompt: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.secondary,
    marginRight: Spacing.sm,
    minWidth: 70,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 48,
    minHeight: 48,
  },
  foldersScroll: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.gray[100],
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.dim,
  },
  folderButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.xs,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    minHeight: 48,
    justifyContent: "center",
    minWidth: 48,
  },
  folderButtonActive: {
    backgroundColor: Colors.amber.bg,
    borderColor: Colors.amber.secondary,
  },
  folderButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.gray[300],
    lineHeight: 16,
  },
  folderButtonTextActive: {
    color: Colors.amber.secondary,
    fontWeight: "bold",
  },
  controls: {
    flexDirection: "row",
    padding: Spacing.sm,
    gap: Spacing.xs,
    backgroundColor: Colors.gray[100],
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.dim,
  },
  controlsPrompt: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.secondary,
    marginRight: Spacing.xs,
    minWidth: 50,
    alignSelf: "center",
  },
  controlButton: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    minWidth: 48,
  },
  controlButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.primary,
  },
  asciiDivider: {
    paddingVertical: 2,
    backgroundColor: Colors.gray[100],
  },
  asciiDividerText: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.amber.dim,
    letterSpacing: -1,
    textAlign: "center",
  },
  documents: {
    flex: 1,
    backgroundColor: Colors.gray[100],
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
  },
  asciiEmpty: {
    fontFamily: Typography.family.mono,
    fontSize: 14,
    color: Colors.amber.primary,
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: "center",
  },
  documentCard: {
    backgroundColor: Colors.black,
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
    minHeight: 72,
  },
  asciiCardBorder: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.amber.dim,
    lineHeight: 10,
    letterSpacing: -2,
  },
  documentContent: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  fileIcon: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.secondary,
    marginRight: Spacing.xs,
  },
  documentTitleWrapper: {
    flex: 1,
  },
  documentTitle: {
    fontFamily: Typography.family.mono,
    fontSize: 16,
    color: Colors.amber.primary,
    fontWeight: "bold",
    lineHeight: 20,
  },
  favoriteButton: {
    fontSize: 16,
  },
  favoriteButtonWrapper: {
    padding: Spacing.xs,
  },
  documentMeta: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  metaText: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.gray[300],
    lineHeight: 16,
  },
  progressWrapper: {
    marginTop: Spacing.xs,
  },
  progressLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.gray[400],
    marginBottom: 2,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.gray[200],
    borderRadius: 1,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.amber.secondary,
  },
  progressPercent: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.amber.secondary,
    minWidth: 30,
  },
  vignette: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 70,
  },
  bootContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.black,
    padding: Spacing.lg,
  },
  bootText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    marginBottom: Spacing.md,
  },
  bootProgress: {
    width: 200,
    height: 4,
    backgroundColor: Colors.gray[200],
    borderRadius: 2,
    overflow: "hidden",
  },
  bootProgressFill: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.amber.primary,
  },
});
