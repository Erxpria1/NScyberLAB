import { useLocalSearchParams } from 'expo-router';
import { NoteEditor } from '@/components/notes';

export default function NoteEditorScreen() {
  const { noteId, documentId, page } = useLocalSearchParams<{
    noteId?: string;
    documentId?: string;
    page?: string;
  }>();

  return (
    <NoteEditor
      noteId={noteId}
      documentId={documentId}
      page={page ? parseInt(page, 10) : undefined}
    />
  );
}
