import { StyleSheet, View } from 'react-native';

import { S } from '@/constants/theme';

/** Minimal bar chart, one bar per rep. No chart library needed for the MVP. */
export function BarChart({
  values,
  max,
  color,
  height = 64,
  label,
}: {
  values: number[];
  max: number;
  color: string;
  height?: number;
  label: string;
}) {
  const shown = values.slice(-20);
  const top = Math.max(max, 1);
  return (
    <View accessible accessibilityLabel={label} style={[styles.wrap, { height }]}>
      {shown.map((v, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: Math.max(3, (v / top) * height),
            backgroundColor: color,
            opacity: i === shown.length - 1 ? 1 : 0.35,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: S.xs },
});
