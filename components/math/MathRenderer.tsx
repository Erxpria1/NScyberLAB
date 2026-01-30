import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '@/utils/theme';
import { handleTurkishChars } from '@/utils/math/turkishShortcuts';

interface MathRendererProps {
  formula: string;
  displayMode?: boolean;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  style?: any;
}

/**
 * Unified Math Renderer using KaTeX via WebView
 * Provides consistent, high-fidelity rendering for engineering formulas
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  formula,
  displayMode = false,
  fontSize = 18,
  color = '#FFD700', // Default to arcade amber
  backgroundColor = 'transparent',
  style,
}) => {
  // Preprocess formula for Turkish characters
  const processedFormula = useMemo(() => {
    return handleTurkishChars(formula)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/`/g, '\\`');
  }, [formula]);

  const htmlContent = useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
      <style>
        body {
          margin: 0;
          padding: ${displayMode ? '16px 8px' : '4px 8px'};
          background-color: ${backgroundColor === 'transparent' ? 'rgba(0,0,0,0)' : backgroundColor};
          display: flex;
          justify-content: ${displayMode ? 'center' : 'flex-start'};
          align-items: center;
          overflow: hidden;
        }
        #formula {
          color: ${color};
          font-size: ${fontSize}px;
        }
        .katex {
          font-size: 1.1em;
          color: ${color};
        }
        .katex-display {
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div id="formula"></div>
      <script>
        try {
          katex.render('${processedFormula}', document.getElementById('formula'), {
            throwOnError: false,
            displayMode: ${displayMode}
          });
        } catch (e) {
          document.getElementById('formula').innerText = '${processedFormula}'.replace(/\\\\/g, '\\');
        }
      </script>
    </body>
    </html>
  `, [processedFormula, displayMode, fontSize, color, backgroundColor]);

  return (
    <View style={[styles.container, displayMode && styles.displayBlock, style]}>
      <WebView
        source={{ html: htmlContent }}
        style={[styles.webview, { backgroundColor: 'transparent' }]}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        autoManageStatusBarEnabled={false}
        startInLoadingState={true}
        renderLoading={() => <ActivityIndicator color={color} size="small" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 40,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  displayBlock: {
    minHeight: 80,
    width: '100%',
  },
  webview: {
    flex: 1,
    opacity: 0.99, // Workaround for some WebView rendering issues
  },
});

export default MathRenderer;
