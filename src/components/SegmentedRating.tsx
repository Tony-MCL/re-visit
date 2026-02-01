import React from "react";
import { Pressable, Text, View } from "react-native";
import { theme } from "../ui/theme";
import type { Rating } from "../types/entry";

const options: Array<{ key: Rating; label: string; emoji: string }> = [
  { key: "yes", label: "Ja", emoji: "🙂" },
  { key: "neutral", label: "Nøytral", emoji: "😐" },
  { key: "no", label: "Nei", emoji: "🙁" },
];

export default function SegmentedRating({
  value,
  onChange,
}: {
  value: Rating | null;
  onChange: (r: Rating) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {options.map((opt, idx) => {
        const active = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 10,
              backgroundColor: active ? theme.card : "transparent",
              borderLeftWidth: idx === 0 ? 0 : 1,
              borderLeftColor: theme.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: theme.text, fontWeight: "800" }}>
              {opt.emoji} {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
