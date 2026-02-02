import React from "react";
import { Pressable, Text, View } from "react-native";
import { theme } from "../ui/theme";
import type { Rating } from "../types/entry";
import { t } from "../i18n/i18n";

const options: Array<{ key: Rating; emoji: string }> = [
  { key: "yes", emoji: "🙂" },
  { key: "neutral", emoji: "😐" },
  { key: "no", emoji: "🙁" },
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
        backgroundColor: theme.surface,
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
              paddingVertical: 12,
              paddingHorizontal: 10,
              backgroundColor: active ? theme.card : "transparent",
              borderLeftWidth: idx === 0 ? 0 : 1,
              borderLeftColor: theme.border,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 6,
            }}
          >
            {active ? (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: theme.accent,
                }}
              />
            ) : null}

            <Text
              style={{
                color: active ? theme.text : theme.muted,
                fontWeight: active ? "900" : "700",
              }}
            >
              {opt.emoji} {t(`capture.rating.${opt.key}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
