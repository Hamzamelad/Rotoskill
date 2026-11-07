import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { C, R, S } from '@/constants/theme';
import { formatDuration } from '@/lib/stats';

export function AudioPlayer({ uri, color }: { uri: string; color: string }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  const toggle = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration - 0.1)) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={status.playing ? 'Pause recording' : 'Play recording'}
        onPress={toggle}
        style={[styles.play, { backgroundColor: color }]}>
        <Text style={styles.playText}>{status.playing ? 'II' : '▶'}</Text>
      </Pressable>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(100, progress * 100)}%`, backgroundColor: color }]} />
        </View>
        <View style={styles.times}>
          <Text style={styles.time}>{formatDuration(status.currentTime)}</Text>
          <Text style={styles.time}>{formatDuration(status.duration)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.lg,
    padding: S.md,
  },
  play: { width: 44, height: 44, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center' },
  playText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  track: { height: 6, borderRadius: 3, backgroundColor: C.border, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontSize: 11, color: C.muted },
});
