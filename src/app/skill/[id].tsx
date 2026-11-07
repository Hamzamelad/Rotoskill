import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Card, Chip, Label, Muted, Row, Screen, Title } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { newId } from '@/lib/id';
import { useActions, useData } from '@/lib/store';
import { DRILL_TYPE_LABEL, METRIC_KIND_LABEL } from '@/lib/stats';
import { SKILL_COLORS } from '@/lib/templates';
import type { Drill, DrillType, Metric, MetricKind, Skill } from '@/lib/types';

const DRILL_TYPES: DrillType[] = ['record', 'write', 'timed', 'log'];
const METRIC_KINDS: MetricKind[] = ['scale', 'count', 'boolean', 'duration'];
const DURATIONS = [60, 120, 180, 300, 600];

/** The practice pack editor: principles, drills and the review checklist. */
export default function SkillPackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = useData();
  const actions = useActions();
  const skill = data.skills.find((s) => s.id === id);

  if (!skill) {
    return (
      <Screen>
        <Title>Skill not found</Title>
        <Button title="Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  const update = (fn: (s: Skill) => Skill) => actions.updateSkill(skill.id, fn);
  const updateDrill = (drillId: string, patch: Partial<Drill>) =>
    update((s) => ({ ...s, drills: s.drills.map((d) => (d.id === drillId ? { ...d, ...patch } : d)) }));
  const updateMetric = (metricId: string, patch: Partial<Metric>) =>
    update((s) => ({ ...s, metrics: s.metrics.map((m) => (m.id === metricId ? { ...m, ...patch } : m)) }));

  const confirmDelete = () =>
    Alert.alert(`Delete ${skill.name}?`, 'Its reps and recordings will be removed too.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          actions.deleteSkill(skill.id);
          router.back();
        },
      },
    ]);

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        <Button
          title="Start practicing"
          color={skill.color}
          onPress={() => {
            actions.setActiveSkill(skill.id);
            router.dismissTo('/');
          }}
        />
      }>
      <Row>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <Text style={{ fontSize: 20, color: C.ink }}>‹</Text>
        </Pressable>
        <TextInput
          accessibilityLabel="Skill name"
          value={skill.name}
          onChangeText={(name) => update((s) => ({ ...s, name }))}
          style={styles.nameInput}
        />
      </Row>

      <Row style={{ gap: S.sm }}>
        {SKILL_COLORS.map((c) => (
          <Pressable
            key={c}
            accessibilityRole="radio"
            accessibilityLabel={`Color ${c}`}
            accessibilityState={{ checked: skill.color === c }}
            onPress={() => update((s) => ({ ...s, color: c }))}
            style={[styles.color, { backgroundColor: c }, skill.color === c && styles.colorOn]}
          />
        ))}
      </Row>

      {/* Principles */}
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label>Principles</Label>
          <Button
            title="+ Add"
            variant="ghost"
            onPress={() => update((s) => ({ ...s, principles: [...s.principles, { id: newId('pr_'), text: '' }] }))}
          />
        </Row>
        {skill.principles.length === 0 ? <Muted>Short rules you want to remember while practicing.</Muted> : null}
        {skill.principles.map((p, i) => (
          <Row key={p.id} style={styles.item}>
            <Text style={styles.num}>{i + 1}</Text>
            <TextInput
              accessibilityLabel={`Principle ${i + 1}`}
              value={p.text}
              placeholder="e.g. One main point"
              placeholderTextColor={C.muted}
              onChangeText={(text) =>
                update((s) => ({ ...s, principles: s.principles.map((x) => (x.id === p.id ? { ...x, text } : x)) }))
              }
              style={styles.inlineInput}
            />
            <RemoveButton
              label={`Remove principle ${i + 1}`}
              onPress={() => update((s) => ({ ...s, principles: s.principles.filter((x) => x.id !== p.id) }))}
            />
          </Row>
        ))}
      </Card>

      {/* Drills */}
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label>Drills</Label>
          <Button
            title="+ Add"
            variant="ghost"
            onPress={() =>
              update((s) => ({
                ...s,
                drills: [
                  ...s.drills,
                  { id: newId('dr_'), name: 'New drill', description: '', type: 'timed', durationSec: 120, prompts: [] },
                ],
              }))
            }
          />
        </Row>
        {skill.drills.map((d) => (
          <View key={d.id} style={styles.block}>
            <Row>
              <TextInput
                accessibilityLabel="Drill name"
                value={d.name}
                onChangeText={(name) => updateDrill(d.id, { name })}
                style={[styles.inlineInput, { fontWeight: '600' }]}
              />
              <RemoveButton
                label={`Remove drill ${d.name}`}
                onPress={() => update((s) => ({ ...s, drills: s.drills.filter((x) => x.id !== d.id) }))}
              />
            </Row>
            <TextInput
              accessibilityLabel="Drill instructions"
              value={d.description}
              placeholder="What to do in one rep"
              placeholderTextColor={C.muted}
              multiline
              onChangeText={(description) => updateDrill(d.id, { description })}
              style={styles.desc}
            />
            <Row style={styles.wrap}>
              {DRILL_TYPES.map((t) => (
                <Chip
                  key={t}
                  label={DRILL_TYPE_LABEL[t]}
                  selected={d.type === t}
                  color={skill.color}
                  onPress={() => updateDrill(d.id, { type: t })}
                />
              ))}
            </Row>
            <Row style={styles.wrap}>
              {DURATIONS.map((sec) => (
                <Chip
                  key={sec}
                  label={sec < 60 ? `${sec}s` : `${sec / 60} min`}
                  selected={d.durationSec === sec}
                  color={skill.color}
                  onPress={() => updateDrill(d.id, { durationSec: sec })}
                />
              ))}
            </Row>
            <TextInput
              accessibilityLabel="Prompts, one per line"
              value={d.prompts.join('\n')}
              placeholder="Prompts, one per line (optional)"
              placeholderTextColor={C.muted}
              multiline
              onChangeText={(v) => updateDrill(d.id, { prompts: v.split('\n') })}
              onEndEditing={() => updateDrill(d.id, { prompts: d.prompts.map((p) => p.trim()).filter(Boolean) })}
              style={styles.desc}
            />
          </View>
        ))}
      </Card>

      {/* Review checklist */}
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label>Review checklist</Label>
          <Button
            title="+ Add"
            variant="ghost"
            onPress={() =>
              update((s) => ({
                ...s,
                metrics: [...s.metrics, { id: newId('me_'), name: 'New metric', kind: 'scale', higherIsBetter: true }],
              }))
            }
          />
        </Row>
        <Muted>How you score each rep. Any skill can be measured with these four types.</Muted>
        {skill.metrics.map((m) => (
          <View key={m.id} style={styles.block}>
            <Row>
              <TextInput
                accessibilityLabel="Metric name"
                value={m.name}
                onChangeText={(name) => updateMetric(m.id, { name })}
                style={[styles.inlineInput, { fontWeight: '600' }]}
              />
              <RemoveButton
                label={`Remove metric ${m.name}`}
                onPress={() => update((s) => ({ ...s, metrics: s.metrics.filter((x) => x.id !== m.id) }))}
              />
            </Row>
            <Row style={styles.wrap}>
              {METRIC_KINDS.map((k) => (
                <Chip
                  key={k}
                  label={METRIC_KIND_LABEL[k]}
                  selected={m.kind === k}
                  color={skill.color}
                  onPress={() =>
                    updateMetric(m.id, { kind: k, higherIsBetter: k === 'count' || k === 'duration' ? false : true })
                  }
                />
              ))}
            </Row>
            {m.kind === 'count' || m.kind === 'duration' ? (
              <Row style={styles.wrap}>
                <Chip
                  label="Lower is better"
                  selected={!m.higherIsBetter}
                  color={skill.color}
                  onPress={() => updateMetric(m.id, { higherIsBetter: false })}
                />
                <Chip
                  label="Higher is better"
                  selected={m.higherIsBetter}
                  color={skill.color}
                  onPress={() => updateMetric(m.id, { higherIsBetter: true })}
                />
              </Row>
            ) : null}
          </View>
        ))}
      </Card>

      <Button title="Delete skill" variant="ghost" color={C.danger} onPress={confirmDelete} />
    </Screen>
  );
}

function RemoveButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.remove}>
      <Text style={{ color: C.muted, fontSize: 16 }}>✕</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: {
    width: 44,
    height: 44,
    borderRadius: R.pill,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameInput: { flex: 1, fontSize: 24, fontWeight: '700', color: C.ink, minHeight: 44 },
  color: { width: 32, height: 32, borderRadius: 16 },
  colorOn: { borderWidth: 3, borderColor: C.card, outlineWidth: 2, outlineColor: C.ink },
  item: { borderTopWidth: 1, borderTopColor: C.divider, paddingTop: S.sm },
  num: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: C.accentSoft,
    color: C.accent,
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 24,
    overflow: 'hidden',
  },
  inlineInput: { flex: 1, fontSize: 15, color: C.ink, minHeight: 44 },
  remove: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  block: { borderTopWidth: 1, borderTopColor: C.divider, paddingTop: S.sm, gap: S.sm },
  desc: {
    backgroundColor: C.bg,
    borderRadius: R.sm,
    padding: S.md,
    fontSize: 14,
    color: C.ink,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  wrap: { flexWrap: 'wrap', gap: S.sm },
});
