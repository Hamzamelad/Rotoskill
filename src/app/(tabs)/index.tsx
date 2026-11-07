import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card, Label, Muted, Row, Screen, Title } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { useActiveSkill, useData } from '@/lib/store';
import { DRILL_TYPE_LABEL, drillOfTheDay, formatDuration, principleOfTheDay, repsForSkill, streak } from '@/lib/stats';
import type { Drill } from '@/lib/types';

export default function TodayScreen() {
  const data = useData();
  const skill = useActiveSkill();

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  if (!skill) {
    return (
      <Screen>
        <Muted>{today}</Muted>
        <Title>Today</Title>
        <Card>
          <Text style={styles.cardTitle}>Pick a skill to practice</Text>
          <Muted>Start from a template or build your own. It takes about a minute.</Muted>
          <Button title="Add your first skill" onPress={() => router.push('/skill/new')} />
        </Card>
      </Screen>
    );
  }

  const reps = repsForSkill(data.reps, skill.id);
  const days = streak(data.reps);
  const drill = drillOfTheDay(skill, reps);
  const principle = principleOfTheDay(skill);
  const others = skill.drills.filter((d) => d.id !== drill?.id);

  const start = (d: Drill) =>
    router.push({ pathname: '/session/[drillId]', params: { drillId: d.id, skillId: skill.id } });

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Muted>{today}</Muted>
          <Title>Today</Title>
        </View>
        <View style={styles.streak}>
          <Text style={styles.streakText}>{days}-day streak</Text>
        </View>
      </Row>

      <Pressable accessibilityRole="button" onPress={() => router.push('/skills')} style={styles.skillChip}>
        <View style={[styles.dot, { backgroundColor: skill.color }]} />
        <Text style={styles.skillChipText}>{skill.name}</Text>
        <Text style={styles.chev}>▾</Text>
      </Pressable>

      {drill ? (
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>
            TODAY&apos;S DRILL · {formatDuration(drill.durationSec)} · {DRILL_TYPE_LABEL[drill.type].toUpperCase()}
          </Text>
          <Text style={styles.heroTitle}>{drill.name}</Text>
          <Text style={styles.heroBody}>{drill.description}</Text>
          <Button title="Start rep" color={skill.color} onPress={() => start(drill)} />
        </View>
      ) : (
        <Card>
          <Text style={styles.cardTitle}>No drills yet</Text>
          <Button
            title="Add a drill"
            variant="secondary"
            onPress={() => router.push({ pathname: '/skill/[id]', params: { id: skill.id } })}
          />
        </Card>
      )}

      {principle ? (
        <Card style={{ flexDirection: 'row', gap: S.md }}>
          <View style={[styles.icon, { backgroundColor: C.accentSoft }]}>
            <Text style={{ color: C.accent, fontWeight: '700' }}>◎</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Label>Focus principle</Label>
            <Text style={styles.cardTitle}>{principle.text}</Text>
          </View>
        </Card>
      ) : null}

      {others.length > 0 ? (
        <View style={{ gap: S.sm }}>
          <Text style={styles.section}>More drills</Text>
          <Card style={{ padding: 0, gap: 0 }}>
            {others.map((d, i) => (
              <Pressable
                key={d.id}
                accessibilityRole="button"
                onPress={() => start(d)}
                style={[styles.listRow, i > 0 && { borderTopWidth: 1, borderTopColor: C.divider }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{d.name}</Text>
                  <Muted>
                    {DRILL_TYPE_LABEL[d.type]} · {formatDuration(d.durationSec)}
                  </Muted>
                </View>
                <Badge label="Start" />
              </Pressable>
            ))}
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  streak: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.pill,
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
  },
  streakText: { color: C.streak, fontWeight: '600', fontSize: 13 },
  skillChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  skillChipText: { fontSize: 14, fontWeight: '600', color: C.ink },
  chev: { color: C.muted, fontSize: 12 },
  hero: { backgroundColor: C.ink, borderRadius: R.xl, padding: S.xl, gap: S.md },
  heroLabel: { color: '#C9CEDA', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '600' },
  heroBody: { color: '#DDE1E8', fontSize: 14, lineHeight: 20 },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: C.ink },
  section: { fontSize: 13, fontWeight: '600', color: C.muted },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.lg, minHeight: 44 },
});
