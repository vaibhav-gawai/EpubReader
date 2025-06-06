import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Highlighter, StickyNote, Pen, Palette } from 'lucide-react-native';

interface AnnotationToolbarProps {
  currentMode: 'none' | 'highlight' | 'note' | 'draw';
  onModeChange: (mode: 'none' | 'highlight' | 'note' | 'draw') => void;
  onColorPicker: () => void;
  theme: any;
}

export default function AnnotationToolbar({
  currentMode,
  onModeChange,
  onColorPicker,
  theme,
}: AnnotationToolbarProps) {
  const tools = [
    { mode: 'highlight' as const, icon: Highlighter, label: 'Highlight' },
    { mode: 'note' as const, icon: StickyNote, label: 'Note' },
    { mode: 'draw' as const, icon: Pen, label: 'Draw' },
  ];

  return (
    <View style={styles.container}>
      {tools.map((tool) => (
        <TouchableOpacity
          key={tool.mode}
          style={[
            styles.toolButton,
            {
              backgroundColor: currentMode === tool.mode ? theme.accent : theme.surface,
              borderColor: theme.border,
            }
          ]}
          onPress={() => onModeChange(currentMode === tool.mode ? 'none' : tool.mode)}
        >
          <tool.icon
            size={18}
            color={currentMode === tool.mode ? 'white' : theme.textSecondary}
          />
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity
        style={[styles.toolButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={onColorPicker}
      >
        <Palette size={18} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});