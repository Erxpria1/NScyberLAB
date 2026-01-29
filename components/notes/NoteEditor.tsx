import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLibraryStore } from '@/store/useLibraryStore';
import { Colors, Typography, Spacing } from '@/utils/theme';
import { MarkdownParser, createElementConfig } from '@/utils/notes/markdownParser';
import { KatexRender } from '@/components/math';
import { preprocessTurkishLatex } from '@/utils/math/turkishShortcuts';
import type { Note } from '@/types/pdf';

interface NoteEditorProps {
  noteId?: string;
  documentId?: string;
  page?: number;
  onSave?: () => void;
  onClose?: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  noteId,
  documentId,
  page,
  onSave,
  onClose,
}) => {
  const { getNotesByDocument, addNote, updateNote } = useLibraryStore();
  const existingNotes = documentId ? getNotesByDocument(documentId) : [];
  const existingNote = noteId ? existingNotes.find(n => n.id === noteId) : undefined;

  const [content, setContent] = useState(existingNote?.content || '');
  const [tags, setTags] = useState<string[]>(existingNote?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  // Parse content for preview
  const parsed = useMemo(() => {
    return MarkdownParser.parse(content);
  }, [content]);

  const handleSave = () => {
    if (noteId) {
      updateNote(noteId, content, tags);
    } else {
      const newId = addNote({
        documentId,
        page,
        content,
        tags,
      });
    }
    onSave?.();
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const insertPattern = (pattern: string) => {
    setContent(content + pattern);
  };

  const renderPreview = () => {
    return createElementConfig(parsed.elements).map((el, index) => {
      const key = `${index}-${el.type}`;

      switch (el.type) {
        case 'formula':
          return (
            <View key={key} style={styles.formulaBox}>
              <KatexRender
                formula={preprocessTurkishLatex(el.content)}
                displayMode
                color={Colors.amber.secondary}
              />
            </View>
          );

        case 'highlight':
          return (
            <View key={key} style={styles.highlightBox}>
              <Text style={styles.highlightText}>{el.content}</Text>
            </View>
          );

        case 'definition':
          return (
            <View key={key} style={styles.definitionBox}>
              <Text style={styles.definitionText}>{el.content}</Text>
            </View>
          );

        case 'warning':
          return (
            <View key={key} style={styles.warningBox}>
              <Text style={styles.warningText}>⚠️ {el.content}</Text>
            </View>
          );

        case 'heading':
          return (
            <Text key={key} style={styles.heading}>
              {el.content.replace(/^#+\s*/, '')}
            </Text>
          );

        default:
          // Check for inline math
          const parts = el.content.split(/(\$[^$]+\$)/g);
          return (
            <Text key={key} style={styles.normalText}>
              {parts.map((part, i) => {
                if (part.startsWith('$') && part.endsWith('$')) {
                  const formula = preprocessTurkishLatex(part.slice(1, -1));
                  return <KatexRender key={i} formula={formula} color={Colors.amber.primary} />;
                }
                return <Text key={i}>{part}</Text>;
              })}
            </Text>
          );
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {existingNote ? 'Notu Düzenle' : 'Yeni Not'}
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>💾</Text>
        </TouchableOpacity>
      </View>

      {/* Toggle Edit/Preview */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !isPreview && styles.toggleButtonActive]}
          onPress={() => setIsPreview(false)}
        >
          <Text style={[styles.toggleButtonText, !isPreview && styles.toggleButtonTextActive]}>
            Düzenle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isPreview && styles.toggleButtonActive]}
          onPress={() => setIsPreview(true)}
        >
          <Text style={[styles.toggleButtonText, isPreview && styles.toggleButtonTextActive]}>
            Önizle
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick patterns */}
      {!isPreview && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.patternsScroll}>
          <TouchableOpacity
            style={styles.patternButton}
            onPress={() => insertPattern('::önemli::text::')}
          >
            <Text style={styles.patternButtonText}>Önemli</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.patternButton}
            onPress={() => insertPattern('::formül::$formül$::')}
          >
            <Text style={styles.patternButtonText}>Formül</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.patternButton}
            onPress={() => insertPattern('::tanım::text::')}
          >
            <Text style={styles.patternButtonText}>Tanım</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.patternButton}
            onPress={() => insertPattern('::uyarı::text::')}
          >
            <Text style={styles.patternButtonText}>Uyarı</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Content */}
      {isPreview ? (
        <ScrollView style={styles.content} contentContainerStyle={styles.previewContent}>
          {parsed.elements.length === 0 ? (
            <Text style={styles.placeholder}>Henüz içerik yok</Text>
          ) : (
            renderPreview()
          )}
        </ScrollView>
      ) : (
        <TextInput
          style={styles.editor}
          multiline
          value={content}
          onChangeText={setContent}
          placeholder="Notunuzu yazın... Markdown++ desteklenir"
          placeholderTextColor={Colors.amber.dim}
          textAlignVertical="top"
          autoCapitalize="none"
        />
      )}

      {/* Tags */}
      <View style={styles.tagsSection}>
        <View style={styles.tagsInputRow}>
          <TextInput
            style={styles.tagInput}
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="Etiket ekle..."
            placeholderTextColor={Colors.amber.dim}
            onSubmitEditing={addTag}
          />
          <TouchableOpacity style={styles.addButton} onPress={addTag}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tagsList}>
          {tags.map(tag => (
            <TouchableOpacity key={tag} style={styles.tag} onPress={() => removeTag(tag)}>
              <Text style={styles.tagText}>@{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.dim,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 18,
    color: Colors.amber.secondary,
  },
  title: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  toggleButton: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    borderRadius: 4,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.amber.bg,
    borderColor: Colors.amber.secondary,
  },
  toggleButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[300],
  },
  toggleButtonTextActive: {
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  patternsScroll: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.dim,
  },
  patternButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.xs,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    borderRadius: 4,
  },
  patternButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs - 1,
    color: Colors.amber.primary,
  },
  content: {
    flex: 1,
  },
  editor: {
    flex: 1,
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    backgroundColor: Colors.gray[100],
    padding: Spacing.md,
    textAlignVertical: 'top',
  },
  previewContent: {
    padding: Spacing.md,
  },
  placeholder: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.gray[400],
    textAlign: 'center',
    marginTop: Spacing.xl * 2,
  },
  formulaBox: {
    backgroundColor: Colors.gray[100],
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    borderRadius: 4,
    alignItems: 'center',
  },
  highlightBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  highlightText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
  },
  definitionBox: {
    backgroundColor: Colors.gray[200],
    borderLeftWidth: 4,
    borderLeftColor: Colors.status.info,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  definitionText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.gray[300],
  },
  warningBox: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: Colors.status.error,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  warningText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: '#F44336',
  },
  heading: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
    marginTop: Spacing.sm,
  },
  normalText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.gray[300],
    lineHeight: 22,
    marginVertical: 2,
  },
  tagsSection: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.amber.dim,
  },
  tagsInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tagInput: {
    flex: 1,
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    borderRadius: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  addButton: {
    width: 36,
    height: 36,
    backgroundColor: Colors.amber.primary,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    color: Colors.black,
    fontWeight: 'bold',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: Colors.amber.bg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs - 1,
    color: Colors.amber.secondary,
  },
});
