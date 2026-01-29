import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/utils/theme';

export default function PDFReaderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { uri, id } = useLocalSearchParams<{ uri?: string; id?: string }>();

  const handleClose = () => {
    router.back();
  };

  if (!uri || !id) {
    return null;
  }

  // Yerel dosyalar için hata mesajı göster
  const isLocalFile = uri.startsWith('file://') || uri.startsWith('/');
  
  if (isLocalFile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Text style={styles.backButtonText}>[← GERİ]</Text>
          </TouchableOpacity>
          <Text style={styles.title}>PDF GÖRÜNTÜLEYICI</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            ┌────────────────────────────────────────┐
          </Text>
          <Text style={styles.errorText}>
            │                                        │
          </Text>
          <Text style={styles.errorText}>
            │      YEREL PDF GÖRÜNTÜLENEMİYOR       │
          </Text>
          <Text style={styles.errorText}>
            │                                        │
          </Text>
          <Text style={styles.errorText}>
            │   WebView yerel dosyaları desteklemez  │
          </Text>
          <Text style={styles.errorText}>
            │                                        │
          </Text>
          <Text style={styles.errorText}>
            └────────────────────────────────────────┘
          </Text>
        </View>
      </View>
    );
  }

  // Online PDF'ler için Google Docs Viewer kullan
  const encodedUri = encodeURIComponent(uri);
  const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodedUri}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <Text style={styles.backButtonText}>[← GERİ]</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>PDF GÖRÜNTÜLEYICI</Text>
        <View style={styles.placeholder} />
      </View>

      {/* WebView PDF Viewer */}
      <WebView
        source={{ uri: viewerUrl }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.amber.primary} />
            <Text style={styles.loadingText}>PDF YÜKLENİYOR...</Text>
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error:', nativeEvent);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.gray[100],
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.secondary,
  },
  backButton: {
    backgroundColor: Colors.amber.bg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.amber.secondary,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  title: {
    fontFamily: Typography.family.mono,
    fontSize: 14,
    color: Colors.amber.primary,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 80,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.amber.primary,
    lineHeight: 16,
  },
});
