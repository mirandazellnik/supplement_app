// RatingBar.tsx
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Svg, { Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import { colors } from "../styles/colors";

type Props = {
  rating: number; // 0..5
  max?: number;
  width?: number;
  height?: number;
  style?: ViewStyle;
};

const getFillColor = (percent) => {
  if (percent < 40) return "#FF3B30"; // red
  if (percent < 50) return "#ff8800"; // orange/red
  if (percent < 65) return "#ffa600"; // yellow-orange
  if (percent < 80) return "#1B873B"; // green
  if (percent < 95) return "#0A5F2C"; // dark green
  return "url(#goldGradient)"; // gold metallic
};

const RatingBar: React.FC<Props> = ({
  rating,
  max = 5,
  width = 120,
  height = 22,
  style,
}) => {
  const fillPercent = Math.max(0, Math.min(1, rating / max)) * 100;

  rating = Math.round(rating);

  return (
    <View style={[style]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFD700" />
            <Stop offset="50%" stopColor="#FFEC8B" />
            <Stop offset="100%" stopColor="#FFD700" />
          </LinearGradient>
        </Defs>

        {/* Background bar */}
        <Rect
          x="0"
          y="0"
          width={width}
          height={height}
          rx={height / 2}
          ry={height / 2}
          fill="#E0E0E0"
        />

        {/* Filled portion */}
        <Rect
          x="0"
          y="0"
          width={(fillPercent / 100) * width}
          height={height}
          rx={height / 2}
          ry={height / 2}
          fill={getFillColor(fillPercent)}
        />
      </Svg>
    </View>
  );
};

export default RatingBar;
