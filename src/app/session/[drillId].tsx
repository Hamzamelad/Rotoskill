import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { C, R, S } from '@/constants/theme';
import { useActions, useData } from '@/lib/store';
import { formatDuration, pickPrompt, principleOfTheDay } from '@/lib/stats';

const RECORDING_OPTIONS = { ...RecordingPresets.HIGH_QUALITY, directory: 'document' as const };

export default function SessionScreen() {
  const { drillId, skillId } = useLocalSearchParams<{ drillId: string; skillId: string }>();
  const data = useData();
  const actions = useActions();
  const skill = data.skills.find((s) => s.id === skillId);
  const drill = skill?.drills.find((d) => d.id === drillId);

  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const recState = useAudioRecorderState(recorder);

  const [prompt, setPrompt] = useState(() => (drill ? pickPrompt(drill) : undefined));
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [text, setText] = useState('');
  const startedAt = useRef<number | null>(null);
  const finishing = useRef(false);

  const isRecord = drill?.type === 'record';
  const target = drill?.durationSec ?? 60;

  useEffect(() => {
    if (!isRecord) return;
    (async () => {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) Alert.alert('Microphone needed', 'Allow microphone access to record your reps.');
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    })();
  }, [isRecord]);

  // Wall-clock timer for non-recording drills (recordings use the recorder's own clock).
  useEffect(() => {
    if (!running || isRecord) return;
    const t = setInterval(() => {
      if (startedAt.current) setElapsed((Date.now() - startedAt.current) / 1000);
    }, 250);
    return () => clearInterval(t);
  }, [running, isRecord]);

  const seconds = isRecord ? recState.durationMillis / 1000 : elapsed;

  const start = async () => {
    startedAt.current = Date.now();
    setElapsed(0);
    if (isRecord) {
      await recorder.prepareToRecordAsync();
      recorder.record();
    }
    setRunning(true);
  };

  const finish = async () => {
    if (!skill || !drill || finishing.current) return;
    finishing.current = true;
    let audioUri: string | undefined;
    let duration = seconds;
    if (isRecord && running) {
      duration = recState.durationMillis / 1000;
      await recorder.stop();
      audioUri = recorder.uri ?? undefined;
    }
    setRunning(false);
    const rep = {
      ...actions.startRep(skill.id, drill, prompt),
      startedAt: startedAt.current ?? Date.now(),
      durationSec: Math.round(duration),
      audioUri,
      text: drill.type === 'write' ? text : undefined,
    };
    actions.saveRep(rep);
    router.replace({ pathname: '/review/[repId]', params: { repId: rep.id } });
  };

  // Recordings stop on their own at the target length.
  useEffect(() => {
    if (isRecord && running && seconds >= target) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecord, running, seconds, target]);

  const cancel = async () => {
    if (isRecord && running) await recorder.stop();
    router.back();
  };

  if (!skill || !drill) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.prompt}>This drill no longer exists.</Text>
        <Pressable onPress={() => router.back()} style={styles.secondary}>
          <Text style={styles.secondaryText}>Close</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const principle = principleOfTheDay(skill);
  const progress = Math.min(1, seconds / target);
  const over = seconds > target;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="End session" onPress={cancel} style={styles.round}>
          <Text style={styles.roundText}>✕</Text>
        </Pressable>
        <Text style={styles.topText}>{skill.name}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={{ gap: S.sm }}>
        <Text style={styles.label}>{drill.name.toUpperCase()}</Text>
        <Text style={styles.prompt}>{prompt ?? drill.description}</Text>
        {prompt ? <Text style={styles.desc}>{drill.description}</Text> : null}
        {!running && drill.prompts.length > 1 ? (
          <Pressable accessibilityRole="button" onPress={() => setPrompt(pickPrompt(drill))} style={styles.link}>
            <Text style={styles.linkText}>New prompt</Text>
          </Pressable>
        ) : null}
      </View>

      {principle ? (
        <View style={styles.reminder}>
          <Text style={styles.reminderText}>{principle.text}</Text>
        </View>
      ) : null}

      <View style={styles.center}>
        {drill.type === 'write' && running ? (
          <TextInput
            multiline
            autoFocus
            value={text}
            onChangeText={setText}
            placeholder="Write here…"
            placeholderTextColor={C.mutedOnDark}
            style={styles.input}
            accessibilityLabel="Your answer"
          />
        ) : (
          <View style={{ alignItems: 'center', gap: S.md }}>
            <Text style={[styles.timer, over && { color: '#FF8A80' }]}>{formatDuration(seconds)}</Text>
            <Text style={styles.desc}>
              {running ? (over ? 'Over time' : `${formatDuration(target - seconds)} left`) : `Target ${formatDuration(target)}`}
            </Text>
          </View>
        )}
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: skill.color }]} />
        </View>
        {isRecord && running ? <Text style={styles.recording}>● Recording</Text> : null}
      </View>

      <View style={{ gap: S.sm }}>
        {running ? (
          <Pressable accessibilityRole="button" onPress={finish} style={[styles.primary, { backgroundColor: '#FFFFFF' }]}>
            <Text style={[styles.primaryText, { color: C.ink }]}>{isRecord ? 'Stop & review' : 'Done, review'}</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={start}
            style={[styles.primary, { backgroundColor: skill.color }]}>
            <Text style={styles.primaryText}>{isRecord ? 'Start recording' : 'Start'}</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.ink, padding: S.xl, gap: S.xl },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  round: {
    width: 44,
    height: 44,
    borderRadius: R.pill,
    backgroundColor: C.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundText: { color: '#FFFFFF', fontSize: 16 },
  topText: { color: '#C9CEDA', fontSize: 13, fontWeight: '500' },
  label: { color: C.mutedOnDark, fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  prompt: { color: '#FFFFFF', fontSize: 28, fontWeight: '600', lineHeight: 34 },
  desc: { color: C.mutedOnDark, fontSize: 14, lineHeight: 20 },
  link: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  linkText: { color: '#9DB3F5', fontSize: 14, fontWeight: '600' },
  reminder: { backgroundColor: C.inkSoft, borderRadius: R.md, padding: S.md },
  reminderText: { color: '#DDE1E8', fontSize: 14 },
  center: { flex: 1, justifyContent: 'center', gap: S.xl },
  timer: { color: '#FFFFFF', fontSize: 64, fontWeight: '600', fontVariant: ['tabular-nums'] },
  bar: { height: 8, borderRadius: 4, backgroundColor: C.inkSoft, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  recording: { color: '#FF8A80', fontWeight: '600', textAlign: 'center' },
  input: {
    flex: 1,
    maxHeight: 280,
    backgroundColor: C.inkSoft,
    borderRadius: R.md,
    padding: S.lg,
    color: '#FFFFFF',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  primary: { minHeight: 56, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  secondary: { minHeight: 52, borderRadius: R.md, backgroundColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
