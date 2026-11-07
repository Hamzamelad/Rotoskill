import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { C, R, S } from '@/constants/theme';

export function Screen({
  children,
  scroll = true,
  dark = false,
  edges = ['top'],
  footer,
}: {
  children: ReactNode;
  scroll?: boolean;
  dark?: boolean;
  edges?: Edge[];
  footer?: ReactNode;
}) {
  const bg = dark ? C.ink : C.bg;
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: bg }}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }]}>{children}</View>
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function Title({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Label({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  variant?: 'primary' | 'dark' | 'secondary' | 'ghost';
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, variant = 'primary', color = C.accent, style, disabled, ...rest }: ButtonProps) {
  const bg =
    variant === 'primary' ? color : variant === 'dark' ? C.ink : variant === 'secondary' ? C.card : 'transparent';
  const fg = variant === 'primary' || variant === 'dark' ? '#FFFFFF' : variant === 'ghost' ? color : C.ink;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        variant === 'secondary' && { borderWidth: 1, borderColor: C.border },
        variant === 'ghost' && { minHeight: 36, paddingHorizontal: 0 },
        style,
      ]}
      {...rest}>
      <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  color = C.accent,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        selected ? { backgroundColor: color, borderColor: color } : { backgroundColor: C.bg, borderColor: C.border },
      ]}>
      <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : C.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, color = C.ink, bg = C.divider }: { label: string; color?: string; bg?: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: S.md }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  content: { padding: S.xl, paddingBottom: 40, gap: S.lg },
  footer: { paddingHorizontal: S.xl, paddingTop: S.sm, paddingBottom: S.lg, gap: S.sm },
  title: { fontSize: 30, fontWeight: '700', color: C.ink, letterSpacing: -0.5 },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 1, color: C.muted, textTransform: 'uppercase' },
  muted: { fontSize: 13, color: C.muted, lineHeight: 18 },
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.lg,
    padding: S.lg,
    gap: S.md,
  },
  button: {
    minHeight: 52,
    borderRadius: R.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S.lg,
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  chip: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: S.md,
    borderRadius: R.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  badge: { borderRadius: R.pill, paddingHorizontal: S.sm, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
