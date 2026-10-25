import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

export const ProBadge = ({ locked }: { locked: boolean }) => (
  <View style={styles.badge} pointerEvents="none" accessible={false}>
    {locked && (
      <Svg width={10} height={12} viewBox="0 0 10 12">
        <Path
          d="M2.5 5V3a2.5 2.5 0 0 1 5 0v2"
          stroke="#17120B"
          strokeWidth={1.4}
          fill="none"
        />
        <Rect x={1} y={5} width={8} height={6} rx={1.3} fill="#17120B" />
      </Svg>
    )}
    <Text style={styles.text}>PRO</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: 7,
    bottom: 7,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: { color: '#17120B', fontSize: 10, fontWeight: '800' },
});
