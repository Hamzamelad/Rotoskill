import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Muted, Row, Screen, Title } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { useActions, useActiveSkill, useData } from '@/lib/store';
import { repsForSkill } from '@/lib/stats';
import { TEMPLATES, skillFromTemplate } from '@/lib/templates';

export default function SkillsScreen() {
  const data = useData();
  const active = useActiveSkill();
  const actions = useActions();

  const usedTemplates = new Set(data.skills.map((s) => s.templateId));
  const templates = TEMPLATES.filter((t) => !usedTemplates.has(t.id));

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Title>Skills</Title>
        <Button title="+ New skill" style={{ minHeight: 44 }} onPress={() => router.push('/skill/new')} />
      </Row>

      {data.skills.length > 0 ? <Text style={styles.section}>Your skills</Text> : null}
      {data.skills.map((s) => {
        const isActive = s.id === active?.id;
        const count = repsForSkill(data.reps, s.id).length;
        return (
          <Pressable
            key={s.id}
            accessibilityRole="button"
            accessibilityHint="Makes this the skill you practice today"
            onPress={() => actions.setActiveSkill(s.id)}
            onLongPress={() => router.push({ pathname: '/skill/[id]', params: { id: s.id } })}
            style={[styles.skill, { borderColor: isActive ? s.color : C.border, borderWidth: isActive ? 2 : 1 }]}>
            <View style={[styles.swatch, { backgroundColor: s.color }]} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.name}>{s.name}</Text>
              <Muted>
                {count} reps · {s.drills.length} drills · {s.metrics.length} metrics
              </Muted>
            </View>
            {isActive ? <Badge label="Active" color={s.color} bg={C.accentSoft} /> : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${s.name}`}
              onPress={() => router.push({ pathname: '/skill/[id]', params: { id: s.id } })}
              style={styles.edit}>
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </Pressable>
        );
      })}

      {templates.length > 0 ? (
        <>
          <Text style={styles.section}>Start from a template</Text>
          <View style={styles.grid}>
            {templates.map((t) => (
              <Pressable
                key={t.id}
                accessibilityRole="button"
                onPress={() => {
                  const skill = skillFromTemplate(t);
                  actions.addSkill(skill);
                  router.push({ pathname: '/skill/[id]', params: { id: skill.id } });
                }}
                style={styles.template}>
                <View style={[styles.swatch, { backgroundColor: t.color, width: 24, height: 6 }]} />
                <Text style={styles.name}>{t.name}</Text>
                <Muted>{t.summary}</Muted>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 13, fontWeight: '600', color: C.muted },
  skill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.lg,
  },
  swatch: { width: 12, height: 12, borderRadius: 6 },
  name: { fontSize: 16, fontWeight: '600', color: C.ink },
  edit: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  editText: { color: C.accent, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  template: {
    width: '48.5%',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    padding: S.md,
    gap: 6,
  },
});
