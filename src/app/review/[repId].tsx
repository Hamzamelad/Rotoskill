import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AudioPlayer } from '@/components/audio-player';
import { MetricInput } from '@/components/metric-input';
import { Button, Card, Muted, Screen, Title } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { useActions, useData } from '@/lib/store';
import { formatDuration } from '@/lib/stats';

export default function ReviewScreen() {
  const { repId } = useLocalSearchParams<{ repId: string }>();
  const data = useData();
  const actions = useActions();
  const rep = data.reps.find((r) => r.id === repId);
  const skill = data.skills.find((s) => s.id === rep?.skillId);
  const drill = skill?.drills.find((d) => d.id === rep?.drillId);

  const [scores, setScores] = useState<Record<string, number>>(() => rep?.scores ?? {});
  const [note, setNote] = useState(rep?.note ?? '');

  if (!rep || !skill) {
    return (
      <Screen>
        <Title>Rep not found</Title>
        <Button title="Back to today" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const save = () => {
    const filled = { ...scores };
    // Duration metrics default to the rep length if left untouched.
    skill.metrics.forEach((m) => {
      if (m.kind === 'duration' && !(m.id in filled)) filled[m.id] = rep.durationSec;
      if (m.kind === 'count' && !(m.id in filled)) filled[m.id] = 0;
    });
    actions.saveRep({ ...rep, scores: filled, note: note.trim() || undefined, reviewed: true });
    router.replace('/progress');
  };

  const discard = () => {
    actions.deleteRep(rep.id);
    router.replace('/');
  };

  const repNumber = data.reps.filter((r) => r.skillId === skill.id && r.startedAt <= rep.startedAt).length;

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        <>
          <Button title="Save rep" variant="dark" onPress={save} />
          <Button title="Discard" variant="ghost" color={C.muted} onPress={discard} />
        </>
      }>
      <View style={{ gap: 2 }}>
        <Title style={{ fontSize: 24 }}>Review rep {repNumber}</Title>
        <Muted>
          {drill?.name ?? 'Drill'} · {formatDuration(rep.durationSec)}
        </Muted>
      </View>

      {rep.prompt ? (
        <Card>
          <Muted>Prompt</Muted>
          <Text style={styles.body}>{rep.prompt}</Text>
        </Card>
      ) : null}

      {rep.audioUri ? <AudioPlayer uri={rep.audioUri} color={skill.color} /> : null}

      {rep.text ? (
        <Card>
          <Muted>What you wrote</Muted>
          <Text style={styles.body}>{rep.text}</Text>
        </Card>
      ) : null}

      <Text style={styles.section}>Your checklist</Text>
      {skill.metrics.map((m) => (
        <Card key={m.id}>
          <View style={{ gap: 2 }}>
            <Text style={styles.metric}>{m.name}</Text>
            {m.hint ? <Muted>{m.hint}</Muted> : null}
          </View>
          <MetricInput
            metric={m}
            value={scores[m.id]}
            onChange={(v) => setScores((s) => ({ ...s, [m.id]: v }))}
            color={skill.color}
            defaultDuration={rep.durationSec}
          />
        </Card>
      ))}

      <View style={{ gap: 6 }}>
        <Text style={styles.section} nativeID="noteLabel">
          Next time, fix one thing
        </Text>
        <TextInput
          accessibilityLabelledBy="noteLabel"
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="e.g. Lead with the point"
          placeholderTextColor={C.muted}
          style={styles.note}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 13, fontWeight: '600', color: C.muted },
  metric: { fontSize: 15, fontWeight: '600', color: C.ink },
  body: { fontSize: 15, color: C.ink, lineHeight: 21 },
  note: {
    minHeight: 72,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    padding: S.md,
    fontSize: 15,
    color: C.ink,
    textAlignVertical: 'top',
  },
});
