import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface ColorPickerProps {
  visible: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
  theme: any;
}

const COLORS = [
  { name: 'Yellow', value: '#FFE082' },
  { name: 'Orange', value: '#FFB74D' },
  { name: 'Pink', value: '#F48FB1' },
  { name: 'Purple', value: '#CE93D8' },
  { name: 'Blue', value: '#81C784' },
  { name: 'Green', value: '#A5D6A7' },
  { name: 'Red', value: '#EF9A9A' },
  { name: 'Cyan', value: '#80DEEA' },
];

export default function ColorPicker({
  visible,
  onClose,
  onColorSelect,
  theme,
}: ColorPickerProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
              Choose Color
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.colorsContainer}>
            <View style={styles.colorsGrid}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color.value}
                  style={[styles.colorButton, { backgroundColor: color.value }]}
                  onPress={() => onColorSelect(color.value)}
                >
                  <View style={styles.colorInner} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
  },
  closeButton: {
    fontSize: 16,
  },
  colorsContainer: {
    maxHeight: 200,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  colorInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});