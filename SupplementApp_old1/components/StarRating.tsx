// StarRating.tsx
import React from "react";
import { View, StyleSheet, Pressable, ViewStyle } from "react-native";
import Svg, { Path, Rect, Defs, ClipPath } from "react-native-svg";
import { colors } from "../styles/colors";

type Props = {
  rating: number;            // e.g., 3.7
  max?: number;              // default 5
  size?: number;             // star size in px
  gap?: number;              // space between stars
  colorFilled?: string;      // filled color
  colorEmpty?: string;       // empty color
  colorStroke?: string;      // star outline
  onChange?: (val: number) => void;  // optional interactive
  style?: ViewStyle;
  accessibleLabel?: string;
};

const Star = ({
  fraction,
  size,
  colorFilled,
  colorEmpty,
  colorStroke,
  index,
}: {
  fraction: number; // 0..1
  size: number;
  colorFilled: string;
  colorEmpty: string;
  colorStroke: string;
  index: number;
}) => {
  const vb = 24;
  const starPath =
    "M12 2.25l2.938 5.953 6.578.957-4.758 4.64 1.123 6.55L12 17.812 6.12 20.35l1.123-6.55-4.758-4.64 6.578-.957L12 2.25z";

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`}>
      <Defs>
        <ClipPath id={`clip-${index}`}>
          <Rect x="0" y="0" width={vb * fraction} height={vb} />
        </ClipPath>
      </Defs>

      {/* Empty star */}
      <Path d={starPath} fill={colorEmpty} stroke={colorStroke} strokeWidth={1} />

      {/* Filled portion */}
      {fraction > 0 && (
        <Path
          d={starPath}
          fill={colorFilled}
          stroke={colorStroke}
          strokeWidth={1}
          clipPath={`url(#clip-${index})`}
        />
      )}
    </Svg>
  );
};

const StarRating: React.FC<Props> = ({
  rating,
  max = 5,
  size = 22,
  gap = 6,
  colorFilled = colors.primary,
  colorEmpty = "#E0E0E0",
  colorStroke = "#BDBDBD",
  onChange,
  style,
  accessibleLabel = "Star rating",
}) => {
  const stars = [];

  for (let i = 0; i < max; i++) {
    const frac = Math.max(0, Math.min(1, rating - i));

    const starElement = (
      <Star
        key={i}
        index={i}
        fraction={frac}
        size={size}
        colorFilled={colorFilled}
        colorEmpty={colorEmpty}
        colorStroke={colorStroke}
      />
    );

    if (onChange) {
      stars.push(
        <Pressable
          key={i}
          onPress={(e) => {
            const { locationX } = e.nativeEvent;
            const pct = Math.max(0, Math.min(1, locationX / size));
            const step = 0.1; // granularity
            const snapped = Math.round(pct / step) * step;
            onChange(i + snapped);
          }}
          style={{ marginRight: i < max - 1 ? gap : 0 }}
          accessibilityRole="adjustable"
          accessibilityLabel={`${accessibleLabel} star ${i + 1}`}
        >
          {starElement}
        </Pressable>
      );
    } else {
      stars.push(
        <View key={i} style={{ marginRight: i < max - 1 ? gap : 0 }}>
          {starElement}
        </View>
      );
    }
  }

  return <View style={[styles.row, style]}>{stars}</View>;
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
});

export default StarRating;
