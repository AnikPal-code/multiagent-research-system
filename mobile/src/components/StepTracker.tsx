import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, fonts, spacing, radius } from '../theme';
import type { StepKey } from '../api';

export type StepStatus = 'idle' | 'active' | 'done' | 'error';

export interface StepDef {
  key: StepKey;
  label: string;
  description: string;
}

export const STEP_DEFS: StepDef[] = [
  { key: 'search', label: 'SEARCH', description: 'Scanning the web for sources' },
  { key: 'read', label: 'READ', description: 'Scraping the strongest lead' },
  { key: 'write', label: 'WRITE', description: 'Drafting the report' },
  { key: 'critique', label: 'CRITIQUE', description: 'Scoring it honestly' },
];

function Node({ status }: { status: StepStatus }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'active') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.35, duration: 650, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 650, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(1);
  }, [status]);

  const color =
    status === 'done' ? colors.pulse : status === 'active' ? colors.accent : status === 'error' ? colors.error : colors.textFaint;
  const soft =
    status === 'done' ? colors.pulseSoft : status === 'active' ? colors.accentSoft : status === 'error' ? colors.errorSoft : 'transparent';

  return (
    <View style={styles.nodeWrap}>
      <Animated.View style={[styles.nodeHalo, { backgroundColor: soft, transform: [{ scale: pulse }] }]} />
      <View style={[styles.node, { borderColor: color, backgroundColor: status === 'idle' ? 'transparent' : color }]} />
    </View>
  );
}

export default function StepTracker({ statuses }: { statuses: Record<StepKey, StepStatus> }) {
  return (
    <View style={styles.row}>
      {STEP_DEFS.map((step, i) => {
        const status = statuses[step.key];
        const nextDone = i < STEP_DEFS.length - 1 && (status === 'done');
        return (
          <React.Fragment key={step.key}>
            <View style={styles.col}>
              <Node status={status} />
              <Text style={[styles.label, { color: status === 'idle' ? colors.textFaint : colors.text }]}>{step.label}</Text>
              <Text style={styles.desc}>{step.description}</Text>
            </View>
            {i < STEP_DEFS.length - 1 && (
              <View style={[styles.connector, { backgroundColor: nextDone ? colors.pulse : colors.border }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: spacing(2),
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  nodeWrap: {
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(1),
  },
  nodeHalo: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: radius.lg,
  },
  node: {
    width: 14,
    height: 14,
    borderRadius: radius.sm,
    borderWidth: 2,
  },
  connector: {
    height: 2,
    flex: 0.6,
    marginTop: 13,
    marginHorizontal: -4,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  desc: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 2,
  },
});
