import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../theme';
import StepTracker, { STEP_DEFS, StepStatus } from '../components/StepTracker';
import LogCard from '../components/LogCard';
import { runResearch, StepKey } from '../api';

import Constants from 'expo-constants';

// Reads from app.config.js's `extra.apiUrl` (which itself reads
// EXPO_PUBLIC_API_URL at build time) — this path is reliable across
// Expo web export versions, unlike relying on process.env directly
// in app code.
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:8000';

const initialStatuses: Record<StepKey, StepStatus> = {
  search: 'idle',
  read: 'idle',
  write: 'idle',
  critique: 'idle',
};

export default function HomeScreen() {
  const [topic, setTopic] = useState('');
  const [running, setRunning] = useState(false);
  const [statuses, setStatuses] = useState<Record<StepKey, StepStatus>>(initialStatuses);
  const [logs, setLogs] = useState<Record<StepKey, string>>({ search: '', read: '', write: '', critique: '' });
  const [report, setReport] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  const start = useCallback(() => {
    if (!topic.trim() || running) return;

    setRunning(true);
    setErrorMsg(null);
    setReport(null);
    setFeedback(null);
    setStatuses(initialStatuses);
    setLogs({ search: '', read: '', write: '', critique: '' });

    cancelRef.current = runResearch(API_BASE_URL, topic.trim(), {
      onStepStart: ({ step }) => {
        setStatuses((prev) => ({ ...prev, [step]: 'active' }));
      },
      onStepDone: ({ step, output }) => {
        setStatuses((prev) => ({ ...prev, [step]: 'done' }));
        setLogs((prev) => ({ ...prev, [step]: output }));
      },
      onComplete: ({ report, feedback }) => {
        setReport(report);
        setFeedback(feedback);
        setRunning(false);
      },
      onError: (message) => {
        setErrorMsg(message);
        setRunning(false);
        setStatuses((prev) => {
          const next = { ...prev };
          for (const k of Object.keys(next) as StepKey[]) {
            if (next[k] === 'active') next[k] = 'error';
          }
          return next;
        });
      },
    });
  }, [topic, running]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>MULTI-AGENT RESEARCH</Text>
          <Text style={styles.h1}>ResearchFlow AI</Text>
          <Text style={styles.sub}>Four agents run in sequence — search, read, write, critique.</Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter a research topic…"
            placeholderTextColor={colors.textFaint}
            value={topic}
            onChangeText={setTopic}
            editable={!running}
            onSubmitEditing={start}
            returnKeyType="go"
          />
          <Pressable
            style={[styles.button, (running || !topic.trim()) && styles.buttonDisabled]}
            onPress={start}
            disabled={running || !topic.trim()}
          >
            {running ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.buttonText}>RUN</Text>}
          </Pressable>
        </View>

        <View style={styles.trackerCard}>
          <StepTracker statuses={statuses} />
        </View>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {errorMsg}</Text>
          </View>
        )}

        {STEP_DEFS.map(
          (step) =>
            logs[step.key] !== '' && (
              <LogCard
                key={step.key}
                title={`${step.label} — OUTPUT`}
                body={logs[step.key]}
                tint={statuses[step.key] === 'done' ? colors.pulse : colors.accent}
              />
            )
        )}

        {report && (
          <View style={styles.reportCard}>
            <Text style={styles.reportTitle}>Report</Text>
            <Text style={styles.reportBody}>{report}</Text>
          </View>
        )}

        {feedback && (
          <View style={styles.critiqueCard}>
            <Text style={styles.critiqueTitle}>Critic Feedback</Text>
            <Text style={styles.reportBody}>{feedback}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing(3), paddingBottom: spacing(6) },
  header: { marginBottom: spacing(3) },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.accent,
    marginBottom: spacing(1),
  },
  h1: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing(0.5),
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing(1),
    marginBottom: spacing(3),
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing(2.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontFamily: fonts.mono,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.bg,
  },
  trackerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(1.5),
    marginBottom: spacing(3),
  },
  errorBox: {
    backgroundColor: colors.errorSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing(2),
    marginBottom: spacing(2),
  },
  errorText: {
    color: colors.error,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  reportCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(2.5),
    marginBottom: spacing(2),
  },
  critiqueCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderColor: colors.border,
    padding: spacing(2.5),
    marginBottom: spacing(2),
  },
  reportTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '800',
    color: colors.pulse,
    marginBottom: spacing(1),
  },
  critiqueTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '800',
    color: colors.accent,
    marginBottom: spacing(1),
  },
  reportBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
});