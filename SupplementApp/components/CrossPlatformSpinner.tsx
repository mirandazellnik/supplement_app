import React from 'react';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';

interface Props {
  size?: number;      // desired width/height
  color?: string;     // spinner color
  style?: object;     // additional styles
}

const CrossPlatformSpinner: React.FC<Props> = ({ size = 40, color = 'gray', style = {} }) => {
  // Android default spinner is bigger, so we scale it down
  const scale = Platform.OS === 'android' ? size / 36 : size / 20;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center', ...style }}>
      <ActivityIndicator
        color={color}
        size={Platform.OS === 'android' ? 'large' : 'small'}
        style={{ transform: [{ scale }] }}
      />
    </View>
  );
};

export default CrossPlatformSpinner;