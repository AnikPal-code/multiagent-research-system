import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../theme';

export default function LogCard({ title, body, tint = colors.textMuted }: { title: string; body: string; tint?: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.dot, { backgroundColor: tint }]} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <ScrollView style={styles.scroll} nestedScrollEnabled>
        <Text style={styles.body}>{body}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(2),
    marginBottom: spacing(2),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(1),
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: spacing(1),
  },
  title: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
    fontWeight: '700',
  },
  scroll: {
    maxHeight: 140,
  },
  body: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text,
  },
});
