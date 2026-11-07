import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Badge, Button, Muted, Screen, Title } from '@/components/ui';
import { C, R, S } from '@/constants/theme';
import { useActions } from '@/lib/store';
import { SKILL_COLORS, TEMPLATES, emptySkill, skillFromTemplate } from '@/lib/templates';

type Mode = 'template' | 'scratch' | 'summary';

const MODES: { id: Mode; title: string; sub: string; soon?: boolean }[] = [
  { id: 'template', title: 'From a template', sub: 'Start with a ready-made pack, then edit it' },
  { id: 'scratch', title: 'From scratch', sub: 'Write your own principles, drills and checklist' },
  { id: 'summary', title: 'From a summary or notes', sub: 'AI drafts the pack for you', soon: true },
];

export default function NewSkillScreen() {
  const actions = useActions();
  const [mode, setMode] = useState<Mode>('template');
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);

  const create = () => {
    let skill;
    if (mode === 'template') {
      const t = TEMPLATES.find((x) => x.id === templateId) ?? TEMPLATES[0];
      skill = skillFromTemplate(t);
      if (name.trim()) skill.name = name.trim();
    } else {
      skill = emptySkill(name.trim() || 'New skill', SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)]);
    }
    actions.addSkill(skill);
    router.replace({ pathname: '/skill/[id]', params: { id: skill.id } });
  };

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        <Button
          title={mode === 'template' ? 'Use this template' : 'Create skill'}
          variant="dark"
          disabled={mode === 'summary' || (mode === 'scratch' && !name.trim())}
          onPress={create}
        />
      }>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.md }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <Text style={{ fontSize: 20, color: C.ink }}>‹</Text>
        </Pressable>
        <Title style={{ fontSize: 24 }}>New skill</Title>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={styles.label} nativeID="nameLabel">
          What do you want to get better at?
        </Text>
        <TextInput
          accessibilityLabelledBy="nameLabel"
          value={name}
          onChangeText={setName}
          placeholder={mode === 'template' ? 'Optional: rename the template' : 'e.g. Articulation'}
          placeholderTextColor={C.muted}
          style={styles.input}
        />
      </View>

      <Text style={styles.label}>How should we build it?</Text>
      <View accessibilityRole="radiogroup" style={{ gap: S.sm }}>
        {MODES.map((m) => {
          const on = m.id === mode;
          return (
            <Pressable
              key={m.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: on, disabled: m.soon }}
              onPress={() => setMode(m.id)}
              style={[styles.mode, { borderColor: on ? C.accent : C.border, borderWidth: on ? 2 : 1 }]}>
              <View style={[styles.radio, on ? { borderWidth: 6, borderColor: C.accent } : null]} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.modeTitle}>{m.title}</Text>
                <Muted>{m.sub}</Muted>
              </View>
              {m.soon ? <Badge label="Soon" /> : null}
            </Pressable>
          );
        })}
      </View>

      {mode === 'template' ? (
        <View style={{ gap: S.sm }}>
          {TEMPLATES.map((t) => {
            const on = t.id === templateId;
            return (
              <Pressable
                key={t.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => setTemplateId(t.id)}
                style={[styles.template, on && { borderColor: t.color, borderWidth: 2 }]}>
                <View style={[styles.swatch, { backgroundColor: t.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modeTitle}>{t.name}</Text>
                  <Muted>
                    {t.drills.length} drills · {t.metrics.length} metrics
                  </Muted>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {mode === 'summary' ? (
        <View style={styles.soon}>
          <Text style={styles.modeTitle}>Coming in a later version</Text>
          <Muted>
            Paste a summary, notes or a video transcript and get principles, drills and a checklist drafted for you.
            For now, start from a template or from scratch.
          </Muted>
        </View>
      ) : null}
    </Screen>
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
  label: { fontSize: 13, fontWeight: '600', color: C.muted },
  input: {
    minHeight: 48,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    fontSize: 16,
    color: C.ink,
  },
  mode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.md,
    minHeight: 56,
  },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#9AA1AD' },
  modeTitle: { fontSize: 15, fontWeight: '600', color: C.ink },
  template: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    padding: S.md,
  },
  swatch: { width: 12, height: 12, borderRadius: 6 },
  soon: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: R.md, padding: S.lg, gap: 6 },
});
