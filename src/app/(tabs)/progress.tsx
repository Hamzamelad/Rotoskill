import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AudioPlayer } from '@/components/audio-player';
import { BarChart } from '@/components/bar-chart';
import { Button, Card, Muted, Row, Screen, Title } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { useActiveSkill, useData } from '@/lib/store';
import { average, formatMetricValue, metricSeries, repsForSkill, streak } from '@/lib/stats';
import type { Rep } from '@/lib/types';

export default function ProgressScreen() {
  const data = useData();
  const skill = useActiveSkill();

  if (!skill) {
    return (
      <Screen>
        <Title>Progress</Title>
        <Muted>Add a skill and do a few reps. Your trends show up here.</Muted>
        <Button title="Add a skill" onPress={() => router.push('/skill/new')} />
      </Screen>
    );
  }

  const reps = repsForSkill(data.reps, skill.id).filter((r) => r.reviewed);
  const main = skill.metrics[0];
  const mainAvg = main ? average(metricSeries(reps.slice(-5), main)) : null;
  const first = reps[0];
  const latest = reps.length > 1 ? reps[reps.length - 1] : undefined;

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Title>Progress</Title>
        <Row style={{ gap: S.sm }}>
          <View style={[styles.dot, { backgroundColor: skill.color }]} />
          <Text style={styles.skill}>{skill.name}</Text>
        </Row>
      </Row>

      <View style={styles.stats}>
        <Stat value={String(reps.length)} label="Reps done" />
        <Stat value={String(streak(data.reps))} label="Day streak" color={C.streak} />
        <Stat
          value={mainAvg === null || !main ? '–' : formatMetricValue(main, mainAvg)}
          label={main ? `${main.name}, last 5` : 'No metrics'}
        />
      </View>

      {reps.length === 0 ? (
        <Card>
          <Text style={styles.title}>No reviewed reps yet</Text>
          <Muted>Finish a rep and score it. Each metric gets its own trend here.</Muted>
          <Button title="Go practice" color={skill.color} onPress={() => router.push('/')} />
        </Card>
      ) : (
        skill.metrics.map((m) => {
          const series = metricSeries(reps, m);
          if (series.length === 0) return null;
          const max = m.kind === 'scale' ? 5 : m.kind === 'boolean' ? 1 : Math.max(...series);
          const firstV = series[0];
          const lastV = series[series.length - 1];
          const better = m.higherIsBetter ? lastV > firstV : lastV < firstV;
          return (
            <Card key={m.id}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={styles.title}>{m.name}</Text>
                <Text style={[styles.delta, { color: better ? C.good : C.muted }]}>
                  {formatMetricValue(m, firstV)} → {formatMetricValue(m, lastV)}
                </Text>
              </Row>
              <BarChart
                values={series}
                max={max}
                color={skill.color}
                label={`${m.name}: from ${formatMetricValue(m, firstV)} to ${formatMetricValue(m, lastV)}`}
              />
            </Card>
          );
        })
      )}

      {first && latest ? (
        <View style={styles.compare}>
          <Text style={[styles.title, { color: '#FFFFFF' }]}>First rep vs latest</Text>
          <CompareRep rep={first} label="Rep 1" color={skill.color} />
          <CompareRep rep={latest} label={`Rep ${reps.length}`} color={skill.color} />
        </View>
      ) : null}
    </Screen>
  );
}

function Stat({ value, label, color = C.ink }: { value: string; label: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function CompareRep({ rep, label, color }: { rep: Rep; label: string; color: string }) {
  const date = new Date(rep.startedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.compareLabel}>
        {label} · {date}
      </Text>
      {rep.audioUri ? (
        <AudioPlayer uri={rep.audioUri} color={color} />
      ) : rep.text ? (
        <Text style={styles.compareText} numberOfLines={3}>
          {rep.text}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { width: 8, height: 8, borderRadius: 4 },
  skill: { fontSize: 14, fontWeight: '600', color: C.ink },
  stats: { flexDirection: 'row', gap: S.sm },
  stat: {
    flex: 1,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    padding: S.md,
    gap: 2,
  },
  statValue: { fontSize: 24, fontWeight: '600' },
  statLabel: { fontSize: 12, color: C.muted },
  title: { fontSize: 15, fontWeight: '600', color: C.ink },
  delta: { fontSize: 12, fontWeight: '600' },
  compare: { backgroundColor: C.ink, borderRadius: R.lg, padding: S.lg, gap: S.md },
  compareLabel: { color: '#C9CEDA', fontSize: 13, fontWeight: '600' },
  compareText: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },
});
