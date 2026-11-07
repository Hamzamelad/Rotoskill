import { Pressable, StyleSheet, Text, View } from 'react-native';

import { C, R, S } from '@/constants/theme';
import { formatDuration } from '@/lib/stats';
import type { Metric } from '@/lib/types';

import { Chip } from './ui';

/** One input per metric kind. This is what lets any skill be scored. */
export function MetricInput({
  metric,
  value,
  onChange,
  color,
  defaultDuration,
}: {
  metric: Metric;
  value: number | undefined;
  onChange: (v: number) => void;
  color: string;
  defaultDuration?: number;
}) {
  switch (metric.kind) {
    case 'scale':
      return (
        <View style={styles.scale} accessibilityRole="radiogroup" accessibilityLabel={metric.name}>
          {[1, 2, 3, 4, 5].map((n) => (
            <View key={n} style={{ flex: 1 }}>
              <Chip label={String(n)} selected={value === n} onPress={() => onChange(n)} color={color} />
            </View>
          ))}
        </View>
      );
    case 'boolean':
      return (
        <View style={styles.row}>
          <Chip label="Yes" selected={value === 1} onPress={() => onChange(1)} color={color} />
          <Chip label="No" selected={value === 0} onPress={() => onChange(0)} color={color} />
        </View>
      );
    case 'count':
      return <Stepper value={value ?? 0} onChange={onChange} format={String} step={1} label={metric.name} />;
    case 'duration':
      return (
        <Stepper
          value={value ?? defaultDuration ?? 0}
          onChange={onChange}
          format={formatDuration}
          step={15}
          label={metric.name}
        />
      );
  }
}

function Stepper({
  value,
  onChange,
  format,
  step,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  step: number;
  label: string;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        onPress={() => onChange(Math.max(0, value - step))}
        style={styles.step}>
        <Text style={styles.stepText}>−</Text>
      </Pressable>
      <Text style={styles.value}>{format(value)}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        onPress={() => onChange(value + step)}
        style={styles.step}>
        <Text style={styles.stepText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  scale: { flexDirection: 'row', gap: S.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  step: {
    width: 44,
    height: 44,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 20, color: C.ink },
  value: { minWidth: 56, textAlign: 'center', fontSize: 22, fontWeight: '600', color: C.ink },
});
